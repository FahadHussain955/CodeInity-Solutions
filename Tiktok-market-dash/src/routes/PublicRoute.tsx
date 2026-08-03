import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const PublicRoute = () => {
  const isAuthenticated = false // TODO: Replace with real auth check

  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />
}

export default PublicRoute
