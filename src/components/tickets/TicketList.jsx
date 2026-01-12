import { useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle2, AlertCircle, Eye, Wrench, Calendar, User, MoreHorizontal, HelpCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TicketDetailsModal } from './TicketDetailsModal'
import { Skeleton } from "@/components/ui/skeleton"
import { ticketsService } from '@/services/ticketsService'

const STATUS_MAP = {
    'aberto': { label: 'Aberto', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', icon: AlertCircle },
    'em_andamento': { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', icon: Clock },
    'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-700 hover:bg-green-200', icon: CheckCircle2 },
    'cancelado': { label: 'Cancelado', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', icon: HelpCircle }
}

const URGENCY_MAP = {
    'alta': { label: 'Crítica', color: 'bg-red-50 text-red-700 border-red-200' },
    'media': { label: 'Média', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    'baixa': { label: 'Baixa', color: 'bg-green-50 text-green-700 border-green-200' }
}

export function TicketList({ tickets, loading, onRefresh }) {
    const { toast } = useToast()
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await ticketsService.updateStatus(id, newStatus)
            onRefresh()
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

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    )

    if (tickets.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhum chamado encontrado</h3>
                <p className="text-sm text-gray-500 mt-1">Sua lista de suporte está vazia ou não há resultados para a busca.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tickets.map(ticket => {
                const StatusIcon = STATUS_MAP[ticket.status]?.icon || AlertCircle
                const statusInfo = STATUS_MAP[ticket.status] || STATUS_MAP['aberto']
                const urgencyInfo = URGENCY_MAP[ticket.urgency] || URGENCY_MAP['baixa']

                return (
                    <div key={ticket.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                        {/* Left Side: Icon + Details */}
                        <div className="flex items-start gap-4 flex-1">
                            {/* Icon Box */}
                            <div className={`mt-1 h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${statusInfo.color.split(' ')[0]} ${statusInfo.color.split(' ')[1]}`}>
                                <StatusIcon className="h-5 w-5" />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-gray-900 leading-tight">
                                    {ticket.problem_description}
                                </h4>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Wrench className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{ticket.machines?.name} <span className="text-gray-400">({ticket.machines?.model})</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span>
                                            {format(new Date(ticket.created_date), "dd/MM/yyyy HH:mm")}
                                            <span className="text-gray-400 ml-1">
                                                (há {formatDistanceToNow(new Date(ticket.created_date), { locale: ptBR, addSuffix: false })})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Badges + Action */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pl-14 md:pl-0">

                            <Badge variant="outline" className={`${statusInfo.color} border-0 capitalize px-2 py-0.5 font-medium`}>
                                {statusInfo.label}
                            </Badge>

                            <Badge variant="outline" className={`${urgencyInfo.color} font-medium`}>
                                Urgência: {urgencyInfo.label}
                            </Badge>

                            <Button
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 gap-2 ml-2"
                                onClick={() => handleViewDetails(ticket)}
                            >
                                <Eye className="h-4 w-4" />
                                Ver Detalhes
                            </Button>
                        </div>
                    </div>
                )
            })}

            <TicketDetailsModal
                ticket={selectedTicket}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onStatusChange={handleStatusUpdate} /* Pass status update handler to modal if needed */
            />
        </div>
    )
}
