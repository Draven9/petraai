import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, AlertCircle, Wrench } from "lucide-react"

export function TicketListItem({ ticket }) {
    const getPriorityColor = (urgency) => {
        switch (urgency?.toLowerCase()) {
            case 'alta': return 'text-red-600 bg-red-50 border-red-200'
            case 'media': return 'text-orange-600 bg-orange-50 border-orange-200'
            default: return 'text-blue-600 bg-blue-50 border-blue-200'
        }
    }

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white">
            <div className="flex gap-4 items-start">
                <div className="mt-1">
                    {ticket.status === 'aberto' ?
                        <AlertCircle className="h-5 w-5 text-red-500" /> :
                        <Wrench className="h-5 w-5 text-green-500" />
                    }
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{ticket.problem_description}</span>
                        <Badge variant="outline" className={getPriorityColor(ticket.urgency)}>
                            {ticket.urgency}
                        </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                        Máquina: <span className="font-medium text-gray-700">{ticket.machines?.name || 'Desconhecida'}</span> • Local: {ticket.location}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                    {new Date(ticket.created_date).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
