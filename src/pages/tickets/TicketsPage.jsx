import { useState, useEffect } from 'react'
import { TicketList } from '@/components/tickets/TicketList'
import { ProblemReportDialog } from '@/components/tickets/ProblemReportDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, FilterX, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { ticketsService } from '@/services/ticketsService'
import { format } from 'date-fns'

export default function TicketsPage() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 10

    // Filter States
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState(null) // Not UI implemented yet but ready
    const [showFilters, setShowFilters] = useState(false)

    // Add debounce for search or just search on Apply/Enter?
    // For simplicity, let's search on effect but with debounce ideally. 
    // Using simple effect for now.

    useEffect(() => {
        const timer = setTimeout(() => {
            loadTickets()
        }, 500) // Debounce search
        return () => clearTimeout(timer)
    }, [refreshTrigger, currentPage, searchText, statusFilter])

    const loadTickets = async () => {
        setLoading(true)
        try {
            const { data, count } = await ticketsService.list({
                page: currentPage,
                pageSize,
                search: searchText,
                status: statusFilter
            })
            setTickets(data)
            setTotalPages(Math.ceil(count / pageSize))
        } catch (error) {
            console.error('Error loading tickets', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExportCSV = () => {
        if (tickets.length === 0) return alert("Nada para exportar")

        // Note: This only exports CURRENT PAGE. Full export would need a separate service call.
        const rows = tickets.map(t => [
            t.id,
            format(new Date(t.created_date), "yyyy-MM-dd HH:mm"),
            t.machines?.name || "N/A",
            `"${t.problem_description.replace(/"/g, '""')}"`,
            t.status,
            t.urgency,
            t.location || ""
        ])

        const headers = ["ID", "Data", "Máquina", "Problema", "Status", "Urgência", "Local"]
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `historico_page_${currentPage}_${format(new Date(), "yyyyMMdd")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleTicketCreated = () => {
        setRefreshTrigger(prev => prev + 1)
        setCurrentPage(1) // Reset to first page
    }

    const clearFilters = () => {
        setSearchText('')
        setCurrentPage(1)
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
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
                    <FileDown className="mr-2 h-4 w-4" /> Exportar (Página Atual)
                </Button>
            </div>

            {/* Search Bar Container */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <div className="text-sm font-medium text-gray-500">Buscar</div>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por descrição do problema..."
                            className="pl-9 bg-gray-50 border-gray-200"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value)
                                setCurrentPage(1) // Reset page on search
                            }}
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

                        <Button className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 px-6" onClick={loadTickets}>
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
                <h2 className="text-lg font-semibold text-gray-800">Lista de Chamados</h2>
                <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                </div>
            </div>

            <TicketList
                tickets={tickets}
                loading={loading}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 pb-20">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>
                    <span className="text-sm font-medium text-gray-600">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                    >
                        Próximo
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}

            <div className="fixed bottom-6 right-6">
                <ProblemReportDialog onTicketCreated={handleTicketCreated} />
            </div>
        </div>
    )
}
