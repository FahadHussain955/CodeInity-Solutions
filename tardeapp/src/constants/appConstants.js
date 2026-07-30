// =============================================================================
// APP CONSTANTS
// Central registry for all static configuration values used across the app.
// Avoids magic strings scattered through components.
// =============================================================================

// Application metadata
export const APP_NAME = 'TradAI';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-Powered Stock & Crypto Trading Platform';

// Route paths — import these instead of hardcoding strings in <Link> / navigate()
export const ROUTES = {
  DASHBOARD: '/',
  MARKETS: '/markets',
  PORTFOLIO: '/portfolio',
  WATCHLIST: '/watchlist',
  SIGNALS: '/signals',
  ASSET_DETAILS: '/assets/:id',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
};

// Helper to build dynamic routes
export const buildRoute = {
  assetDetails: (id) => `/assets/${id}`,
};

// Asset types
export const ASSET_TYPES = {
  STOCK: 'stock',
  CRYPTO: 'crypto',
  ETF: 'etf',
};

// AI signal directions
export const SIGNAL_DIRECTIONS = {
  BUY: 'buy',
  SELL: 'sell',
  HOLD: 'hold',
};

// Signal confidence tiers
export const CONFIDENCE_TIERS = {
  HIGH: 'high',     // >= 75%
  MEDIUM: 'medium', // 50–74%
  LOW: 'low',       // < 50%
};

// Sort options for asset lists
export const SORT_OPTIONS = {
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  CHANGE_ASC: 'change_asc',
  CHANGE_DESC: 'change_desc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  MARKET_CAP_DESC: 'market_cap_desc',
};

// Theme keys — used in localStorage and ThemeContext
export const THEME_KEYS = {
  LIGHT: 'light',
  DARK: 'dark',
  STORAGE_KEY: 'tradai_theme',
};

// Transaction types
export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'tradai_theme',
  WATCHLIST: 'tradai_watchlist',
  USER_SETTINGS: 'tradai_user_settings',
};

// Navigation items — drives Sidebar & mobile nav
export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Markets', path: ROUTES.MARKETS, icon: 'BarChart2' },
  { label: 'Portfolio', path: ROUTES.PORTFOLIO, icon: 'Briefcase' },
  { label: 'Watchlist', path: ROUTES.WATCHLIST, icon: 'Star' },
  { label: 'AI Signals', path: ROUTES.SIGNALS, icon: 'Zap' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
];
