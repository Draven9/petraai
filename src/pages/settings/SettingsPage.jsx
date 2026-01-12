import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProfileForm } from '@/components/settings/UserProfileForm'
import { CompanyProfile } from '@/components/settings/CompanyProfile'
import { UserManagement } from '@/components/settings/UserManagement'
import { useAuth } from '@/context/AuthContext'

export default function SettingsPage() {
    const { isAdmin } = useAuth()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)]">Configurações</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className={`grid w-full max-w-[400px] ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
                    {isAdmin && <TabsTrigger value="company">Empresa</TabsTrigger>}
                    {isAdmin && <TabsTrigger value="users">Usuários</TabsTrigger>}
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-medium">Dados Pessoais</h2>
                            <p className="text-sm text-gray-500">Gerencie suas informações de contato e função na empresa.</p>
                        </div>
                        <UserProfileForm />
                    </div>
                </TabsContent>

                {isAdmin && (
                    <>
                        <TabsContent value="company" className="mt-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-medium">Dados da Empresa</h2>
                                    <p className="text-sm text-gray-500">Gerencie a identidade visual e contatos da organização.</p>
                                </div>
                                <CompanyProfile />
                            </div>
                        </TabsContent>

                        <TabsContent value="users" className="mt-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-medium">Gestão de Usuários</h2>
                                    <p className="text-sm text-gray-500">Controle quem tem acesso ao sistema e suas permissões.</p>
                                </div>
                                <UserManagement />
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    )
}
