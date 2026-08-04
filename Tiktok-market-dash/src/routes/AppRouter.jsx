import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '@/constants/routes';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// ── Auth Pages ──────────────────────────────────────────────────────────────
const LoginPage    = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// ── Dashboard ───────────────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

// ── Products ────────────────────────────────────────────────────────────────
const ProductsPage   = lazy(() => import('@/pages/products/ProductsPage'));
const AddProductPage = lazy(() => import('@/pages/products/AddProductPage'));

// ── Orders ──────────────────────────────────────────────────────────────────
const OrdersPage     = lazy(() => import('@/pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));

// ── Inventory ───────────────────────────────────────────────────────────────
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));

// ── Customers ───────────────────────────────────────────────────────────────
const CustomersPage      = lazy(() => import('@/pages/customers/CustomersPage'));
const CustomerDetailPage = lazy(() => import('@/pages/customers/CustomerDetailPage'));

// ── Analytics ───────────────────────────────────────────────────────────────
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));

// ── Media ───────────────────────────────────────────────────────────────────
const MediaPage = lazy(() => import('@/pages/media/MediaPage'));

// ── Settings & Profile ──────────────────────────────────────────────────────
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ProfilePage  = lazy(() => import('@/pages/profile/ProfilePage'));

// ── System ──────────────────────────────────────────────────────────────────
const PlaceholderPage = lazy(() => import('@/pages/system/PlaceholderPage'));
const NotFoundPage    = lazy(() => import('@/pages/system/NotFoundPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center animate-pulse">
        <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
          insights
        </span>
      </div>
      <p className="text-body-sm text-on-surface-variant">Loading GrowthAI...</p>
    </div>
  </div>
);

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* ── Public (Auth) Routes ─────────────────────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN}            element={<LoginPage />} />
            <Route path={ROUTES.REGISTER}         element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD}  element={<PlaceholderPage title="Forgot Password" icon="lock_reset" description="Enter your email to receive a password reset link." />} />
            <Route path={ROUTES.RESET_PASSWORD}   element={<PlaceholderPage title="Reset Password"  icon="lock_open"  description="Choose a new secure password for your account." />} />
          </Route>
        </Route>

        {/* ── Protected (Dashboard) Routes ─────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Dashboard */}
            <Route path={ROUTES.DASHBOARD}    element={<DashboardPage />} />

            {/* Products */}
            <Route path={ROUTES.PRODUCTS}     element={<ProductsPage />} />
            <Route path={ROUTES.PRODUCT_NEW}  element={<AddProductPage />} />
            <Route path="/dashboard/products/:id"      element={<PlaceholderPage title="Product Details" icon="inventory_2"   description="Full product info, variants, and performance." />} />
            <Route path="/dashboard/products/:id/edit" element={<AddProductPage />} />

            {/* Orders */}
            <Route path={ROUTES.ORDERS}         element={<OrdersPage />} />
            <Route path="/dashboard/orders/:id" element={<OrderDetailPage />} />

            {/* Inventory */}
            <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />

            {/* Customers */}
            <Route path={ROUTES.CUSTOMERS}           element={<CustomersPage />} />
            <Route path="/dashboard/customers/:id"   element={<CustomerDetailPage />} />

            {/* Analytics */}
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />

            {/* Media */}
            <Route path={ROUTES.MEDIA} element={<MediaPage />} />

            {/* Settings */}
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

            {/* Profile */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
