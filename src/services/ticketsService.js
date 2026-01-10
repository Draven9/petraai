import { supabase } from '@/lib/supabase'

export const ticketsService = {
    list: async () => {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, machines(name, model)') // Join básico para trazer nome da máquina
            .order('created_date', { ascending: false })
        if (error) throw error
        return data
    },

    create: async (ticketData) => {
        const { data, error } = await supabase
            .from('support_tickets')
            .insert([ticketData])
            .select()
        if (error) throw error
        return data[0]
    },

    updateStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('support_tickets')
            .update({ status, updated_date: new Date() })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    }
}
