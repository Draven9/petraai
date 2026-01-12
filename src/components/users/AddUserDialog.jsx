import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { userService } from '@/services/userService'
import { useToast } from '@/context/ToastContext'
import { Loader2 } from 'lucide-react'

export function AddUserDialog({ onUserCreated, children }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'user', // 'admin' or 'user' (technician)
        job_title: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await userService.create(formData)
            toast.success("Usuário criado", "O registro foi adicionado com sucesso.")
            setOpen(false)
            setFormData({ full_name: '', email: '', role: 'user', job_title: '' })
            onUserCreated()
        } catch (error) {
            console.error(error)
            toast.error("Erro", "Falha ao criar usuário: " + (error.message || "Erro desconhecido"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Adicionar Usuário</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para adicionar um novo membro à equipe.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            required
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Permissão</Label>
                            <Select
                                value={formData.role}
                                onValueChange={val => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Técnico</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="job">Cargo/Função</Label>
                            <Input
                                id="job"
                                placeholder="Ex: Mecânico Chefe"
                                value={formData.job_title}
                                onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Usuário
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
