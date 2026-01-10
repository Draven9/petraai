import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function ManualFilters() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar manuais por título, modelo..."
                    className="pl-8"
                />
            </div>
            <div className="flex gap-2">
                <Select>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="escavadeira">Escavadeira</SelectItem>
                        <SelectItem value="trator">Trator</SelectItem>
                        <SelectItem value="caminhao">Caminhão</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cat">Caterpillar</SelectItem>
                        <SelectItem value="komatsu">Komatsu</SelectItem>
                        <SelectItem value="volvo">Volvo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
