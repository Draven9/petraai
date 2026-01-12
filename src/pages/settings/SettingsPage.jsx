import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProfileForm } from '@/components/settings/UserProfileForm'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-orange)]">Configurações</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
                    <TabsTrigger value="notifications" disabled>Notificações</TabsTrigger>
                    <TabsTrigger value="security" disabled>Segurança</TabsTrigger>
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

                <TabsContent value="notifications">
                    Configure suas notificações aqui. (Em breve)
                </TabsContent>

                <TabsContent value="security">
                    Configurações de senha e acesso. (Em breve)
                </TabsContent>
            </Tabs>
        </div>
    )
}
