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
    }
}
