import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { CompanyProvider } from '@/context/CompanyContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import ShowcasePage from './pages/ShowcasePage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MachinesPage from '@/pages/machines/MachinesPage'
import ManualsPage from './pages/manuals/ManualsPage'
import SettingsPage from './pages/settings/SettingsPage'
import TicketsPage from './pages/tickets/TicketsPage'
import UsersPage from './pages/users/UsersPage'
import DocumentationPage from './pages/help/DocumentationPage'
import { ChatSupport } from '@/pages/chat/ChatSupport'
import Layout from '@/components/layout/Layout'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CompanyProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/showcase" element={<ShowcasePage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout><DashboardPage /></Layout>} path="/" />
                <Route element={<Layout><MachinesPage /></Layout>} path="/machines" />
                <Route element={<Layout><TicketsPage /></Layout>} path="/tickets" />
                <Route element={<Layout><ManualsPage /></Layout>} path="/manuals" />
                <Route element={<Layout><ChatSupport /></Layout>} path="/chat" />
                <Route element={<Layout><UsersPage /></Layout>} path="/users" />
                <Route element={<Layout><DocumentationPage /></Layout>} path="/documentation" />
                <Route element={<Layout><SettingsPage /></Layout>} path="/settings" />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CompanyProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
