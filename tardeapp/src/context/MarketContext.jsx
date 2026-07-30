// =============================================================================
// MARKET CONTEXT
// Central state for all market data: assets, search, filter, and sorting.
// Consumes the market service layer — swap service implementation for real API.
// =============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { getAssets } from '../services/marketService';
import { applyFilters } from '../utils/filterAssets';
import { ASSET_TYPES, SORT_OPTIONS } from '../constants/appConstants';

// ─── Context Creation ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} MarketContextValue
 * @property {Asset[]} assets - All raw assets from the service
 * @property {Asset[]} filteredAssets - Assets after search/filter/sort applied
 * @property {boolean} isLoading
 * @property {string | null} error
 * @property {string} searchQuery
 * @property {string} selectedType - 'all' | 'stock' | 'crypto'
 * @property {string} sortKey
 * @property {(q: string) => void} setSearchQuery
 * @property {(type: string) => void} setSelectedType
 * @property {(key: string) => void} setSortKey
 * @property {() => void} refreshAssets
 */

/** @type {React.Context<MarketContextValue>} */
export const MarketContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * MarketProvider — provides market data and filter state to the tree.
 * @param {{ children: React.ReactNode }} props
 */
export function MarketProvider({ children }) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortKey, setSortKey] = useState(SORT_OPTIONS.MARKET_CAP_DESC);

  // Derived: filtered + sorted asset list
  const filteredAssets = applyFilters(assets, {
    type: selectedType,
    search: searchQuery,
    sortKey,
  });

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      setError(err.message ?? 'Failed to load market data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
    // FUTURE: Set up real-time subscription here
    // e.g. supabase.channel('assets').on('postgres_changes', ...).subscribe()
  }, [fetchAssets]);

  const value = {
    assets,
    filteredAssets,
    isLoading,
    error,
    searchQuery,
    selectedType,
    sortKey,
    setSearchQuery,
    setSelectedType,
    setSortKey,
    refreshAssets: fetchAssets,
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useMarketContext — consume MarketContext. Must be inside MarketProvider.
 * Prefer the useMarket() hook in src/hooks/useMarket.js for component use.
 * @returns {MarketContextValue}
 */
export function useMarketContext() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarketContext must be used within a MarketProvider');
  return ctx;
}
