import { useState, useEffect } from 'react'
import { userService } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Eye, Shield, ShieldAlert, User, Loader2 } from 'lucide-react'

export function UserManagement() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await userService.listAll()
            setUsers(data)
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
            // alert('Erro ao carregar usuários')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.updateRole(userId, newRole)
            // Atualizar lista localmente
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (error) {
            console.error('Erro ao atualizar role:', error)
            alert('Falha ao atualizar permissão.')
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>

    return (
        <div className="border rounded-lg bg-white overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium">Usuários Cadastrados ({users.length})</h3>
                <Button variant="outline" size="sm" onClick={loadUsers}>Atualizar</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                        <tr>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Cargo</th>
                            <th className="px-4 py-3">Permissão</th>
                            {/* <th className="px-4 py-3 text-right">Ações</th> */}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">
                                    {u.full_name || 'Sem nome'}
                                    {u.id === user?.id && <Badge variant="outline" className="ml-2 text-xs">Você</Badge>}
                                </td>
                                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                <td className="px-4 py-3 text-gray-500">{u.job_title || '-'}</td>
                                <td className="px-4 py-3">
                                    <Select
                                        defaultValue={u.role || 'user'}
                                        onValueChange={(val) => handleRoleChange(u.id, val)}
                                        disabled={u.id === user?.id} // Não pode mudar o próprio role para não se trancar
                                    >
                                        <SelectTrigger className="w-[130px] h-8">
                                            <div className="flex items-center gap-2">
                                                {u.role === 'admin' ? <ShieldAlert className="h-3 w-3 text-red-500" /> : <User className="h-3 w-3 text-blue-500" />}
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Usuário</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
