import { companyService } from './companyService'

const DEFAULT_PROMPT = `Você é um especialista em manutenção de máquinas agrícolas, com experiência prática em diagnóstico, reparo e manutenção preventiva de tratores, colheitadeiras e implementos agrícolas.

Você atuará em um sistema de suporte técnico que consulta manuais de fabricantes para auxiliar mecânicos na solução de problemas.

Diretrizes:

Utilize somente informações presentes nos manuais técnicos disponíveis no sistema

Apresente diagnósticos baseados em sintomas relatados

Liste possíveis causas em ordem de probabilidade

Descreva procedimentos de verificação e correção passo a passo

Utilize linguagem técnica profissional, objetiva e segura

Quando a informação não estiver disponível no manual, informe explicitamente

Seu objetivo é reduzir tempo de diagnóstico, evitar erros de manutenção e garantir a correta execução dos procedimentos.

Nunca invente procedimentos

Sempre cite o componente ou sistema envolvido

MÁQUINA: \${machine_brand} \${machine_model}
PROBLEMA: \${problem_description}

Retorne JSON com:
- possible_causes (array)
- suggested_solutions (array)
- parts_to_check (array)
- checklist (array)
`

export const aiService = {
    // Recupera configurações da empresa atual
    getConfig: async () => {
        const company = await companyService.getData()
        if (!company) return null

        return {
            provider: company.ai_settings?.provider || 'openai',
            base_url: company.ai_settings?.base_url || 'https://api.openai.com/v1',
            api_key: company.ai_settings?.api_key || '',
            model: company.ai_settings?.model || 'gpt-4-turbo-preview',
            system_prompt: company.ai_settings?.system_prompt || DEFAULT_PROMPT
        }
    },

    // Salva configurações
    saveConfig: async (settings) => {
        // Precisamos do ID da empresa. companyService.getData() pega a primeira.
        const company = await companyService.getData()
        if (!company) throw new Error("Empresa não encontrada")

        await companyService.update(company.id, {
            ai_settings: settings
        })
    },

    // Executa análise IA
    analyzeProblem: async (machine, problemDescription) => {
        const config = await aiService.getConfig()

        if (!config || !config.api_key) {
            throw new Error("API Key não configurada. Acesse Configurações > Inteligência Artificial.")
        }

        // Check if provider involves Google/Gemini for native handling
        const isGoogle = config.provider?.toLowerCase().includes('google') ||
            config.provider?.toLowerCase().includes('gemini')

        // Interpolação do Prompt
        const prompt = config.system_prompt
            .replace('\${machine_brand}', machine.brand || 'Genérica')
            .replace('\${machine_model}', machine.model || 'Padrão')
            .replace('\${problem_description}', problemDescription)

        try {
            let responseData;

            if (isGoogle) {
                // Native Google Logic
                // Use default if empty, but respect config.base_url
                const baseUrl = (config.base_url || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '')
                // Ensure model doesn't already have 'models/' prefix
                const modelName = config.model.startsWith('models/') ? config.model : `models/${config.model}`
                const googleUrl = `${baseUrl}/${modelName}:generateContent?key=${config.api_key}`

                const response = await fetch(googleUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: "Responda APENAS com JSON: " + prompt }]
                        }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'Erro na API do Google')
                }

                const data = await response.json()
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                if (!text) throw new Error("Resposta vazia do Google")

                responseData = JSON.parse(text)

            } else {
                // Compatible OpenAI Logic (OpenAI, Groq, OpenRouter, etc)
                // Remove trailing slash if present to avoid //v1
                let baseUrl = (config.base_url || 'https://api.openai.com/v1').replace(/\/$/, '')
                const endpoint = `${baseUrl}/chat/completions`

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.api_key}`
                    },
                    body: JSON.stringify({
                        model: config.model,
                        messages: [
                            { role: "system", content: "You are a helpful assistant designed to output JSON." },
                            { role: "user", content: prompt }
                        ],
                        response_format: { type: "json_object" }
                    })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'Erro na API da IA')
                }

                const data = await response.json()
                responseData = JSON.parse(data.choices[0].message.content)
            }

            return responseData

        } catch (error) {
            console.error("AI Error:", error)
            throw error // Repassar erro para UI
        }
    },

    // Chat Contínuo (Histórico)
    sendMessage: async (machine, history) => {
        const config = await aiService.getConfig()
        if (!config || !config.api_key) throw new Error("API Key faltante")

        // 1. System Prompt com Contexto
        const systemInstruction = `Você é um assistente técnico especialista.
