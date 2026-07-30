// =============================================================================
// WATCHLIST PAGE
// Displays the user's saved assets in table view.
// Supports removing assets from the watchlist inline.
// =============================================================================

import useWatchlist from '../../hooks/useWatchlist';
import AssetTable from '../../components/tables/AssetTable';
import { Star } from 'lucide-react';

/**
 * Watchlist — user's saved assets with quick remove.
 */
export default function Watchlist() {
  const { watchlistAssets, watchlistIds, toggleWatchlist, clearWatchlist } = useWatchlist();

  return (
    <div className="page watchlist-page" data-testid="watchlist-page">
      {/* ── Header ── */}
      <div className="watchlist-header">
        <p className="watchlist-count" aria-live="polite">
          {watchlistAssets.length} saved asset{watchlistAssets.length !== 1 ? 's' : ''}
        </p>
        {watchlistAssets.length > 0 && (
          <button
            className="watchlist-clear-btn"
            onClick={clearWatchlist}
            data-testid="watchlist-clear-btn"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {watchlistAssets.length === 0 ? (
        <div className="watchlist-empty" data-testid="watchlist-empty">
          <Star size={48} aria-hidden="true" />
          <h3>Your watchlist is empty</h3>
          <p>Star any asset in the Markets page to add it here.</p>
        </div>
      ) : (
        <AssetTable
          assets={watchlistAssets}
          watchlistIds={watchlistIds}
          onWatchlistToggle={toggleWatchlist}
        />
      )}
    </div>
  );
}
