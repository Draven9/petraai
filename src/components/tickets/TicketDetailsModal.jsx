import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin, Calendar, User, Wrench } from "lucide-react"
import { AIAnalysisDisplay } from "./AIAnalysisDisplay"

export function TicketDetailsModal({ ticket, open, onOpenChange }) {
    if (!ticket) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-8">
                        <div>
                            <DialogTitle className="text-xl">Chamado #{ticket.id.slice(0, 8)}</DialogTitle>
                            <DialogDescription>
                                Criado em {format(new Date(ticket.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </DialogDescription>
                        </div>
                        <Badge className="capitalize text-lg px-3 py-1">{ticket.status}</Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Info Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Máquina</h4>
                                <p className="font-semibold text-lg flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-orange-500" />
                                    {ticket.machines?.name} <span className="text-gray-400 font-normal">({ticket.machines?.model})</span>
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Localização</h4>
                                <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {ticket.location || "Não informada"}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Responsável</h4>
                                <p className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {ticket.created_by || "Sistema"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Urgência</h4>
                                <Badge variant={ticket.urgency === 'alta' ? 'destructive' : 'secondary'} className="capitalize">
                                    {ticket.urgency}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Descrição do Problema */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Descrição do Problema</h3>
                        <div className="p-4 border rounded-md bg-white text-gray-700 leading-relaxed">
                            {ticket.problem_description}
                        </div>
                    </div>

                    {/* Análise da IA */}
                    {ticket.ai_analysis && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                ✨ Diagnóstico da IA
                            </h3>
                            <AIAnalysisDisplay analysis={ticket.ai_analysis} />
                        </div>
                    )}

                    {/* Notas do Mecânico (Future) */}
                    {ticket.mechanic_notes && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Notas do Mecânico</h3>
                            <div className="p-4 border rounded-md bg-yellow-50 text-gray-800">
                                {ticket.mechanic_notes}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
