// =============================================================================
// APP ROUTES
// Centralized routing configuration using React Router v7.
// All page routes are nested under MainLayout so they share the
// Sidebar + Navbar shell.
//
// To add a new route:
//   1. Create the page component in src/pages/YourPage/
//   2. Import it here
//   3. Add a <Route> inside the layout route
// =============================================================================

import { Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Auth pages (standalone — no MainLayout)
import LoginPage from '../pages/login';

// Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Markets from '../pages/Markets/Markets';
import Portfolio from '../pages/Portfolio/Portfolio';
import Watchlist from '../pages/Watchlist/Watchlist';
import AISignals from '../pages/AISignals/AISignals';
import AssetDetails from '../pages/AssetDetails/AssetDetails';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound/NotFound';

// Constants
import { ROUTES } from '../constants/appConstants';

/**
 * AppRoutes — defines the complete client-side routing tree.
 * Rendered inside <BrowserRouter> in main.jsx.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/*
        All authenticated / main app routes live inside MainLayout.
        FUTURE: Replace this route with a ProtectedRoute wrapper that
        redirects to /login when no Supabase session exists.
      */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.MARKETS} element={<Markets />} />
        <Route path={ROUTES.PORTFOLIO} element={<Portfolio />} />
        <Route path={ROUTES.WATCHLIST} element={<Watchlist />} />
        <Route path={ROUTES.SIGNALS} element={<AISignals />} />
        <Route path={ROUTES.ASSET_DETAILS} element={<AssetDetails />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Route>

      {/* Login — standalone, full-screen, no Sidebar/Navbar */}
      <Route path="/login" element={<LoginPage />} />

      {/* 404 — outside layout so it renders full-screen */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  );
}
