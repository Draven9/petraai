import { MachineCard } from '@/components/machines/MachineCard'
import { MachineStats } from '@/components/machines/MachineStats'
import { ManualCard } from '@/components/manuals/ManualCard'
import { ManualFilters } from '@/components/manuals/ManualFilters'
import { TicketListItem } from '@/components/tickets/TicketListItem'
import { HistoryFilters } from '@/components/tickets/HistoryFilters'

export default function ShowcasePage() {
    // MOCK DATA
    const mockMachine = {
        name: 'Escavadeira 01',
        model: '320D',
        brand: 'Caterpillar',
        status: 'operacional',
        hours_worked: 12450
    }

    const mockStats = {
        total: 12,
        operational: 8,
        maintenance: 4
    }

    const mockManual = {
        title: 'Manual de Serviço 320D',
        description: 'Instruções completas para manutenção hidráulica e elétrica.',
        machine_type: 'Escavadeira',
        brand: 'Caterpillar',
        model: '320D'
    }

    const mockTicket = {
        problem_description: 'Falha no sistema hidráulico',
        urgency: 'alta',
        status: 'aberto',
        location: 'Mina 04',
        created_date: new Date().toISOString(),
        machines: { name: 'Escavadeira 01' }
    }

    return (
        <div className="space-y-12 p-8 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold mb-6 text-[var(--primary-orange)]">UI Showcase</h1>
                <p className="text-gray-500">Componentes visuais isolados para validação.</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">1. Máquinas</h2>
                <MachineStats stats={mockStats} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MachineCard machine={mockMachine} />
                    <MachineCard machine={{ ...mockMachine, status: 'manutencao', name: 'Trator D6' }} />
                    <MachineCard machine={{ ...mockMachine, status: 'parada', name: 'Caminhão 777' }} />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">2. Manuais</h2>
                <ManualFilters />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ManualCard manual={mockManual} />
                    <ManualCard manual={{ ...mockManual, title: 'Catálogo de Peças' }} />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">3. Tickets</h2>
                <HistoryFilters />
                <div className="space-y-2">
                    <TicketListItem ticket={mockTicket} />
                    <TicketListItem ticket={{ ...mockTicket, urgency: 'media', status: 'em_progresso', problem_description: 'Revisão 500h' }} />
                    <TicketListItem ticket={{ ...mockTicket, urgency: 'baixa', status: 'concluido', problem_description: 'Troca de filtro' }} />
                </div>
            </section>
        </div>
    )
}
