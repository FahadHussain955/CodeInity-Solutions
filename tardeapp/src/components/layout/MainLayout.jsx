// =============================================================================
// MAIN LAYOUT
// The root shell for all authenticated pages.
// Composes: Sidebar + Navbar + <Outlet /> (page content).
//
// Structure:
//   <div.layout-root>
//     <Sidebar />               ← persistent left navigation
//     <div.layout-main>
//       <Navbar />              ← top bar (breadcrumb, search, user)
//       <main.layout-content>
//         <Outlet />            ← active page renders here
//       </main>
//     </div>
//   </div>
// =============================================================================

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * MainLayout — shared shell for all app pages.
 * Rendered by the parent layout Route in AppRoutes.jsx.
 */
export default function MainLayout() {
  return (
    <div className="layout-root" data-testid="main-layout">
      {/* ── Left sidebar navigation ── */}
      <Sidebar />

      {/* ── Right: Navbar + page content ── */}
      <div className="layout-main">
        <Navbar />

        <main className="layout-content" data-testid="page-content">
          {/*
            React Router renders the matched child route here.
            FUTURE: Add <Suspense fallback={<PageLoader />}> for code-split pages.
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
