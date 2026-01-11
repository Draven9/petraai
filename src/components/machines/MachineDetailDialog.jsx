import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Tag } from "lucide-react"

export function MachineDetailDialog({ machine, open, onOpenChange }) {
    if (!machine) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-xl">{machine.name}</DialogTitle>
                        <Badge variant={machine.status === 'operacional' ? 'default' : 'destructive'}>
                            {machine.status}
                        </Badge>
                    </div>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500">Modelo</span>
                            <span className="text-base font-semibold">{machine.model}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500">Marca</span>
                            <span className="text-base font-semibold">{machine.brand}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500">Série</span>
                            <span className="text-sm font-mono bg-gray-100 p-1 rounded w-fit">
                                {machine.serial_number || 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500">Ano</span>
                            <span className="text-base">{machine.year || '-'}</span>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Horímetro:</span>
                            <span className="font-bold">{machine.hours_worked}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Localização:</span>
                            <span className="font-medium">{machine.location || 'Não informada'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Tipo:</span>
                            <span className="font-medium capitalize">{machine.machine_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Última Manutenção:</span>
                            <span className="font-medium">
                                {machine.last_maintenance ? new Date(machine.last_maintenance).toLocaleDateString() : 'Nunca'}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
