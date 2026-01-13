import { supabase } from '@/lib/supabase'
import { aiService } from './aiService'
import * as pdfjsLib from 'pdfjs-dist'

// Configure worker for PDF.js (CDN for simplicity in dev)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export const manualsService = {
    list: async (searchTerm = '') => {
        let query = supabase
            .from('technical_manuals')
            .select('*')
            .order('title')

        if (searchTerm) {
            const term = `%${searchTerm}%`
            query = query.or(`title.ilike.${term},machine_type.ilike.${term},content_extracted.ilike.${term}`)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    create: async (manualData) => {
        const { data, error } = await supabase
            .from('technical_manuals')
            .insert([manualData])
            .select()
        if (error) throw error
        return data[0]
    },

    delete: async (id) => {
        // Cascade delete on embeddings is handled by DB FK
        const { error } = await supabase
            .from('technical_manuals')
            .delete()
            .eq('id', id)
        if (error) throw error
    },

    upload: async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('manuals')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('manuals')
            .getPublicUrl(filePath)

        return { publicUrl, fileName: file.name }
    },

    // Process PDF: Extract Text -> Chunk -> Bed -> Store
    processManual: async (manualId, file) => {
        try {
            console.log(`Processing manual ${manualId}...`)

            // 1. Extract Text
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            let fullText = ""

            console.log(`PDF loaded. Pages: ${pdf.numPages}`)

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items.map(item => item.str).join(' ')
                fullText += pageText + "\n"
            }

            // Update main record with extracted text (searchable fallback)
            await supabase.from('technical_manuals')
                .update({ content_extracted: fullText })
                .eq('id', manualId)

            // 2. Chunking (Simple strategy: 1000 chars ~ 200 tokens, overlap 200)
            const chunkSize = 1000
            const overlap = 200
            const chunks = []

            for (let i = 0; i < fullText.length; i += (chunkSize - overlap)) {
                chunks.push(fullText.slice(i, i + chunkSize))
            }

            console.log(`Created ${chunks.length} chunks. Generating embeddings...`)

            // 3. Generate Embeddings & Store
            // Process in batches to avoid rate limits
            for (const chunk of chunks) {
                if (!chunk || chunk.length < 50) continue // Skip tiny chunks

                const embedding = await aiService.generateEmbedding(chunk)

                await supabase.from('manual_embeddings').insert({
                    manual_id: manualId,
                    content: chunk,
                    embedding: embedding,
                    metadata: { source: 'pdf_upload' }
                })
            }

            console.log("Processing complete.")
            return true

        } catch (error) {
            console.error("Error processing manual:", error)
            throw error
        }
    },

    // RAG Search
    search: async (queryText) => {
        try {
            const embedding = await aiService.generateEmbedding(queryText)

            const { data, error } = await supabase.rpc('match_manuals', {
                query_embedding: embedding,
                match_threshold: 0.5, // Similarity threshold
                match_count: 5 // Top 5 chunks
            })

            if (error) throw error
            return data
        } catch (error) {
            console.error("Search error:", error)
            return []
        }
    }
}
