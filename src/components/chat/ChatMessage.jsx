import { Bot, User, AlertTriangle, Wrench, Package, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ChatMessage({ role, content }) {
    const isAi = role === 'assistant'

    // Tenta fazer parse se for string JSON vinda da IA
    let structuredContent = null
    if (isAi && typeof content === 'string' && content.trim().startsWith('{')) {
        try {
            structuredContent = JSON.parse(content)
        } catch (e) {
            // Se falhar o parse, apenas exibe como texto normal
            console.error("Erro parse JSON msg", e)
        }
    } else if (isAi && typeof content === 'object') {
        structuredContent = content
    }

    return (
        <div className={cn(
            "flex gap-3 max-w-[85%] mb-6 animate-in slide-in-from-bottom-2 duration-300",
            isAi ? "self-start" : "self-end flex-row-reverse"
        )}>
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                isAi ? "bg-purple-100 border-purple-200 text-purple-600" : "bg-blue-100 border-blue-200 text-blue-600"
            )}>
                {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            {/* Balão de Mensagem */}
            <div className={cn(
                "p-3 rounded-2xl shadow-sm border",
                isAi ? "bg-white border-gray-100 rounded-tl-sm" : "bg-blue-600 text-white border-blue-600 rounded-tr-sm"
            )}>
                {!structuredContent ? (
                    // Mensagem de Texto Simples
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
                ) : (
                    // Mensagem Estruturada (Diagnóstico IA)
                    <div className="space-y-4 min-w-[300px]">

                        {/* 1. Causas Prováveis */}
                        {structuredContent.possible_causes?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-semibold text-amber-600 border-b border-amber-100 pb-1">
                                    <AlertTriangle className="w-4 h-4" /> Causas Prováveis
                                </h4>
                                <ul className="space-y-1">
                                    {structuredContent.possible_causes.map((cause, idx) => (
                                        <li key={idx} className="text-sm bg-amber-50 p-2 rounded border border-amber-100 text-amber-900">
                                            {cause}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 2. Soluções */}
                        {structuredContent.suggested_solutions?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-semibold text-green-600 border-b border-green-100 pb-1">
                                    <Wrench className="w-4 h-4" /> Soluções Sugeridas
                                </h4>
                                <ul className="space-y-1">
                                    {structuredContent.suggested_solutions.map((sol, idx) => (
                                        <li key={idx} className="text-sm flex gap-2 items-start">
                                            <span className="text-green-500 font-bold">•</span>
                                            <span className="text-gray-700">{sol}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 3. Peças */}
                        {structuredContent.parts_to_check?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-semibold text-blue-600 border-b border-blue-100 pb-1">
                                    <Package className="w-4 h-4" /> Peças para Verificar
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {structuredContent.parts_to_check.map((part, idx) => (
                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">
                                            {part}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Checklist Opcional */}
                        {structuredContent.checklist?.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Checklist Rápido</p>
                                {structuredContent.checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle2 className="w-3 h-3 text-gray-300" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
}
