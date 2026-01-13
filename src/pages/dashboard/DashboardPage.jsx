import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Activity,
    Users,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowRight
} from 'lucide-react'
import { machinesService } from '@/services/machinesService'
import { ticketsService } from '@/services/ticketsService'
import { manualsService } from '@/services/manualsService'
import { userService } from '@/services/userService'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
    const { user, userProfile } = useAuth()
    const [stats, setStats] = useState({
        machines: { total: 0, operational: 0, stopped: 0 },
        tickets: { open: 0, highUrgency: 0, recent: [] },
        manuals: { total: 0 },
        users: { total: 0, active: 0 }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            // Parallel data fetching for performance
            const [machines, tickets, manuals, usersList] = await Promise.all([
                machinesService.getStats ? machinesService.getStats() : machinesService.list().then(list => {
                    // Fallback if getStats doesn't exist or returns differently
                    return {
                        total: list.length,
                        operational: list.filter(m => m.status === 'operational').length,
                        stopped: list.filter(m => m.status === 'stopped').length
                    }
                }),
                // Optimized ticket fetching
                Promise.all([
                    ticketsService.getStats(),
                    ticketsService.list({ page: 1, pageSize: 5 })
                ]).then(([stats, recentList]) => ({
                    open: stats.open,
                    highUrgency: stats.highUrgency,
                    recent: recentList.data // .data because list returns { data, count }
                })),
                manualsService.list({ pageSize: 1 }).then(res => ({ total: res.count })),
                userService.listAll().then(list => ({
                    total: list.length,
                    active: list.filter(u => u.active !== false).length
                }))
            ])

            setStats({
                machines: machines.total ? machines : { total: 0, operational: 0, stopped: 0 },
                tickets,
                manuals,
                users: usersList
            })
        } catch (error) {
            console.error("Error loading dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, link }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-2xl font-bold">{loading ? "-" : value}</div>
                        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                </div>
                {link && (
                    <div className="mt-4 pt-4 border-t">
                        <Link to={link} className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium">
                            Ver detalhes <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8 p-8 min-h-screen bg-[var(--bg-light)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
                    <p className="text-gray-500 mt-1">
                        Bem-vindo de volta, <span className="text-primary font-medium">{userProfile?.full_name || user?.email}</span>.
                    </p>
                </div>
                <Button>
                    <Link to="/tickets" className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Abrir Novo Chamado
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Máquinas"
                    value={stats.machines.total}
                    subtitle={`${stats.machines.operational} operacionais, ${stats.machines.stopped} paradas`}
                    icon={Activity}
                    colorClass="text-blue-500"
                    link="/machines"
                />
                <StatCard
                    title="Chamados Abertos"
                    value={stats.tickets.open}
                    subtitle={`${stats.tickets.highUrgency} de alta prioridade`}
                    icon={AlertCircle}
                    colorClass="text-red-500"
                    link="/tickets"
                />
                <StatCard
                    title="Manuais Técnicos"
                    value={stats.manuals.total}
                    subtitle="Documentos disponíveis"
                    icon={FileText}
                    colorClass="text-orange-500"
                    link="/manuals"
                />
                <StatCard
                    title="Equipe"
                    value={stats.users.total}
                    subtitle={`${stats.users.active} usuários ativos`}
                    icon={Users}
                    colorClass="text-green-500"
                    link="/users"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Chamados Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-sm text-gray-500">Carregando...</p>
                            ) : stats.tickets.recent.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                    <p>Nenhum chamado recente!</p>
                                </div>
                            ) : (
                                stats.tickets.recent.map(ticket => (
                                    <div key={ticket.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full shrink-0 ${ticket.urgency === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                <AlertCircle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 line-clamp-1" title={ticket.problem_description}>{ticket.problem_description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {ticket.created_date ? formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true, locale: ptBR }) : '-'}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {ticket.status === 'open' ? 'Aberto' : ticket.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to="/tickets">Ver</Link>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary-normal)] text-white border-0">
                    <CardHeader>
                        <CardTitle className="text-white">Acesso Rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-primary-foreground/80 text-sm">
                            Precisa de ajuda imediata? Utilize nossas ferramentas de IA para diagnóstico.
                        </p>
                        <Button variant="secondary" className="w-full justify-start" asChild>
                            <Link to="/chat">
                                <Activity className="mr-2 h-4 w-4" />
                                Diagnóstico Inteligente
                            </Link>
                        </Button>
                        <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0" asChild>
                            <Link to="/manuals">
                                <FileText className="mr-2 h-4 w-4" />
                                Buscar nos Manuais
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
