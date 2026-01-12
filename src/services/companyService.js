import { supabase } from '@/lib/supabase'

export const companyService = {
    // Busca os dados da primeira empresa encontrada (Supõe-se Single Tenant por enquanto)
    getData: async () => {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .limit(1)
            .single()

        // Se não houver empresa criada, retorna null mas não erro
        if (error && error.code === 'PGRST116') return null
        if (error) throw error
        return data
    },

    // Cria ou Atualiza
    upsert: async (companyData) => {
        const { data, error } = await supabase
            .from('companies')
            .upsert(companyData)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Apenas Atualiza (útil para patches parciais sem violar constraints de insert)
    update: async (id, companyData) => {
        const { data, error } = await supabase
            .from('companies')
            .update(companyData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    uploadLogo: async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `logo_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('companies')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('companies')
            .getPublicUrl(filePath)

        return publicUrl
    }
}
