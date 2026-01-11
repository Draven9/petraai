import { supabase } from '@/lib/supabase'

export const manualsService = {
    list: async () => {
        const { data, error } = await supabase
            .from('technical_manuals')
            .select('*')
            .order('title')
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
    }
}
