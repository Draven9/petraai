import { useState, useEffect } from 'react'
import { machinesService } from '@/services/machinesService'
import { MachineCard } from '@/components/machines/MachineCard'
import { MachineStats } from '@/components/machines/MachineStats'
import { MachineFormDialog } from '@/components/machines/MachineFormDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import Loading from '@/components/common/Loading'
import Error from '@/components/common/Error'
import { useAuth } from '@/context/AuthContext'

export default function MachinesPage() {
    const { isAdmin } = useAuth()
    const [machines, setMachines] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedMachine, setSelectedMachine] = useState(null)

    useEffect(() => {
        loadMachines()
    }, [])

    async function loadMachines() {
        setLoading(true)
        try {
            const data = await machinesService.list()
            setMachines(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setSelectedMachine(null)
        setIsDialogOpen(true)
    }

    const handleMachineClick = (machine) => {
        setSelectedMachine(machine)
        setIsDialogOpen(true)
    }

    const handleSave = async (machineData, id) => {
        if (id) {
            await machinesService.update(id, machineData)
        } else {
            await machinesService.create(machineData)
        }
        await loadMachines() // Reload list
    }

    const handleDelete = async (id) => {
        await machinesService.delete(id)
        await loadMachines()
    }

    const filteredMachines = machines.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.model.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: machines.length,
        operational: machines.filter(m => m.status === 'operacional').length,
        maintenance: machines.filter(m => m.status === 'manutencao').length
    }

    if (loading && machines.length === 0) return <Loading />
    if (error) return <Error message={error} />

    return (
        <div className="space-y-8 bg-[var(--bg-light)] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Máquinas</h1>
                    <p className="text-gray-500 mt-1">Gerencie seu parque de máquinas agrícolas</p>
                </div>
                {isAdmin && (
                    <Button onClick={handleCreate} className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Máquina
                    </Button>
                )}
            </div>

            {/* Stats */}
            <MachineStats stats={stats} />

            {/* Search Bar Container */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome, marca, modelo ou tipo..."
                        className="pl-10 border-gray-200 bg-gray-50/50 h-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Grid */}
            {filteredMachines.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-lg border border-dashed">
                    Nenhuma máquina encontrada.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMachines.map((machine) => (
                        <div key={machine.id} onClick={() => handleMachineClick(machine)}>
                            <MachineCard machine={machine} />
                        </div>
                    ))}
                </div>
            )}

            <MachineFormDialog
                machine={selectedMachine}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    )
}
