import { useState, useEffect, useMemo } from 'react'
import { manualsService } from '@/services/manualsService'
import { ManualCard } from '@/components/manuals/ManualCard'
import { ManualUploadForm } from '@/components/manuals/ManualUploadForm'
import { PdfViewerModal } from '@/components/manuals/PdfViewerModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, UploadCloud, FilterX } from 'lucide-react'
import Loading from '@/components/common/Loading'
import Error from '@/components/common/Error'
import { useAuth } from '@/context/AuthContext'

export default function ManualsPage() {
    const { isAdmin } = useAuth()
    const [manuals, setManuals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterBrand, setFilterBrand] = useState('all')

    // Modals
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [viewPdf, setViewPdf] = useState(null) // { url, title }

    useEffect(() => {
        const timer = setTimeout(() => {
            loadManuals(searchTerm)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    async function loadManuals(term = '') {
        setLoading(true)
        try {
            const data = await manualsService.list(term)
            setManuals(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Extract unique options for filters based on loaded manuals
    const typeOptions = useMemo(() => [...new Set(manuals.map(m => m.machine_type))].filter(Boolean).sort(), [manuals])
    const brandOptions = useMemo(() => [...new Set(manuals.map(m => m.brand))].filter(Boolean).sort(), [manuals])

    // Apply Client-Side Filters (Type & Brand)
    const filteredManuals = manuals.filter(manual => {
        const matchType = filterType === 'all' || manual.machine_type === filterType
        const matchBrand = filterBrand === 'all' || manual.brand === filterBrand
        return matchType && matchBrand
    })

    const clearFilters = () => {
        setFilterType('all')
        setFilterBrand('all')
        setSearchTerm('')
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

    if (loading && manuals.length === 0) return <Loading />
    if (error) return <Error message={error} />

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)]">Manuais Técnicos</h1>
                {isAdmin && (
                    <Button onClick={() => setIsUploadOpen(true)} className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 gap-2">
                        <UploadCloud className="h-4 w-4" />
                        Adicionar Manual
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por título ou conteúdo..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        {typeOptions.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterBrand} onValueChange={setFilterBrand}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Marcas</SelectItem>
                        {brandOptions.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {(filterType !== 'all' || filterBrand !== 'all' || searchTerm) && (
                    <Button variant="ghost" onClick={clearFilters} className="px-3" title="Limpar Filtros">
                        <FilterX className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {filteredManuals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                    <div className="text-gray-500 mb-2">Nenhum manual encontrado.</div>
                    {isAdmin && <div className="text-sm text-[var(--primary-orange)]">Tente ajustar os filtros ou faça um novo upload.</div>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredManuals.map(manual => (
                        <div key={manual.id} onClick={() => setViewPdf({ url: manual.file_url, title: manual.title })} className="cursor-pointer">
                            <ManualCard
                                manual={manual}
                                isAdmin={isAdmin}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
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
