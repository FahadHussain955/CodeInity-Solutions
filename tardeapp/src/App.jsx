// =============================================================================
// APP.JSX
// Root application component.
// Composes all Context Providers and renders the routing tree.
//
// Provider order matters — inner providers can consume outer ones:
//   ThemeProvider (no deps)
//     └── MarketProvider (no deps)
//           └── PortfolioProvider (uses MarketContext in future)
//                 └── WatchlistProvider (uses MarketContext in future)
// =============================================================================

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MarketProvider } from './context/MarketContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { WatchlistProvider } from './context/WatchlistContext';
import AppRoutes from './routes/AppRoutes';

/**
 * AppProviders — stacks all context providers.
 * Extract this to a separate file if providers grow.
 */
function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <MarketProvider>
        <PortfolioProvider>
          <WatchlistProvider>
            {children}
          </WatchlistProvider>
        </PortfolioProvider>
      </MarketProvider>
    </ThemeProvider>
  );
}

/**
 * App — root component. BrowserRouter wraps AppProviders so that
 * context providers (e.g. Navbar) can call useNavigate / useLocation.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
