import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { Loader2, Pencil, Trash2, Save, X } from "lucide-react"

export function MachineFormDialog({ machine, open, onOpenChange, onSave, onDelete }) {
    const { isAdmin } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        brand: '',
        machine_type: 'Escavadeira',
        serial_number: '',
        year: new Date().getFullYear(),
        status: 'operacional',
        location: '',
        hours_worked: 0
    })

    useEffect(() => {
        if (machine) {
            setFormData({
                name: machine.name || '',
                model: machine.model || '',
                brand: machine.brand || '',
                machine_type: machine.machine_type || 'Escavadeira',
                serial_number: machine.serial_number || '',
                year: machine.year || new Date().getFullYear(),
                status: machine.status || 'operacional',
                location: machine.location || '',
                hours_worked: machine.hours_worked || 0
            })
            setIsEditing(false) // Reset to view mode when machine changes
        } else {
            // New Machine -> Always Edit Mode
            setFormData({
                name: '',
                model: '',
                brand: '',
                machine_type: 'Escavadeira',
                serial_number: '',
                year: new Date().getFullYear(),
                status: 'operacional',
                location: '',
                hours_worked: 0
            })
            setIsEditing(true)
        }
    }, [machine, open])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave(formData, machine?.id) // Pass ID if updating
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta máquina?')) return
        setLoading(true)
        try {
            await onDelete(machine.id)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            alert('Erro ao excluir: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // --- VIEW MODE ---
    if (!isEditing && machine) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-between mr-8">
                            <DialogTitle className="text-xl">{machine.name}</DialogTitle>
                            <Badge variant={machine.status === 'operacional' ? 'default' : 'destructive'}>
                                {machine.status}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-gray-500 font-medium">Modelo:</span> {machine.model}</div>
                            <div><span className="text-gray-500 font-medium">Marca:</span> {machine.brand}</div>
                            <div><span className="text-gray-500 font-medium">Tipo:</span> {machine.machine_type}</div>
                            <div><span className="text-gray-500 font-medium">Ano:</span> {machine.year}</div>
                            <div><span className="text-gray-500 font-medium">Série:</span> {machine.serial_number || '-'}</div>
                            <div><span className="text-gray-500 font-medium">Horímetro:</span> {machine.hours_worked}h</div>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="text-gray-500 font-medium">Localização:</div>
                            <div>{machine.location || 'Não informada'}</div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        {isAdmin && (
                            <div className="flex gap-2">
                                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        )}
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    // --- EDIT/CREATE MODE ---
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{machine ? 'Editar Máquina' : 'Nova Máquina'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="operacional">Operacional</SelectItem>
                                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                                    <SelectItem value="parada">Parada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modelo</label>
                            <Input required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marca</label>
                            <Input required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <Select value={formData.machine_type} onValueChange={v => setFormData({ ...formData, machine_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Escavadeira">Escavadeira</SelectItem>
                                    <SelectItem value="Trator">Trator</SelectItem>
                                    <SelectItem value="Caminhão">Caminhão</SelectItem>
                                    <SelectItem value="Guindaste">Guindaste</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ano</label>
                            <Input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nº Série</label>
                            <Input value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horímetro</label>
                            <Input type="number" value={formData.hours_worked} onChange={e => setFormData({ ...formData, hours_worked: e.target.value })} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Localização</label>
                            <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                    </div>

                    <DialogFooter>
                        {machine && (
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" className="bg-[var(--primary-orange)]" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
