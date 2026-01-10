import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download } from "lucide-react"

export function ManualCard({ manual }) {
    return (
        <Card className="flex flex-col justify-between h-full hover:border-[var(--primary-orange)] transition-colors">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    <Badge variant="outline">{manual.machine_type}</Badge>
                </div>
                <h3 className="mt-4 font-semibold text-lg leading-tight">{manual.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {manual.description}
                </p>
                <div className="mt-4 text-xs font-medium text-gray-500">
                    Modelo: {manual.model || 'Todos'} | Marca: {manual.brand}
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button className="w-full gap-2" variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                </Button>
            </CardFooter>
        </Card>
    )
}
