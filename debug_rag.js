
import { createClient } from '@supabase/supabase-js'

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// Load env (hacky way for script)
// We'll try to read .env or just hardcode if we can't find it easily, 
// but better to assume the user environment has the keys or we can read them from the app config?
// Actually, `src/lib/supabase.js` uses `import.meta.env`. Node doesn't like that.
// I'll assume standard VITE_ env vars are available or I'll try to read the .env.local file.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
const envLocalPath = path.resolve(__dirname, '../.env.local')

// Hardcoded for debug
const supabaseUrl = 'https://sdpbykgxingwchogwspf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGJ5a2d4aW5nd2Nob2d3c3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjkwNDcsImV4cCI6MjA4MzY0NTA0N30.9IG5uMhaEWErjAE7_RxRbr2fsZEDViqPdSvBk8Hu0HM'

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Credentials")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runDebug() {
    console.log("--- DEBUGGING RAG ---")

    // 1. Check last 3 embeddings (descriptions)
    console.log("\n1. Latest Page Embeddings (Descriptions):")
    const { data: latest, error: errLatest } = await supabase
        .from('manual_pages_embeddings')
        .select('id, page_number, image_description')
        .order('created_at', { ascending: false })
        .limit(3)

    if (errLatest) console.error(errLatest)
    else {
        latest.forEach(r => {
            console.log(`[ID: ${r.id} | Page ${r.page_number}] ${r.image_description.substring(0, 150)}...`)
        })
    }

    // 2. Perform Search Test
    const query = "buzina"
    console.log(`\n2. Testing Search for: '${query}'`)

    // We need an embedding for 'buzina'. 
    // Since we can't easily call OpenAI/Gemini here without re-implementing aiService headers/config...
    // We'll skip the actual vector search simulation unless I replicate aiService.js logic completely.
    // simpler: Just checking the DESCRIPTIONS above enables me to see if "buzina" or "horn" is there. 
    // If "buzina" is in the text, keyword search would find it, but vector search might struggle if not exact.

    // But wait, I can use a simple SQL ILIKE check to see if "buzina" exists in the descriptions at all.
    const { data: ilikeCheck, error: errIlike } = await supabase
        .from('manual_pages_embeddings')
        .select('id, page_number, image_description')
        .ilike('image_description', `%${query}%`)

    if (errIlike) console.error(errIlike)
    else {
        console.log(`\nFound ${ilikeCheck.length} exact text matches for '${query}':`)
        ilikeCheck.forEach(r => console.log(`- Page ${r.page_number}: ${r.image_description.substring(0, 100)}...`))
    }
}

runDebug()
