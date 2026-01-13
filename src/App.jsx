import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { CompanyProvider } from '@/context/CompanyContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import Layout from '@/components/layout/Layout'
import Loading from '@/components/common/Loading'

// Lazy Load Pages
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const MachinesPage = lazy(() => import('@/pages/machines/MachinesPage'))
const ManualsPage = lazy(() => import('./pages/manuals/ManualsPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const TicketsPage = lazy(() => import('./pages/tickets/TicketsPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const DocumentationPage = lazy(() => import('./pages/help/DocumentationPage'))
const ChatSupport = lazy(() => import('@/pages/chat/ChatSupport').then(module => ({ default: module.ChatSupport })))

// Helper to wrap lazy components
const Suspended = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CompanyProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/showcase" element={<Suspended><ShowcasePage /></Suspended>} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout><Suspended><DashboardPage /></Suspended></Layout>} path="/" />
                <Route element={<Layout><Suspended><MachinesPage /></Suspended></Layout>} path="/machines" />
                <Route element={<Layout><Suspended><TicketsPage /></Suspended></Layout>} path="/tickets" />
                <Route element={<Layout><Suspended><ManualsPage /></Suspended></Layout>} path="/manuals" />
                <Route element={<Layout><Suspended><ChatSupport /></Suspended></Layout>} path="/chat" />
                <Route element={<Layout><Suspended><UsersPage /></Suspended></Layout>} path="/users" />
                <Route element={<Layout><Suspended><DocumentationPage /></Suspended></Layout>} path="/documentation" />
                <Route element={<Layout><Suspended><SettingsPage /></Suspended></Layout>} path="/settings" />
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
