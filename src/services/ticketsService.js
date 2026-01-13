import { supabase } from '@/lib/supabase'

export const ticketsService = {
    // Listar chamados com paginação e filtros
    list: async ({ page = 1, pageSize = 20, status = null, search = '' } = {}) => {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

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
            `, { count: 'exact' })
            .order('created_date', { ascending: false })
            .range(from, to)

        if (status) {
            query = query.eq('status', status)
        }

        if (search) {
            query = query.ilike('problem_description', `%${search}%`)
        }

        const { data, count, error } = await query
        if (error) throw error
        return { data, count }
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
    },

    getStats: async () => {
        const { count: open } = await supabase
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'resolved')

        const { count: highUrgency } = await supabase
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('urgency', 'high')
            .neq('status', 'resolved')

        return { open, highUrgency }
    }
}
