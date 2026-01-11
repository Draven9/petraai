import { useState, useEffect } from 'react'
import { manualsService } from '@/services/manualsService'
import { ManualCard } from '@/components/manuals/ManualCard'
import { ManualUploadForm } from '@/components/manuals/ManualUploadForm'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, UploadCloud } from 'lucide-react'
import Loading from '@/components/common/Loading'
import Error from '@/components/common/Error'
import { useAuth } from '@/context/AuthContext'

export default function ManualsPage() {
    const { isAdmin } = useAuth()
    const [manuals, setManuals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isUploadOpen, setIsUploadOpen] = useState(false)

    useEffect(() => {
        loadManuals()
    }, [])

    async function loadManuals() {
        setLoading(true)
        try {
            const data = await manualsService.list()
            setManuals(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredManuals = manuals.filter(manual =>
        manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manual.machine_type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && manuals.length === 0) return <Loading />
    if (error) return <Error message={error} />

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)]">Manuais Técnicos</h1>
                {isAdmin && (
                    <Button onClick={() => setIsUploadOpen(true)} className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 gap-2">
                        <UploadCloud className="h-4 w-4" />
                        Upload (PDF)
                    </Button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar manual..."
                    className="pl-8 md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredManuals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                    <div className="text-gray-500 mb-2">Nenhum manual encontrado.</div>
                    {isAdmin && <div className="text-sm text-[var(--primary-orange)]">Faça o upload do primeiro arquivo.</div>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredManuals.map(manual => (
                        <a key={manual.id} href={manual.file_url} target="_blank" rel="noopener noreferrer">
                            <ManualCard manual={manual} />
                        </a>
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
        </div>
    )
}
