import { useState, useEffect } from 'react'
import { ticketsService } from '@/services/ticketsService'
import { useToast } from '@/context/ToastContext'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Clock, CheckCircle2, Search, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TicketDetailsModal } from './TicketDetailsModal'
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_MAP = {
    'aberto': { label: 'Aberto', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
    'em_andamento': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    'cancelado': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null }
}

const URGENCY_MAP = {
    'alta': 'bg-red-500 hover:bg-red-600',
    'media': 'bg-yellow-500 hover:bg-yellow-600',
    'baixa': 'bg-green-500 hover:bg-green-600'
}

export function TicketList({ refreshTrigger }) {
    const { toast } = useToast()
    const [tickets, setTickets] = useState([])
    const [filteredTickets, setFilteredTickets] = useState([])
    const [loading, setLoading] = useState(true)

    // Filtros
    const [filterStatus, setFilterStatus] = useState('todos')
    const [searchText, setSearchText] = useState('')

    // Modal
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    useEffect(() => {
        loadTickets()
    }, [refreshTrigger])

    useEffect(() => {
        applyFilters()
    }, [tickets, filterStatus, searchText])

    const loadTickets = async () => {
        setLoading(true)
        try {
            // Carrega TODOS (ou paginado futuramente) para filtrar no front por enquanto
            const data = await ticketsService.list()
            setTickets(data)
        } catch (error) {
            console.error('Error loading tickets', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let result = tickets

        // Filter Status
        if (filterStatus !== 'todos') {
            result = result.filter(t => t.status === filterStatus)
        }

        // Filter Text (Description, Machine Name, ID)
        if (searchText) {
            const lowerSearch = searchText.toLowerCase()
            result = result.filter(t =>
                t.problem_description.toLowerCase().includes(lowerSearch) ||
                t.machines?.name?.toLowerCase().includes(lowerSearch) ||
                t.id.toLowerCase().includes(lowerSearch)
            )
        }

        setFilteredTickets(result)
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await ticketsService.updateStatus(id, newStatus)
            loadTickets() // Refresh list from DB to be safe
            toast.success("Status atualizado", "O chamado foi atualizado com sucesso.")
        } catch (error) {
            console.error('Error updating status', error)
            toast.error("Erro ao atualizar", "Não foi possível mudar o status do chamado.")
        }
    }

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket)
        setDetailsOpen(true)
    }

    const handleExportCSV = () => {
        if (filteredTickets.length === 0) return alert("Nada para exportar")

        const headers = ["ID", "Data", "Máquina", "Problema", "Status", "Urgência", "Local"]
        const rows = filteredTickets.map(t => [
            t.id,
            format(new Date(t.created_date), "yyyy-MM-dd HH:mm"),
            t.machines?.name || "N/A",
            `"${t.problem_description.replace(/"/g, '""')}"`, // Escape quotes
            t.status,
            t.urgency,
            t.location || ""
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `chamados_export_${format(new Date(), "yyyyMMdd")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading && tickets.length === 0) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col md:flex-row gap-4 justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
            ))}
        </div>
    )

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar máquina, problema..."
                            className="pl-9"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="aberto">Abertos</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluido">Concluídos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" onClick={handleExportCSV} disabled={filteredTickets.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
            </div>

            {/* List */}
            {filteredTickets.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50 border-dashed">
                    <h3 className="text-lg font-medium text-gray-500">Nenhum chamado encontrado</h3>
                    <p className="text-sm text-gray-400">Tente ajustar os filtros.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTickets.map(ticket => {
                        const StatusIcon = STATUS_MAP[ticket.status]?.icon || AlertCircle
                        const statusColor = STATUS_MAP[ticket.status]?.color || "bg-gray-100"

                        return (
                            <div key={ticket.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className={`${URGENCY_MAP[ticket.urgency] || 'bg-gray-500'} text-white border-0 capitalize px-1.5 py-0 text-[10px]`}>
                                            {ticket.urgency}
                                        </Badge>
                                        <span className="text-xs text-gray-400 font-mono">#{ticket.id.slice(0, 8)}</span>
                                        <span className="text-xs text-gray-500">• {format(new Date(ticket.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                        {ticket.ai_analysis && (
                                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded-full font-medium border border-purple-200">
                                                IA Diagnóstico
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-1">
                                        {ticket.problem_description}
                                    </h4>
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700 text-xs">
                                            {ticket.machines?.name} ({ticket.machines?.model})
                                        </span>
                                        {ticket.location && <span className="text-gray-400 text-xs">@ {ticket.location}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 justify-end">
                                    <Select
                                        defaultValue={ticket.status}
                                        onValueChange={(val) => handleStatusUpdate(ticket.id, val)}
                                    >
                                        <SelectTrigger className={`w-[140px] h-9 ${statusColor}`}>
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <StatusIcon className="h-3 w-3" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aberto">Aberto</SelectItem>
                                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                            <SelectItem value="concluido">Concluído</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => handleViewDetails(ticket)}>
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <TicketDetailsModal
                ticket={selectedTicket}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    )
}
