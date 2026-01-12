import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import ShowcasePage from './pages/ShowcasePage'
import MachinesPage from '@/pages/machines/MachinesPage'
import ManualsPage from './pages/manuals/ManualsPage'
import SettingsPage from './pages/settings/SettingsPage'
import TicketsPage from './pages/tickets/TicketsPage'
import DocumentationPage from './pages/help/DocumentationPage'
import { ChatSupport } from '@/pages/chat/ChatSupport'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao PetraAI</CardTitle>
          <CardDescription>Autenticação Ativa</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Você está logado com segurança. Este conteúdo é protegido.</p>
          <div className="flex gap-2">
            <Button onClick={() => console.log('Action')}>Ação Principal</Button>
            <Button variant="secondary">Secundária</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="text-green-600 font-medium">● Todos os Sistemas Operacionais</p>
            <p className="text-gray-500 mt-2">Autenticação Supabase: Conectado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout><Dashboard /></Layout>} path="/" />
              <Route element={<Layout><MachinesPage /></Layout>} path="/machines" />
              <Route element={<Layout><TicketsPage /></Layout>} path="/tickets" />
              <Route element={<Layout><ManualsPage /></Layout>} path="/manuals" />
              <Route element={<Layout><ChatSupport /></Layout>} path="/chat" />
              <Route element={<Layout><DocumentationPage /></Layout>} path="/documentation" />
              <Route element={<Layout><SettingsPage /></Layout>} path="/settings" />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
