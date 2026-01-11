import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import ShowcasePage from '@/pages/ShowcasePage'
import MachinesPage from '@/pages/machines/MachinesPage'
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
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Dashboard /></Layout>} path="/" />
            <Route element={<Layout><MachinesPage /></Layout>} path="/machines" />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
