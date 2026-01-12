import { useState, useEffect } from 'react'
import { userService } from '@/services/userService'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Info, MoreHorizontal, User } from 'lucide-react'
import { AddUserDialog } from '@/components/users/AddUserDialog'
import { useToast } from '@/context/ToastContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await userService.listAll()
            setUsers(data)
        } catch (error) {
            console.error("Error loading users", error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (user, currentStatus) => {
        // currentStatus might be undefined or true/false. Handle gracefully.
        const newStatus = !currentStatus

        // Optimistic update
        setUsers(users.map(u => u.id === user.id ? { ...u, active: newStatus } : u))

        try {
            await userService.updateStatus(user.id, newStatus)
            toast.success("Status atualizado", `O usuário ${user.full_name} agora está ${newStatus ? 'ativo' : 'inativo'}.`)
        } catch (error) {
            console.error("Error updating status", error)
            toast.error("Erro", "Não foi possível atualizar o status.")
            // Revert
            setUsers(users.map(u => u.id === user.id ? { ...u, active: currentStatus } : u))
        }
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 bg-[var(--bg-light)] min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                <p className="text-gray-500 mt-1">Visualize e gerencie os usuários do sistema.</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-700">
                    <span className="font-semibold block mb-1">Informações sobre Gestão de Usuários</span>
                    Atualmente, os papéis dos usuários definem suas permissões de acesso. Admins têm acesso total, enquanto Técnicos focam em chamados e manutenção.
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-9 bg-gray-50 border-gray-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <AddUserDialog onUserCreated={loadUsers}>
                    <Button className="bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 shadow-sm w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Usuário
                    </Button>
                </AddUserDialog>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Cargo</th>
                                <th className="px-6 py-4">Função</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Criado em</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                {user.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.full_name || 'Sem nome'}</div>
                                                <div className="text-gray-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.job_title || 'Não informado'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className={`
                                            ${user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
                                            border-0 capitalize
                                        `}>
                                            {user.role === 'admin' ? 'Administrador' : 'Técnico'} // Ou 'Mecânico'
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={user.active !== false} // Default to true if undefined
                                                onCheckedChange={() => handleToggleStatus(user, user.active !== false)}
                                            />
                                            <span className={`text-xs font-medium ${user.active !== false ? 'text-green-600' : 'text-gray-400'}`}>
                                                {user.active !== false ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.created_date ? format(new Date(user.created_date), 'dd/MM/yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                            Ver detalhes
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
