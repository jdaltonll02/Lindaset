import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated)
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" />
  }
  
  console.log('Authenticated, rendering Outlet')
  return <Outlet />
}