import { supabase } from '@/lib/supabase'
import { aiService } from './aiService'
import * as pdfjsLib from 'pdfjs-dist'

// Configure worker for PDF.js (CDN for simplicity in dev)
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`

export const manualsService = {
    list: async ({ page = 1, pageSize = 20, search = '', type = 'all', brand = 'all' } = {}) => {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase
            .from('technical_manuals')
            .select('*', { count: 'exact' })
            .order('title')
            .range(from, to)

        if (search) {
            const term = `%${search}%`
            query = query.or(`title.ilike.${term},machine_type.ilike.${term},content_extracted.ilike.${term}`)
        }

        if (type && type !== 'all') {
            query = query.eq('machine_type', type)
        }

        if (brand && brand !== 'all') {
            query = query.ilike('brand', brand) // ilike for brand to be safer?
        }

        const { data, count, error } = await query
        if (error) throw error
        return { data, count }
    },

    getFilters: async () => {
        // Fetch specific columns to build filter lists
        const { data, error } = await supabase
            .from('technical_manuals')
            .select('machine_type, brand')

        if (error) throw error

        // Extract unique values in JS (lightweight enough for metadata)
        const types = [...new Set(data.map(i => i.machine_type))].filter(Boolean).sort()
        const brands = [...new Set(data.map(i => i.brand))].filter(Boolean).sort()

        return { types, brands }
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
        try {
            // 1. Get manual details to find file path
            const { data: manual, error: fetchError } = await supabase
                .from('technical_manuals')
                .select('file_url, file_name') // file_name fallback
                .eq('id', id)
                .single()

            if (fetchError) {
                console.warn("Could not fetch manual for cleanup:", fetchError)
                // Proceed to delete record anyway? Yes, to avoid stuck records.
            } else {
                // 2. Delete PDF from 'manuals' bucket
                // Extract path from URL or use file_name if available
                let filePath = manual.file_name
                if (!filePath && manual.file_url) {
                    const urlParts = manual.file_url.split('/')
                    filePath = urlParts[urlParts.length - 1]
                }

                if (filePath) {
                    const { error: storageError } = await supabase.storage
                        .from('manuals')
                        .remove([filePath])
                    if (storageError) console.warn("Error deleting PDF file:", storageError)
                }

                // 3. Delete Page Images from 'manual-pages' bucket
                // Images are stored in folder: {manualId}/
                const { data: files, error: listError } = await supabase.storage
                    .from('manual-pages')
                    .list(`${id}`)

                if (listError) {
                    console.warn("Error listing manual pages:", listError)
                } else {
                    console.log(`Cleanup: Found ${files?.length || 0} images to delete for manual ${id}`)
                    if (files && files.length > 0) {
                        const pathsToDelete = files.map(f => `${id}/${f.name}`)
                        const { error: deletePagesError } = await supabase.storage
                            .from('manual-pages')
                            .remove(pathsToDelete)

                        if (deletePagesError) console.warn("Error deleting manual pages:", deletePagesError)
                        else console.log("Cleanup: Images deleted successfully.")
                    }
                }
            }

            // 4. Delete DB Record
            const { error } = await supabase
                .from('technical_manuals')
                .delete()
                .eq('id', id)
            if (error) throw error

            // Also should delete embeddings? 
            // Postgres CASCADE deletion should handle 'manual_embeddings' and 'manual_pages_embeddings'
            // if defined in schema. Assuming yes based on migration 014/005.

        } catch (error) {
            console.error("Delete manual error:", error)
            throw error
        }
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

    // Process PDF Images: Page -> Image -> Vision AI -> Describe -> Embedding
    processManualImages: async (manualId, file, onProgress) => {
        try {
            console.log(`Processing images for manual ${manualId}...`)
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

            const totalPages = pdf.numPages
            let successCount = 0

            for (let i = 1; i <= totalPages; i++) {
                try {
                    if (onProgress) onProgress(`Processando visualmente página ${i}/${totalPages}...`)

                    // Artificial Delay to avoid Rate Limits (2s)
                    await new Promise(r => setTimeout(r, 2000))

                    const page = await pdf.getPage(i)
                    const viewport = page.getViewport({ scale: 1.5 }) // Good quality for OCR/Vision

                    // Render to canvas
                    const canvas = document.createElement('canvas')
                    const context = canvas.getContext('2d')
                    canvas.height = viewport.height
                    canvas.width = viewport.width

                    await page.render({ canvasContext: context, viewport: viewport }).promise

                    // Convert to Blob/File
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8))

                    // Upload to Storage
                    const fileName = `${manualId}/page_${i}.jpg`
                    const { error: uploadError } = await supabase.storage
                        .from('manual-pages')
                        .upload(fileName, blob, { upsert: true })

                    if (uploadError) {
                        console.error(`Error uploading page ${i}:`, uploadError)
                        continue // Skip AI if upload failed
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('manual-pages')
                        .getPublicUrl(fileName)

                    // Get Description from Vision AI
                    const base64DataUrl = canvas.toDataURL('image/jpeg', 0.8)

                    // Call Vision AI
                    let description = ""
                    try {
                        description = await aiService.describeImage(base64DataUrl)
                    } catch (visionErr) {
                        console.warn(`Vision AI failed for page ${i}:`, visionErr)
                        // Verify if we should abort or continue. 
                        // Let's continue but maybe try to save partial data or just skip embedding?
                        // If vision fails, embedding will fit bad data. Let's skip embedding.
                        continue;
                    }

                    // Generate Embedding for the description
                    const embedding = await aiService.generateEmbedding(description)

                    // Save to DB
                    const { error: dbError } = await supabase.from('manual_pages_embeddings').insert({
                        manual_id: manualId,
                        page_number: i,
                        image_path: publicUrl,
                        image_description: description,
                        embedding: embedding,
                        metadata: { source: 'pdf_vision' }
                    })

                    if (dbError) {
                        console.error(`DB Insert Error page ${i}:`, dbError)
                    } else {
                        successCount++
                    }

                } catch (pageError) {
                    console.error(`CRITICAL Error processing page ${i}:`, pageError)
                    // Continue to next page despite error
                }
            }

            console.log(`Finished. Successfully processed ${successCount}/${totalPages} pages.`)
            return { success: true, total: totalPages, processed: successCount, failed: totalPages - successCount }
        } catch (error) {
            console.error("Fatal error in manual processing loop:", error)
            throw error
        }
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
