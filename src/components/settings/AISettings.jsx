import { useState, useEffect } from 'react'
import { aiService } from '@/services/aiService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Bot, PlayCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Simple Label component standard
function Label({ children, htmlFor }) {
    return <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">{children}</label>
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PROVIDER_PRESETS = {
    'openai': { label: 'OpenAI', base_url: 'https://api.openai.com/v1', model: 'gpt-4-turbo-preview' },
    'google': { label: 'Google Gemini', base_url: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-1.5-flash' },
    'groq': { label: 'Groq', base_url: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' },
    'openrouter': { label: 'OpenRouter', base_url: 'https://openrouter.ai/api/v1', model: 'anthropic/claude-3-opus' },
    'local': { label: 'Local (Ollama)', base_url: 'http://localhost:11434/v1', model: 'llama3' },
    'custom': { label: 'Outro (Customizado)', base_url: '', model: '' }
}

export function AISettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)

    // Config State
    const [config, setConfig] = useState({
        provider: 'openai',
        base_url: 'https://api.openai.com/v1',
        api_key: '',
        model: 'gpt-4-turbo-preview',
        system_prompt: ''
    })

    // Test State
    const [testProblem, setTestProblem] = useState('Motor aquecendo muito e perdendo força em subidas.')
    const [testResult, setTestResult] = useState(null)

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        try {
            const data = await aiService.getConfig()
            if (data) {
                // Tenta inferir o provider atual se não bater com a lista (backwards compatibility)
                if (!Object.keys(PROVIDER_PRESETS).includes(data.provider)) {
                    // Se for desconhecido, marca como custom
                    setConfig({ ...data, provider: 'custom' })
                } else {
                    setConfig(data)
                }
            }
        } catch (error) {
            console.error('Erro ao carregar config IA:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleProviderChange = (value) => {
        const preset = PROVIDER_PRESETS[value]
        if (preset) {
            setConfig({
                ...config,
                provider: value,
                base_url: preset.base_url, // Auto-fill
                model: preset.model        // Auto-fill
            })
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await aiService.saveConfig(config)
            alert('Configurações salvas com sucesso!')
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleTest = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            // Mock machine context for test
            const mockMachine = { brand: 'Teste', model: 'X1000' }

            // First save implementation requires actual save to work best, 
            // but here we can just pass current config if we refactor verify
            // For now, let's assume user saved first or we warn them
            if (!config.api_key) {
                alert('Salve uma API Key primeiro.')
                setTesting(false)
                return
            }

            const result = await aiService.analyzeProblem(mockMachine, testProblem)
            setTestResult(result)
        } catch (error) {
            console.error(error)
            setTestResult({ error: error.message })
        } finally {
            setTesting(false)
        }
    }

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /> Carregando...</div>

    return (
        <div className="space-y-8">
            <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b">
                    <Bot className="h-6 w-6 text-purple-600" />
                    <h2 className="text-lg font-medium">Configuração do Brain (IA)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="provider">Provedor IA</Label>
                        <Select
                            value={config.provider}
                            onValueChange={handleProviderChange}
                        >
                            <SelectTrigger id="provider">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PROVIDER_PRESETS).map(([key, item]) => (
                                    <SelectItem key={key} value={key}>{item.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-gray-400 mt-1">
                            {config.provider === 'google'
                                ? "Modo nativo Google ativado. Chave do AI Studio."
                                : "Ajusta automaticamente URL e Modelo."}
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                            id="model"
                            value={config.model}
                            onChange={e => setConfig({ ...config, model: e.target.value })}
                            placeholder="gpt-4-turbo-preview"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            {config.provider.toLowerCase().includes('google')
                                ? "Sugestão: gemini-1.5-flash ou gemini-1.5-pro"
                                : "Sugestão: gpt-4-turbo-preview ou gpt-3.5-turbo"}
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={async () => {
                                if (!config.api_key) return alert("Insira a chave primeiro")
                                setTesting(true)
                                try {
                                    // Pass provider and base_url to helper
                                    const res = await aiService.listModels(config.api_key, config.provider, config.base_url)

                                    let models = []
                                    if (res.models) {
                                        // Google format
                                        models = res.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                                            .map(m => m.name)
                                    } else if (res.data) {
                                        // OpenAI format (data: [{id: ...}, ...])
                                        models = res.data.map(m => m.id).sort()
                                    } else {
                                        // Unknown fallback
                                        models = res
                                    }

                                    setTestResult({
                                        message: `Modelos Disponíveis (${config.provider}):`,
                                        models: models
                                    })
                                } catch (err) {
                                    setTestResult({ error: err.message })
                                } finally {
                                    setTesting(false)
                                }
                            }}
                        >
                            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : '📋 Ver Modelos Disponíveis (Debug)'}
                        </Button>
                    </div>
                </div>


                <div>
                    <Label htmlFor="api_key">API Key (OpenAI)</Label>
                    <Input
                        id="api_key"
                        type="password"
                        value={config.api_key}
                        onChange={e => setConfig({ ...config, api_key: e.target.value })}
                        placeholder="sk-..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Sua chave é salva de forma segura no banco de dados da sua empresa.</p>

                    {config.provider === 'openai' && config.api_key && !config.api_key.startsWith('sk-') && (
                        <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Parece ser uma chave inválida (Chaves OpenAI começam com 'sk-')</p>
                    )}
                    {config.provider === 'google' && config.api_key && !config.api_key.startsWith('AIza') && (
                        <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Parece ser uma chave inválida (Chaves Google começam com 'AIza')</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="prompt">Prompt do Especialista (System Prompt)</Label>
                    <Textarea
                        id="prompt"
                        rows={10}
                        value={config.system_prompt}
                        onChange={e => setConfig({ ...config, system_prompt: e.target.value })}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Variáveis disponíveis: {'${machine_brand}, ${machine_model}, ${problem_description}'}</p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!saving && <Save className="mr-2 h-4 w-4" />}
                        Salvar Configurações
                    </Button>
                </div>
            </form >

            {/* Test Area */}
            < Card >
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <PlayCircle className="h-5 w-5" />
                        Playground de Teste
                    </CardTitle>
                    <CardDescription>Simule uma análise para validar o prompt e a chave.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Problema de Teste</Label>
                        <div className="flex gap-2">
                            <Input
                                value={testProblem}
                                onChange={e => setTestProblem(e.target.value)}
                            />
                            <Button onClick={handleTest} disabled={testing} variant="outline">
                                {testing ? <Loader2 className="animate-spin" /> : 'Analisar'}
                            </Button>
                        </div>
                    </div>

                    {testResult && (
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[400px] text-xs font-mono">
                            <pre>{JSON.stringify(testResult, null, 2)}</pre>
                        </div>
                    )}
                </CardContent>
            </Card >
        </div >
    )
}
