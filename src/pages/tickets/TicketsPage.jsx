import { useState, useEffect } from 'react'
import { TicketList } from '@/components/tickets/TicketList'
import { ProblemReportDialog } from '@/components/tickets/ProblemReportDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Download, Search, SlidersHorizontal, FilterX, FileDown } from 'lucide-react'
import { ticketsService } from '@/services/ticketsService'
import { format } from 'date-fns'

export default function TicketsPage() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filteredTickets, setFilteredTickets] = useState([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Filter States
    const [searchText, setSearchText] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadTickets()
    }, [refreshTrigger])

    useEffect(() => {
        applyFilters()
    }, [tickets, searchText])

    const loadTickets = async () => {
        setLoading(true)
        try {
            const data = await ticketsService.list()
            setTickets(data)
        } catch (error) {
            console.error('Error loading tickets', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let result = tickets
        if (searchText) {
            const lowerSearch = searchText.toLowerCase()
            result = result.filter(t =>
                t.problem_description.toLowerCase().includes(lowerSearch) ||
                t.machines?.name?.toLowerCase().includes(lowerSearch) ||
                t.id.toLowerCase().includes(lowerSearch)
            )
        }
        setFilteredTickets(result)
    }

    const handleExportCSV = () => {
        if (filteredTickets.length === 0) return alert("Nada para exportar")

        const headers = ["ID", "Data", "Máquina", "Problema", "Status", "Urgência", "Local"]
        const rows = filteredTickets.map(t => [
            t.id,
            format(new Date(t.created_date), "yyyy-MM-dd HH:mm"),
            t.machines?.name || "N/A",
            `"${t.problem_description.replace(/"/g, '""')}"`,
            t.status,
            t.urgency,
            t.location || ""
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `historico_export_${format(new Date(), "yyyyMMdd")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleTicketCreated = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    const clearFilters = () => {
        setSearchText('')
    }

    return (
        <div className="space-y-6 bg-[var(--bg-light)] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Histórico de Suporte</h1>
                    <p className="text-gray-500 mt-1">Visualize e gerencie todos os chamados técnicos</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <FileDown className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
            </div>

            {/* Search Bar Container */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <div className="text-sm font-medium text-gray-500">Buscar</div>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="ID, problema, máquina..."
                            className="pl-9 bg-gray-50 border-gray-200"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 border-dashed border-gray-300 text-gray-600 hover:text-[var(--primary-orange)] hover:border-[var(--primary-orange)]"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtros Mais
                        </Button>

                        <Button className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 px-6">
                            Aplicar
                        </Button>

                        {searchText && (
                            <Button variant="ghost" onClick={clearFilters} className="gap-2 text-gray-500 hover:text-red-500">
                                <FilterX className="h-4 w-4" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Lista de Chamados ({filteredTickets.length})</h2>
                {/* Optional: Add sort or other controls here */}
            </div>

            <TicketList
                tickets={filteredTickets}
                loading={loading}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />

            <div className="fixed bottom-6 right-6">
                <ProblemReportDialog onTicketCreated={handleTicketCreated} />
            </div>
        </div>
    )
}
