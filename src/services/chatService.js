import { supabase } from '@/lib/supabase'

export const chatService = {
    // Criar nova sessão
    createSession: async (machineId, title) => {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({ machine_id: machineId, title })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Listar sessões (opcional para sidebar)
    listSessions: async () => {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*, machines(name, model)')
            .order('updated_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Pegar mensagens de uma sessão
    getMessages: async (sessionId) => {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data
    },

    // Adicionar mensagem
    addMessage: async (sessionId, role, content) => {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({ session_id: sessionId, role, content })
            .select()
            .single()

        // Atualiza timestamp da sessão
        await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date() })
            .eq('id', sessionId)

        if (error) throw error
        return data
    }
}
