import { useState } from 'react'
import { TicketList } from '@/components/tickets/TicketList'
import { ProblemReportDialog } from '@/components/tickets/ProblemReportDialog'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function TicketsPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleTicketCreated = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)]">Gestão de Chamados</h1>
                    <p className="text-gray-500">Acompanhe as manutenções e utilize a IA para diagnóstico.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <ProblemReportDialog onTicketCreated={handleTicketCreated} />
                </div>
            </div>

            <TicketList refreshTrigger={refreshTrigger} />
        </div>
    )
}