Máquina em foco: ${machine.name} (${machine.brand} ${machine.model}).
Responda dúvidas técnicas, explique procedimentos e ajude no diagnóstico.
Seja direto, profissional e seguro. Use formatação Markdown.`

        // 2. Preparar Mensagens
        // OpenAI format: [{role: 'system', ...}, {role: 'user', ...}]
        // Google format: contents: [{role: 'user', parts: []}, {role: 'model', parts: []}]

        const isGoogle = config.provider?.toLowerCase().includes('google')

        try {
            if (isGoogle) {
                // Adapter Google Gemini
                // Note: Gemini API uses 'user' and 'model' roles. And System instructions are separate in beta, or just prepended.
                // We will prepend system prompt to first user message or use formatted history.

                const googleContents = history.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content }]
                }))

                // Add System Prompt Context to the last message or as a separate turn? 
                // Best for simple implementations: Prepend to the LATEST user message or formatting.
                // Let's prepend to the very first message if possible, or just add context string.

                // For simplicity/robustness: Just use the latest message with full history context is standard RAG, but here we pass full history.
                // We'll trust the model to read the history.
                // We inject the "System Instruction" as a prefix to the valid history or a virtual system message if supported (Gemini v1beta supports system_instruction now, but let's stick to prompt injection for compatibility).

                if (googleContents.length > 0 && googleContents[0].role === 'user') {
                    googleContents[0].parts[0].text = systemInstruction + "\n\n" + googleContents[0].parts[0].text
                } else {
                    // If history starts with model (rare) or empty
                    googleContents.unshift({ role: 'user', parts: [{ text: systemInstruction }] })
                }

                const baseUrl = (config.base_url || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '')
                const modelName = config.model.startsWith('models/') ? config.model : `models/${config.model}`
                const url = `${baseUrl}/${modelName}:generateContent?key=${config.api_key}`

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: googleContents })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'Google API Error')
                }

                const data = await response.json()
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                return text

            } else {
                // OpenAI Adapter
                const messages = [
                    { role: "system", content: systemInstruction },
                    ...history.map(msg => ({
                        role: msg.role,
                        content: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content
                    }))
                ]

                let baseUrl = (config.base_url || 'https://api.openai.com/v1').replace(/\/$/, '')
                const response = await fetch(`${baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.api_key}`
                    },
                    body: JSON.stringify({
                        model: config.model,
                        messages: messages
                    })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'AI API Error')
                }

                const data = await response.json()
                return data.choices[0].message.content
            }
        } catch (error) {
            console.error("Chat Error:", error)
            throw error
        }
    },
    listModels: async (apiKey, provider, baseUrl) => {
        try {
            const isGoogle = provider?.toLowerCase().includes('google')

            if (isGoogle) {
                // Google Native List
                const url = (baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '')
                const response = await fetch(`${url}/models?key=${apiKey}`)
                const data = await response.json()
                return data
            } else {
                // OpenAI Compatible List (GET /models)
                const url = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')
                const response = await fetch(`${url}/models`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
                    throw new Error(err.error?.message || `Erro ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()
                return data
            }
        } catch (error) {
            console.error("Erro ao listar modelos:", error)
            return { error: error.message }
        }
    }
}
