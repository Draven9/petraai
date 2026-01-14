
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugBuckets() {
    console.log("--- Probing Specific Buckets ---")

    // Probe intended buckets
    const bucketsToProbe = ['manual-pages', 'companies', 'manuals']

    for (const id of bucketsToProbe) {
        console.log(`\nBucket ID: [${id}]`)

        // List top level files
        const { data: files, error: listError } = await supabase.storage.from(id).list()

        if (listError) {
            console.error(`  Error listing files in ${id}:`, listError)
        } else {
            console.log(`  Found ${files?.length || 0} items:`)
            if (files) {
                files.slice(0, 10).forEach(f => console.log(`    - ${f.name} (${f.id ? 'file' : 'folder?'})`))
                if (files.length > 10) console.log(`    ... and ${files.length - 10} more`)
            }
        }
    }
}

debugBuckets()
