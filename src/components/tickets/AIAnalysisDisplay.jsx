import { AlertTriangle, Wrench, Package, CheckCircle2, FileText } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper to safely render AI items (string or object)
const renderAIItem = (item) => {
    if (!item) return ""

    // 1. Handle Objects (create specific UI elements)
    if (typeof item === 'object') {
        if (item.action && item.component_system) return <span><strong>[{item.component_system}]</strong> {item.action}</span>
        if (item.cause) {
            const prob = item.probability || item.probability_rank
            // Recursively render cause text to support markdown images inside it
            const causeContent = renderAIItem(item.cause)
            if (prob) return <span>{causeContent} <em className="text-xs text-gray-400">({typeof prob === 'number' ? `${prob}º mais provável` : prob})</em></span>
            return causeContent
        }
        if (item.solution) { // Support for solution objects
            return renderAIItem(item.component_system ? `[${item.component_system}] ${item.solution}` : item.solution)
        }
        if (item.part) { // Support for part objects
            let partText = item.component_system ? `[${item.component_system}] ${item.part}` : item.part
            if (item.location_description) partText += ` (${item.location_description})`
            if (item.specs) partText += ` - ${item.specs}`
            return renderAIItem(partText)
        }
        if (item.action) return renderAIItem(item.action)
        if (item.description) return renderAIItem(item.description)
        if (item.text) return renderAIItem(item.text)
        return JSON.stringify(item)
    }

    // 2. Handle Strings (Try parse JSON first, then Markdown)
    let str = String(item)
    if (str.trim().startsWith('{') && str.includes('}')) {
        try {
            const parsed = JSON.parse(str)
            return renderAIItem(parsed) // Recurse with object
        } catch (e) {
            // ignore parse error, treat as string
        }
    }
    if (str.includes('![')) {
        return (
            <span className="inline-block align-top w-full">
                {str.split(/(!\[.*?\]\(.*?\))/g).map((part, i) => {
                    const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/)
                    if (imgMatch) {
                        return (
                            <div key={i} className="my-2 p-1 border rounded bg-gray-50 bg-white block w-full max-w-[200px]">
                                <img
                                    src={imgMatch[2]}
                                    alt={imgMatch[1]}
                                    className="max-w-full h-auto rounded cursor-pointer hover:opacity-95"
                                    onClick={() => window.open(imgMatch[2], '_blank')}
                                    title="Clique para ampliar"
                                />
                                <div className="text-xs text-center text-gray-500 mt-1">{imgMatch[1]}</div>
                            </div>
                        )
                    }
                    return <span key={i}>{part}</span>
                })}
            </span>
        )
    }

    return str
}

export function AIAnalysisDisplay({ analysis }) {
    if (!analysis) return null

    return (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50/10">
            <CardContent className="pt-6">
                <Tabs defaultValue="causes" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger
                            value="causes"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 px-0 py-2"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Causas ({analysis.possible_causes?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="solutions"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-700 px-0 py-2"
                        >
                            <Wrench className="w-4 h-4 mr-2" />
                            Soluções ({analysis.suggested_solutions?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="parts"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 px-0 py-2"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Peças
                        </TabsTrigger>
                        {analysis.checklist && (
                            <TabsTrigger
                                value="checklist"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-700 px-0 py-2"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Checklist
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <div className="mt-4 min-h-[150px]">
                        <TabsContent value="causes" className="space-y-2 mt-0">
                            {analysis.possible_causes?.map((cause, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-2 rounded hover:bg-white/50">
                                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                                    <p className="text-sm text-gray-700 leading-snug">{renderAIItem(cause)}</p>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="solutions" className="space-y-2 mt-0">
                            {analysis.suggested_solutions?.map((sol, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-2 rounded hover:bg-white/50">
                                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-snug">{renderAIItem(sol)}</p>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="parts" className="mt-0">
                            <div className="flex flex-wrap gap-2">
                                {analysis.parts_to_check?.map((part, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm text-gray-700 shadow-sm">
                                        <Package className="w-3 h-3 text-blue-500" />
                                        {renderAIItem(part)}
                                    </div>
                                ))}
                                {(!analysis.parts_to_check || analysis.parts_to_check.length === 0) && (
                                    <p className="text-sm text-gray-500 italic">Nenhuma peça específica listada.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="checklist" className="space-y-2 mt-0">
                            {analysis.checklist?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300 text-purple-600" />
                                    <span className="text-sm text-gray-700">{renderAIItem(item)}</span>
                                </div>
                            ))}
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}
