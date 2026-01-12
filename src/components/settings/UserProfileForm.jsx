import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Save } from 'lucide-react'

// Simple Label component if not using specific UI lib one
function Label({ children, htmlFor }) {
    return <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">{children}</label>
}

export function UserProfileForm() {
    const { user, userProfile, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        job_title: '',
        phone: '',
        email: '' // Read only
    })

    useEffect(() => {
        if (userProfile || user) {
            // Split full_name into first and last for display
            const fullName = userProfile?.full_name || ''
            const nameParts = fullName.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            setFormData({
                first_name: firstName,
                last_name: lastName,
                job_title: userProfile?.job_title || '',
                phone: userProfile?.phone || '',
                email: user?.email || ''
            })
        }
    }, [userProfile, user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (success) setSuccess(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)

        try {
            // Combine first and last name into full_name for DB
            const full_name = `${formData.first_name} ${formData.last_name}`.trim()

            // Prepare payload matching DB schema (public.users)
            const updateData = {
                full_name,
                job_title: formData.job_title,
                phone: formData.phone
            }

            await userService.updateProfile(user.id, updateData)
            await refreshProfile()
            setSuccess(true)

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar perfil: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="first_name">Nome</Label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Seu nome" />
                </div>
                <div>
                    <Label htmlFor="last_name">Sobrenome</Label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Seu sobrenome" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={formData.email} disabled className="bg-gray-100 cursor-not-allowed" />
                    <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado aqui.</p>
                </div>
                <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" />
                </div>
            </div>

            <div>
                <Label htmlFor="job_title">Cargo / Função</Label>
                <Input id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} placeholder="Ex: Gerente de Frota" />
            </div>

            <div className="flex items-center justify-between pt-4">
                {success && (
                    <span className="text-green-600 text-sm font-medium animate-in fade-in flex items-center gap-2">
                        Perfil atualizado com sucesso!
                    </span>
                )}
                {!success && <span></span>} {/* Spacer */}

                <Button type="submit" disabled={loading} className="bg-[var(--primary-orange)] ml-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!loading && <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    )
}
