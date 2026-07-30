// =============================================================================
// WATCHLIST CONTEXT
// Manages the user's saved/watchlisted assets.
// Persists to localStorage. FUTURE: sync to Supabase user_watchlists table.
// =============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { STORAGE_KEYS } from '../constants/appConstants';
import { mockAssets } from '../data/assets';

// ─── Context Creation ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} WatchlistContextValue
 * @property {string[]} watchlistIds - Asset IDs currently on the watchlist
 * @property {Asset[]} watchlistAssets - Full asset objects for watchlisted IDs
 * @property {(id: string) => boolean} isWatched - Returns true if asset is watched
 * @property {(id: string) => void} addToWatchlist
 * @property {(id: string) => void} removeFromWatchlist
 * @property {(id: string) => void} toggleWatchlist - Add if absent, remove if present
 * @property {() => void} clearWatchlist
 */

/** @type {React.Context<WatchlistContextValue>} */
export const WatchlistContext = createContext(null);

// ─── Default watchlist (pre-populate for demo) ────────────────────────────────
const DEFAULT_WATCHLIST = ['btc', 'eth', 'aapl', 'nvda', 'sol'];

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * WatchlistProvider — provides watchlist state and mutation helpers.
 * @param {{ children: React.ReactNode }} props
 */
export function WatchlistProvider({ children }) {
  const [watchlistIds, setWatchlistIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return stored ? JSON.parse(stored) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });

  // Derive full asset objects from IDs
  const watchlistAssets = mockAssets.filter((a) => watchlistIds.includes(a.id));
  // FUTURE: Replace above with context subscription to MarketContext assets

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlistIds));
    // FUTURE: await supabase.from('watchlist').upsert({ user_id, ids: watchlistIds })
  }, [watchlistIds]);

  const isWatched = useCallback(
    (id) => watchlistIds.includes(id),
    [watchlistIds]
  );

  const addToWatchlist = useCallback((id) => {
    setWatchlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromWatchlist = useCallback((id) => {
    setWatchlistIds((prev) => prev.filter((existingId) => existingId !== id));
  }, []);

  const toggleWatchlist = useCallback((id) => {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const clearWatchlist = useCallback(() => setWatchlistIds([]), []);

  const value = {
    watchlistIds,
    watchlistAssets,
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useWatchlistContext — consume WatchlistContext.
 * Prefer the useWatchlist() hook in src/hooks/useWatchlist.js for components.
 * @returns {WatchlistContextValue}
 */
export function useWatchlistContext() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlistContext must be used within a WatchlistProvider');
  return ctx;
}
