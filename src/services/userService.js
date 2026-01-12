import { supabase } from '@/lib/supabase'

export const userService = {
    updateProfile: async (userId, updates) => {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()

        if (error) throw error
        return data[0]
    },

    listAll: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('full_name') // ou created_at

        if (error) throw error
        return data
    },

    updateRole: async (userId, newRole) => {
        const { data, error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)
            .select()

        if (error) throw error
        return data[0]
    }
}
