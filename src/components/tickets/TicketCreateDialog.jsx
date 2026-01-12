import { useState, useEffect } from 'react'
import { machinesService } from '@/services/machinesService'
import { ticketsService } from '@/services/ticketsService'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from 'lucide-react'

// Simple Label component standard
function SimpleLabel({ children, htmlFor }) {
    return <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">{children}</label>
}

export function TicketCreateDialog({ onTicketCreated }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [machines, setMachines] = useState([])

    const [formData, setFormData] = useState({
        machine_id: '',
        problem_description: '',
        urgency: 'media',
        location: ''
    })

    // Load machines for the dropdown
    useEffect(() => {
        if (open) {
            loadMachines()
        }
    }, [open])

    const loadMachines = async () => {
        try {
            const data = await machinesService.list()
            setMachines(data || [])
        } catch (error) {
            console.error('Failed to load machines', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.machine_id) {
            alert('Selecione uma máquina')
            return
        }

        setLoading(true)
        try {
            await ticketsService.create({
                machine_id: formData.machine_id,
                problem_description: formData.problem_description,
                urgency: formData.urgency,
                location: formData.location, // Pode ser preenchido auto com a loc da maquina se quisessemos
                status: 'aberto'
            })

            setOpen(false)
            setFormData({ machine_id: '', problem_description: '', urgency: 'media', location: '' })
            if (onTicketCreated) onTicketCreated()
        } catch (error) {
            console.error(error)
            alert('Erro ao criar chamado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[var(--primary-orange)]">
                    <Plus className="mr-2 h-4 w-4" /> Novo Chamado
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Abrir Chamado de Manutenção</DialogTitle>
                    <DialogDescription>
                        Descreva o problema encontrado no equipamento.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <SimpleLabel htmlFor="machine">Equipamento</SimpleLabel>
                        <Select
                            value={formData.machine_id}
                            onValueChange={(val) => setFormData({ ...formData, machine_id: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a máquina..." />
                            </SelectTrigger>
                            <SelectContent>
                                {machines.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.code ? `[${m.code}] ` : ''}{m.name} - {m.model}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <SimpleLabel htmlFor="urgency">Urgência</SimpleLabel>
                        <Select
                            value={formData.urgency}
                            onValueChange={(val) => setFormData({ ...formData, urgency: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="baixa">Baixa (Pode esperar)</SelectItem>
                                <SelectItem value="media">Média (Atenção necessária)</SelectItem>
                                <SelectItem value="alta">Alta (Máquina parada/Risco)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <SimpleLabel htmlFor="location">Localização Atual (Opcional)</SimpleLabel>
                        <input
                            id="location"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ex: Frente de obra 2"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <SimpleLabel htmlFor="description">Descrição do Problema</SimpleLabel>
                        <Textarea
                            id="description"
                            placeholder="Descreva o que está acontecendo..."
                            value={formData.problem_description}
                            onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary-orange)]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Chamado
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
