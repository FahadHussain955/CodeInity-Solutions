// =============================================================================
// useMarket — custom hook for market data
// Wraps MarketContext and exposes a clean, component-friendly API.
// Import this in components instead of consuming MarketContext directly.
// =============================================================================

import { useMarketContext } from '../context/MarketContext';

/**
 * useMarket — access market assets, filters, and search.
 *
 * @example
 * const { filteredAssets, isLoading, setSearchQuery } = useMarket();
 *
 * @returns {MarketContextValue}
 */
export function useMarket() {
  return useMarketContext();
}

export default useMarket;
