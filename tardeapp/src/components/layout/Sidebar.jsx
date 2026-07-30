// =============================================================================
// SIDEBAR
// Persistent left-side navigation panel.
// Renders NAV_ITEMS from appConstants and highlights the active route.
//
// FUTURE:
//   - Add user avatar + plan badge at bottom
//   - Add collapsible/drawer mode for mobile
//   - Add notification badge on AI Signals link
// =============================================================================

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Briefcase,
  Star,
  Zap,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '../../constants/appConstants';

// Map icon name strings from NAV_ITEMS to actual Lucide components
const ICON_MAP = {
  LayoutDashboard,
  BarChart2,
  Briefcase,
  Star,
  Zap,
  Settings,
};

/**
 * Sidebar — persistent navigation rail.
 * Uses React Router <NavLink> for automatic active-link styling.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar" data-testid="sidebar">
      {/* ── Brand / Logo ── */}
      <div className="sidebar-brand" data-testid="sidebar-brand">
        <TrendingUp size={24} aria-hidden="true" />
        <span className="sidebar-brand-name">{APP_NAME}</span>
      </div>

      {/* ── Navigation links ── */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <ul role="list">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
                  }
                  aria-label={item.label}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer placeholder (user info, version) ── */}
      <div className="sidebar-footer" data-testid="sidebar-footer">
        {/* FUTURE: <UserAvatar /> + plan badge */}
        <span className="sidebar-version">v1.0.0</span>
      </div>
    </aside>
  );
}
