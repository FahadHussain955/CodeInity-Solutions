import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import { Suspense } from 'react'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<div>Login Page Placeholder</div>} />
            <Route path={ROUTES.REGISTER} element={<div>Register Page Placeholder</div>} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.DASHBOARD} element={<div>Dashboard Layout Placeholder</div>}>
               {/* Nested dashboard routes will go here */}
            </Route>
          </Route>
          
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
