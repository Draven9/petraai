import { useState, useEffect } from 'react'
import { machinesService } from '@/services/machinesService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Tractor, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function MachineSelector({ onSelect }) {
    const [machines, setMachines] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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

    const filteredMachines = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>

    return (
        <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
            <div className="text-center mb-10 space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Qual máquina precisa de ajuda?</h2>
                <p className="text-gray-500">Selecione o equipamento para iniciar o diagnóstico inteligente.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar por nome, modelo ou marca..."
                    className="pl-9 bg-white shadow-sm border-gray-200"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMachines.map(machine => (
                    <Card
                        key={machine.id}
                        className="group hover:border-purple-300 hover:shadow-md transition-all cursor-pointer border-gray-200"
                        onClick={() => onSelect(machine)}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <Tractor className="h-6 w-6 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">{machine.name}</h3>
                                <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                                    <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded">{machine.brand}</span>
                                    <span>{machine.model}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredMachines.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-400">
                        Nenhuma máquina encontrada.
                    </div>
                )}
            </div>
        </div>
    )
}
