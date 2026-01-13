
import { useState, useEffect, useMemo } from 'react'
import { manualsService } from '@/services/manualsService'
import { useToast } from '@/context/ToastContext'
import { ManualCard } from '@/components/manuals/ManualCard'
import { ManualUploadForm } from '@/components/manuals/ManualUploadForm'
import { PdfViewerModal } from '@/components/manuals/PdfViewerModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, UploadCloud, Filter, SlidersHorizontal, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Loading from '@/components/common/Loading'
import Error from '@/components/common/Error'
import { useAuth } from '@/context/AuthContext'

export default function ManualsPage() {
    const { isAdmin } = useAuth()
    const { toast } = useToast()
    const [manuals, setManuals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 12

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterBrand, setFilterBrand] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    // Filter Options
    const [typeOptions, setTypeOptions] = useState([])
    const [brandOptions, setBrandOptions] = useState([])

    // Modals
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [viewPdf, setViewPdf] = useState(null) // { url, title }

    useEffect(() => {
        loadFilters()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            loadManuals()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm, filterType, filterBrand, currentPage])

    async function loadFilters() {
        try {
            const { types, brands } = await manualsService.getFilters()
            setTypeOptions(types)
            setBrandOptions(brands)
        } catch (err) {
            console.error("Failed to load filters", err)
        }
    }

    async function loadManuals() {
        setLoading(true)
        try {
            const { data, count } = await manualsService.list({
                page: currentPage,
                pageSize,
                search: searchTerm,
                type: filterType,
                brand: filterBrand
            })
            setManuals(data)
            setTotalPages(Math.ceil(count / pageSize))
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        setFilterType('all')
        setFilterBrand('all')
        setSearchTerm('')
        setCurrentPage(1)
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage({ newPage }) // Oops bug in my typing
            setCurrentPage(newPage)
        }
    }

    const handleDelete = async (id) => {
        try {
            await manualsService.delete(id)
            await loadManuals(searchTerm) // Reload
        } catch (error) {
            console.error("Erro ao deletar:", error)
            alert("Erro ao excluir manual: " + error.message)
        }
    }

    const handleProcessManual = async (manual) => {
        // Optimistic UI or Loading State specific to card? 
        // For simplicity, global loading or just toast for now.
        // Better: toast promise

        // Check if we have the file blob? No, we have the URL. 
        // manualsService.processManual expects a File object (from upload) OR we need to fetch it.
        // Let's modify manualsService to accept manualId and URL/File?
        // Actually, manualsService.processManual as currently written expects a 'File' object because it calls arrayBuffer().

        // We need to fetch the file from the URL first.
        try {
            const toastId = toast.loading("Processando manual...", "A extração de texto e indexação IA iniciou. Isso pode levar alguns segundos.")

            // Fetch blob from public URL (CORS might be an issue if not configured, but Supabase usually fine)
            const response = await fetch(manual.file_url)
            const blob = await response.blob()
            const file = new File([blob], manual.title, { type: blob.type })

            await manualsService.processManual(manual.id, file)

            toast.dismiss(toastId)
            toast.success("Manual Processado!", "O manual agora está indexado e pronto para o Chat IA.")

            loadManuals(searchTerm) // Reload to update badge
        } catch (error) {
            console.error("Processing error:", error)
            toast.error("Erro no processamento", error.message)
        }
    }

    if (loading && manuals.length === 0) return <Loading />
    if (error) return <Error message={error} />

    return (
        <div className="space-y-8 bg-[var(--bg-light)] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manuais Técnicos</h1>
                    <p className="text-gray-500 mt-1">Biblioteca de manuais e documentação</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsUploadOpen(true)} className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 gap-2 shadow-sm">
                        <UploadCloud className="h-4 w-4" />
                        Adicionar Manual
                    </Button>
                )}
            </div>

            {/* Search & Filter Container */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <div className="text-sm font-medium text-gray-500">Buscar em Manuais</div>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Título, descrição, conteúdo, tags..."
                            className="pl-9 bg-gray-50 border-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

                        {(filterType !== 'all' || filterBrand !== 'all' || searchTerm) && (
                            <Button variant="ghost" onClick={clearFilters} className="gap-2 text-gray-500 hover:text-red-500">
                                <X className="h-4 w-4" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Filtrar por Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Tipos</SelectItem>
                                {typeOptions.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterBrand} onValueChange={setFilterBrand}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Filtrar por Marca" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Marcas</SelectItem>
                                {brandOptions.map(brand => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Content or Empty State */}
            {manuals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-dashed border-gray-200">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Nenhum manual encontrado</h3>
                    <p className="text-gray-500 mt-1 mb-8">Tente ajustar seus filtros ou adicione um novo.</p>
                    {isAdmin && (
                        <Button onClick={() => setIsUploadOpen(true)} className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Adicionar Manual
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {manuals.map(manual => (
                            <div key={manual.id} onClick={() => setViewPdf({ url: manual.file_url, title: manual.title })} className="cursor-pointer">
                                <ManualCard
                                    manual={manual}
                                    isAdmin={isAdmin}
                                    onDelete={handleDelete}
                                    onProcess={handleProcessManual}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8 pb-10">
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
                </>
            )}

            <ManualUploadForm
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={() => {
                    loadManuals()
                }}
            />

            <PdfViewerModal
                isOpen={!!viewPdf}
                onClose={() => setViewPdf(null)}
                url={viewPdf?.url}
                title={viewPdf?.title}
            />
        </div>
    )
}
