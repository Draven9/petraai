import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Lock, BookOpen, Shield } from 'lucide-react'

export default function DocumentationPage() {
    const { isAdmin } = useAuth()

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
                <p className="text-gray-500 max-w-md">
                    Esta página contém documentação técnica sensível e está disponível apenas para administradores do sistema.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)] flex items-center gap-2">
                    <BookOpen className="w-8 h-8" />
                    Documentação do Sistema
                </h1>
                <p className="text-gray-500 text-lg">
                    Guia de referência para administradores e técnicos da PetraAI.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h5 className="font-semibold text-blue-800 mb-1">Modo Administrador</h5>
                    <p className="text-sm text-blue-600">
                        Você tem acesso total às configurações de IA, gestão de usuários e logs do sistema.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">

                {/* Seção 1: Arquitetura */}
                <Card>
                    <CardHeader>
                        <CardTitle>1. Arquitetura do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-stone max-w-none text-gray-600">
                        <p>O <strong>PetraAI Omni App</strong> é construído sobre uma arquitetura moderna e escalável:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Frontend:</strong> React 19, Vite, TailwindCSS e Shadcn UI.</li>
                            <li><strong>Backend/Database:</strong> Supabase (PostgreSQL) com Row Level Security (RLS).</li>
                            <li><strong>IA:</strong> Integração agnóstica (OpenAI/Google Gemini) via <code>aiService.js</code>.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Seção 2: Fluxo de IA */}
                <Card>
                    <CardHeader>
                        <CardTitle>2. Diagnóstico Inteligente (RAG)</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-stone max-w-none text-gray-600">
                        <p>O sistema utiliza um fluxo de <strong>Retrieval-Augmented Generation</strong> (planejado para Fase 18+) para diagnósticos precisos:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li><strong>Input:</strong> O usuário seleciona a máquina e descreve o sintoma.</li>
                            <li><strong>Contexto:</strong> O sistema busca o documento técnico (Manual PDF) relevante no banco vetorial.</li>
                            <li><strong>Prompting:</strong> Construímos um prompt enriquecido com os trechos do manual.</li>
                            <li><strong>Output:</strong> A IA gera um JSON estruturado com Causas, Soluções e Peças.</li>
                        </ol>
                        <div className="bg-gray-100 p-3 rounded-md mt-4 font-mono text-sm border">
                            {`// Exemplo de Output JSON
{
  "possible_causes": ["Filtro obstruído", "Bomba com baixa pressão"],
  "suggested_solutions": ["Substituir filtro", "Testar pressão"],
  "parts_to_check": ["Filtro de Óleo (P/N 1234)"]
}`}
                        </div>
                    </CardContent>
                </Card>

                {/* Seção 3: Gestão de Chamados */}
                <Card>
                    <CardHeader>
                        <CardTitle>3. Ciclo de Vida dos Chamados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border p-4 rounded bg-red-50 border-red-100">
                                <h4 className="font-bold text-red-800 mb-2">1. Aberto</h4>
                                <p className="text-sm">Chamado criado automaticamente pela IA ou manualmente. Aguardando triagem.</p>
                            </div>
                            <div className="border p-4 rounded bg-blue-50 border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-2">2. Em Andamento</h4>
                                <p className="text-sm">Mecânico designado iniciou o trabalho. Peças podem ter sido solicitadas.</p>
                            </div>
                            <div className="border p-4 rounded bg-green-50 border-green-100">
                                <h4 className="font-bold text-green-800 mb-2">3. Concluído</h4>
                                <p className="text-sm">Problema resolvido. IA pode usar este caso para aprendizado futuro (Fine-tuning).</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
