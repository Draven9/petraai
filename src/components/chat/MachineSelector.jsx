import { useState, useEffect, useMemo } from 'react'
import { machinesService } from '@/services/machinesService'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Wrench, MapPin, Clock, Calendar, Search, FilterX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function MachineSelector({ onSelect }) {
    const [machines, setMachines] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterBrand, setFilterBrand] = useState('all')

    useEffect(() => {
        loadMachines()
    }, [])

    const loadMachines = async () => {
        try {
            const data = await machinesService.list()
            setMachines(data)
        } catch (error) {
            console.error("Erro ao carregar máquinas", error)
        } finally {
            setLoading(false)
        }
    }

    // Extract unique brands
    const brandOptions = useMemo(() => [...new Set(machines.map(m => m.brand))].filter(Boolean).sort(), [machines])

    const filteredMachines = machines.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.brand.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = filterStatus === 'all' || m.status?.toLowerCase() === filterStatus
        const matchesBrand = filterBrand === 'all' || m.brand === filterBrand

        return matchesSearch && matchesStatus && matchesBrand
    })

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'operacional': return 'bg-green-100 text-green-700 hover:bg-green-200'
            case 'manutencao': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            case 'parada': return 'bg-red-100 text-red-700 hover:bg-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setFilterBrand('all')
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--primary-orange)]" /></div>

    return (
        <div className="bg-gray-50/50 rounded-xl p-6 md:p-10 border border-gray-100">
            <div className="text-center mb-12 space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Selecione uma Máquina</h2>
                <p className="text-sm text-gray-500">Escolha a máquina que precisa de suporte técnico</p>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-3 pt-4 max-w-2xl mx-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-9 bg-white shadow-sm border-gray-200 rounded-md"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                            <SelectItem value="manutencao">Em Manutenção</SelectItem>
                            <SelectItem value="parada">Parada</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterBrand} onValueChange={setFilterBrand}>
                        <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="Marca" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Marcas</SelectItem>
                            {brandOptions.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(filterStatus !== 'all' || filterBrand !== 'all' || searchTerm) && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar Filtros">
                            <FilterX className="h-4 w-4 text-gray-500" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredMachines.map(machine => (
                    <Card key={machine.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                        <CardContent className="p-6 flex-1">
                            {/* Header: Icon + Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Wrench className="h-6 w-6 text-[var(--primary-orange)]" />
                                </div>
                                <Badge variant="secondary" className={getStatusColor(machine.status)}>
                                    {machine.status}
                                </Badge>
                            </div>

                            {/* Titles */}
                            <div className="mb-4">
                                <div className="text-sm font-medium text-gray-500 mb-1">{machine.type || 'Equipamento'}</div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{machine.name}</h3>
                                <div className="text-sm text-gray-500">{machine.brand} {machine.model}</div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 rounded-md font-normal lowercase">
                                    {machine.brand.toLowerCase()}
                                </Badge>
                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 rounded-md font-normal">
                                    {new Date(machine.created_at).getFullYear() || '2024'}
                                </Badge>
                            </div>

                            {/* Details List */}
                            <div className="space-y-3 text-sm text-gray-500">
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

                        <CardFooter className="p-4 pt-0">
                            <Button
                                className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 font-medium h-11"
                                onClick={() => onSelect(machine)}
                            >
                                Selecionar Máquina
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredMachines.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    Nenhuma máquina encontrada.
                </div>
            )}
        </div>
    )
}
