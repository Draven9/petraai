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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)]">Minha Frota</h1>
                {isAdmin && (
                    <Button onClick={handleCreate} className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Máquina
                    </Button>
                )}
            </div>

            <MachineStats stats={stats} />

            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nome ou modelo..."
                    className="pl-8 md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredMachines.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    Nenhuma máquina encontrada.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
