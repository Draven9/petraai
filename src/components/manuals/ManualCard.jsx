import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2 } from "lucide-react"

export function ManualCard({ manual, isAdmin, onDelete, onProcess }) {
    const handleDelete = (e) => {
        e.stopPropagation()
        if (confirm(`Tem certeza que deseja excluir o manual "${manual.title}"?`)) {
            onDelete(manual.id)
        }
    }

    const handleDownload = (e) => {
        e.stopPropagation()
        window.open(manual.file_url, '_blank')
    }

    const handleProcess = (e) => {
        e.stopPropagation()
        onProcess(manual)
    }

    return (
        <Card className="flex flex-col justify-between h-full hover:border-[var(--primary-orange)] transition-colors group relative">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    {manual.content_extracted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            IA Ativo
                        </Badge>
                    )}
                    {!manual.content_extracted && (
                        <Badge variant="outline">{manual.machine_type}</Badge>
                    )}
                </div>
                <h3 className="mt-4 font-semibold text-lg leading-tight">{manual.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {manual.description}
                </p>
                <div className="mt-4 text-xs font-medium text-gray-500">
                    Modelo: {manual.model || 'Todos'} | Marca: {manual.brand}
                </div>
            </CardContent>

            <CardFooter className="pt-0 gap-2">
                <Button className="flex-1 gap-2" variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Baixar
                </Button>

                {isAdmin && (
                    <>
                        <Button
                            variant="secondary"
                            size="sm"
                            title={manual.content_extracted ? "Reprocessar IA" : "Processar para IA"}
                            onClick={handleProcess}
                            className={manual.content_extracted ? "text-green-600" : ""}
                        >
                            <FileText className="h-4 w-4" />
                            {/* Using FileText as icon for now, implies 'Read Text' */}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            title="Excluir Manual"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    )
}
