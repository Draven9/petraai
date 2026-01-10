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
    }
}
