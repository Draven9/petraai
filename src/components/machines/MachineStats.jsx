import { Card, CardContent } from "@/components/ui/card"
import { Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export function MachineStats({ stats }) {
    // Helper to calculate separate stats if not already provided
    const stopped = stats.total - stats.operational - stats.maintenance

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total de Máquinas</p>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            {/* Operacionais */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Operacionais</p>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stats.operational}</div>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            {/* Em Manutenção */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Em Manutenção</p>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stats.maintenance}</div>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>

            {/* Paradas */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Paradas</p>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stopped}</div>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
