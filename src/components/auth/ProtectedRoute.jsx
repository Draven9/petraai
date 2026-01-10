import { useAuth } from '@/context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import Loading from '@/components/common/Loading'

export default function ProtectedRoute() {
    const { user, loading } = useAuth()

    if (loading) return <Loading fullScreen />

    // If not authenticated, redirect to login
    if (!user) return <Navigate to="/login" replace />

    // If authenticated, render child routes
    return <Outlet />
}
