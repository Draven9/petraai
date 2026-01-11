import { useState } from "react"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar"
import { Home, Settings, User, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// Simple Nav Items for Phase 1
const items = [
    {
        title: "Início",
        url: "#",
        icon: Home,
    },
    {
        title: "Início",
        url: "/",
        icon: Home,
    },
    {
        title: "Minha Frota",
        url: "/machines",
        icon: Settings,
    },
    {
        title: "Manuais",
        url: "/manuals",
        icon: Home, // TODO: Change icon
    },
    {
        title: "Configurações",
        url: "#",
        icon: Settings,
    },
]

function AppSidebar() {
    const { signOut, user } = useAuth()

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-2">
                <h2 className="text-xl font-bold tracking-tight text-[var(--primary-orange)]">PetraAI</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="flex flex-col gap-2">
                    {user && (
                        <div className="text-xs text-gray-500 truncate">
                            {user.email}
                        </div>
                    )}
                    <SidebarMenuButton onClick={signOut} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
                <main className="flex-1 overflow-auto">
                    <div className="flex h-14 items-center border-b bg-white px-4 lg:h-[60px]">
                        <SidebarTrigger />
                        <div className="ml-4 flex items-center font-semibold">Painel de Controle</div>
                    </div>
                    <div className="container mx-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
