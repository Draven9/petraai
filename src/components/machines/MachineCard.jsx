import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Calendar, Wrench, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MachineCard({ machine }) {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'operacional': return 'bg-green-100 text-green-700 hover:bg-green-200'
            case 'manutencao': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            case 'parada': return 'bg-red-100 text-red-700 hover:bg-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm overflow-hidden h-full">
            <CardContent className="p-6">

                {/* Header: Icon, Titles, Edit Button */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Wrench className="h-6 w-6 text-[var(--primary-orange)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{machine.name}</h3>
                            <p className="text-sm text-gray-500">{machine.brand} {machine.model}</p>
                        </div>
                    </div>
                    {/* Placeholder for optional Edit Action passed from parent or just visual for now */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal">
                        {machine.type?.toLowerCase() || 'trator'}
                    </Badge>
                    <Badge variant="secondary" className={`font-normal ${getStatusColor(machine.status)}`}>
                        {machine.status}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600 border-gray-200 font-normal">
                        {new Date(machine.created_at).getFullYear() || '2020'}
                    </Badge>
                </div>

                {/* Serial Number */}
                <div className="text-xs text-gray-500 mb-4 font-mono">
                    Série: {machine.serial_number || 'N/A'}
                </div>

                {/* Info List */}
                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{machine.location || 'Sem localização'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{machine.hours_worked || 0} horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Última manutenção: {machine.last_maintenance ? new Date(machine.last_maintenance).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
