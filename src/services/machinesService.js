import { supabase } from '@/lib/supabase'

export const machinesService = {
    // GET /machines
    list: async () => {
        const { data, error } = await supabase
            .from('machines')
            .select('*')
            .order('name')
        if (error) throw error
        return data
    },

    // GET /machines/:id
    getById: async (id) => {
        const { data, error } = await supabase
            .from('machines')
            .select('*')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    // POST /machines (Admin only via RLS)
    create: async (machineData) => {
        const { data, error } = await supabase
            .from('machines')
            .insert([machineData])
            .select()
        if (error) throw error
        return data[0]
    },

    // PUT /machines/:id
    update: async (id, changes) => {
        const { data, error } = await supabase
            .from('machines')
            .update(changes)
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    // DELETE /machines/:id
    delete: async (id) => {
        const { error } = await supabase
            .from('machines')
            .delete()
            .eq('id', id)
        if (error) throw error
    }
}
