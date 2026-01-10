import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Activity } from "lucide-react"

export function MachineCard({ machine }) {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'operacional': return 'bg-green-500 hover:bg-green-600'
            case 'manutencao': return 'bg-yellow-500 hover:bg-yellow-600'
            case 'parada': return 'bg-red-500 hover:bg-red-600'
            default: return 'bg-gray-500'
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {machine.model}
                </CardTitle>
                <Badge className={getStatusColor(machine.status)}>
                    {machine.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{machine.name}</div>
                <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {machine.brand}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {machine.hours_worked}h trabalhadas
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {machine.location || 'Sem localização'}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
