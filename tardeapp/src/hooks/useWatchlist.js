// =============================================================================
// useWatchlist — custom hook for watchlist state
// Wraps WatchlistContext and exposes a clean, component-friendly API.
// =============================================================================

import { useWatchlistContext } from '../context/WatchlistContext';

/**
 * useWatchlist — access and mutate the user's watchlist.
 *
 * @example
 * const { watchlistAssets, toggleWatchlist, isWatched } = useWatchlist();
 *
 * @returns {WatchlistContextValue}
 */
export function useWatchlist() {
  return useWatchlistContext();
}

export default useWatchlist;
