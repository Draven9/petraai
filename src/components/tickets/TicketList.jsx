import { useState, useEffect } from 'react'
import { ticketsService } from '@/services/ticketsService'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('todos')

    useEffect(() => {
        loadTickets()
    }, [refreshTrigger, filterStatus])

    const loadTickets = async () => {
        setLoading(true)
        try {
            const filters = filterStatus !== 'todos' ? { status: filterStatus } : {}
            const data = await ticketsService.list(filters)
            setTickets(data)
        } catch (error) {
            console.error('Error loading tickets', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await ticketsService.updateStatus(id, newStatus)
            loadTickets() // Refresh list
        } catch (error) {
            console.error('Error updating status', error)
            alert('Erro ao atualizar status')
        }
    }

    if (loading && tickets.length === 0) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>

    if (tickets.length === 0) return (
        <div className="text-center py-12 border rounded-lg bg-gray-50 border-dashed">
            <h3 className="text-lg font-medium text-gray-500">Nenhum chamado encontrado</h3>
            <p className="text-sm text-gray-400">Tudo operando normalmente!</p>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="aberto">Abertos</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluídos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {tickets.map(ticket => {
                    const StatusIcon = STATUS_MAP[ticket.status]?.icon || AlertCircle

                    return (
                        <div key={ticket.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge className={`${URGENCY_MAP[ticket.urgency] || 'bg-gray-500'} text-white border-0 capitalize`}>
                                        {ticket.urgency}
                                    </Badge>
                                    <span className="text-xs text-gray-400 font-mono">#{ticket.id.slice(0, 8)}</span>
                                    <span className="text-xs text-gray-500">• {format(new Date(ticket.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">{ticket.problem_description}</h4>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                        {ticket.machines?.name} ({ticket.machines?.model})
                                    </span>
                                    {ticket.location && <span className="text-gray-400">@ {ticket.location}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0">
                                <Select
                                    defaultValue={ticket.status}
                                    onValueChange={(val) => handleStatusUpdate(ticket.id, val)}
                                >
                                    <SelectTrigger className={`w-[160px] ${STATUS_MAP[ticket.status]?.color}`}>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon className="h-4 w-4" />
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
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
