import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Filter } from "lucide-react"

export function HistoryFilters() {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Histórico de Chamados</h3>
                <Badge variant="secondary" className="rounded-full">12</Badge>
            </div>

            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-9 gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Data</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="single" />
                    </PopoverContent>
                </Popover>

                <Select>
                    <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
