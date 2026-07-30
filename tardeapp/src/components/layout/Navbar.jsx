// =============================================================================
// NAVBAR
// Top navigation bar. Shows page title, search trigger, and user controls.
//
// FUTURE:
//   - Add global search (open SearchBar modal on click)
//   - Add notification bell with unread count
//   - Add user avatar dropdown (profile, logout)
//   - Add theme toggle button (connects to ThemeContext)
// =============================================================================

import { useLocation } from 'react-router-dom';
import { Bell, Search, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NAV_ITEMS } from '../../constants/appConstants';

/**
 * Derives a human-readable page title from the current route path.
 * @param {string} pathname
 * @returns {string}
 */
function getPageTitle(pathname) {
  const match = NAV_ITEMS.find((item) =>
    pathname === '/' ? item.path === '/' : pathname.startsWith(item.path) && item.path !== '/'
  );
  return match?.label ?? 'Page';
}

/**
 * Navbar — top application bar rendered inside MainLayout.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="navbar" data-testid="navbar">
      {/* ── Left: Page title / breadcrumb ── */}
      <div className="navbar-left">
        <h1 className="navbar-page-title" data-testid="navbar-title">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: Actions ── */}
      <div className="navbar-right">
        {/* Search trigger — FUTURE: opens a SearchModal */}
        <button
          className="navbar-action-btn"
          aria-label="Open search"
          data-testid="navbar-search-btn"
        >
          <Search size={20} />
        </button>

        {/* Theme toggle */}
        <button
          className="navbar-action-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          data-testid="navbar-theme-toggle"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications — FUTURE: badge count from notification context */}
        <button
          className="navbar-action-btn"
          aria-label="Notifications"
          data-testid="navbar-notifications-btn"
        >
          <Bell size={20} />
        </button>

        {/* User avatar — FUTURE: opens profile dropdown */}
        <button
          className="navbar-action-btn"
          aria-label="User profile"
          data-testid="navbar-user-btn"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
