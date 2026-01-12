import { supabase } from '@/lib/supabase'

export const ticketsService = {
    // Listar chamados com dados da máquina populados
    list: async (filters = {}) => {
        let query = supabase
            .from('support_tickets')
            .select(`
                *,
                machines (
                    id,
                    name,
                    brand,
                    model,
                    machine_type
                )
            `)
            .order('created_date', { ascending: false })

        if (filters.status) {
            query = query.eq('status', filters.status)
        }

        // Se houver filtro de busca (termo), seria mais complexo com join, 
        // por enquanto mantemos filtro simples por status

        const { data, error } = await query
        if (error) throw error
        return data
    },

    create: async (ticketData) => {
        const { data, error } = await supabase
            .from('support_tickets')
            .insert(ticketData)
            .select()
            .single()

        if (error) throw error
        return data
    },

    updateStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                machines (*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }
}
