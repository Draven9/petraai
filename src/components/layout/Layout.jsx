
import { useState } from "react"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar"
import { Home, Settings, User, LogOut, Book, MessageSquare, FileText, BookOpen, Wrench, History } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

import { useCompany } from "@/context/CompanyContext"

function Logo() {
    const { company, loading } = useCompany()

    // Loading State matching height
    if (loading) return <div className="h-[73px] flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div></div>

    // Render Dynamic or Fallback
    return (
        <div className="flex flex-col items-center justify-center py-4 border-b">
            {company?.logo_url ? (
                <img
                    src={company.logo_url}
                    alt={company.name || "Company Logo"}
                    className="h-10 w-auto object-contain mb-1"
                />
            ) : (
                <div className="text-[var(--primary-orange)] mb-1">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="30" height="30" rx="8" stroke="currentColor" strokeWidth="4" />
                        <circle cx="20" cy="20" r="6" fill="currentColor" />
                    </svg>
                </div>
            )}
            <span className="font-bold text-lg tracking-wider text-gray-700 truncate max-w-[200px] px-2">
                {company?.name || "petramaq"}
            </span>
        </div>
    )
}

function AppSidebar() {
    const { signOut, user, userProfile, isAdmin } = useAuth()

    const mainNav = [
        {
            title: "Chat IA",
            subtitle: "Suporte técnico inteligente",
            url: "/chat",
            icon: MessageSquare,
        },
        {
            title: "Máquinas",
            subtitle: "Gerenciar equipamentos",
            url: "/machines",
            icon: Wrench,
        },
        {
            title: "Manuais",
            subtitle: "Documentação técnica",
            url: "/manuals",
            icon: Book,
        },
        {
            title: "Histórico",
            subtitle: "Chamados e análises",
            url: "/tickets",
            icon: History,
        },
    ]

    const adminNav = [
        {
            title: "Usuários",
            subtitle: "Gestão de equipe",
            url: "/users",
            icon: User,
        },
        {
            title: "Documentação",
            subtitle: "Acesse documentos e guias",
            url: "/documentation",
            icon: BookOpen,
        },
        {
            title: "Configurações",
            subtitle: "Administração",
            url: "/settings",
            icon: Settings,
        },
    ]

    return (
        <Sidebar className="bg-white border-r">
            <SidebarHeader className="p-0">
                <Logo />
            </SidebarHeader>
            <SidebarContent className="px-2">

                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-4">
                        Navegação Principal
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNav.map((item) => (
                                <SidebarMenuItem key={item.title} className="mb-2">
                                    <SidebarMenuButton asChild size="lg" className="h-auto py-3 px-3 hover:bg-gray-50 transition-colors">
                                        <a href={item.url} className="flex gap-4">
                                            <div className="mt-0.5 text-gray-600">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-gray-800 text-sm leading-none mb-1">{item.title}</span>
                                                <span className="text-xs text-gray-500 font-normal">{item.subtitle}</span>
                                            </div>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Navigation */}
                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">
                            Administração
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {adminNav.map((item) => (
                                    <SidebarMenuItem key={item.title} className="mb-2">
                                        <SidebarMenuButton asChild size="lg" className="h-auto py-3 px-3 hover:bg-gray-50 transition-colors">
                                            <a href={item.url} className="flex gap-4">
                                                <div className="mt-0.5 text-gray-600">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-semibold text-gray-800 text-sm leading-none mb-1">{item.title}</span>
                                                    <span className="text-xs text-gray-500 font-normal">{item.subtitle}</span>
                                                </div>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

            </SidebarContent>

            <SidebarFooter className="border-t p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-[var(--primary-orange)] font-bold text-lg">
                        {userProfile?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate" title={userProfile?.full_name || user?.email}>
                            {userProfile?.full_name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                            {userProfile?.role === 'admin' ? 'Administrador' : 'Técnico'} • Ativo
                        </p>
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <div className="text-[10px] text-gray-400 leading-tight">
                        <p>© 2026 PetraAI. Todos os direitos reservados.</p>
                    </div>

                    <div className="text-[10px] text-gray-500">
                        Desenvolvido por: <a href="https://fluxcomunicacao.com.br" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--primary-orange)] hover:underline">Flux Comunicação</a>
                    </div>

                    <SidebarMenuButton onClick={signOut} className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 mt-2">
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Sair</span>
                    </SidebarMenuButton>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

export default function Layout({ children }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[var(--bg-light)]">
                <AppSidebar />
                <main className="flex-1 overflow-auto flex flex-col">
                    {/* Mobile Header */}
                    <div className="flex h-14 items-center border-b bg-white px-4 lg:hidden sticky top-0 z-10">
                        <SidebarTrigger />
                        <div className="ml-4 flex items-center font-semibold">PetraAI</div>
                    </div>
                    <div className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
