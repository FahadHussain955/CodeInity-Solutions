// =============================================================================
// MARKETS PAGE
// Full asset list with search, filter by type, and sort controls.
// Supports grid (cards) and table (list) view toggle.
// =============================================================================

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import useMarket from '../../hooks/useMarket';
import useWatchlist from '../../hooks/useWatchlist';
import { PageLoader } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import SearchBar from '../../components/common/SearchBar';
import FilterComponent from '../../components/common/FilterComponent';
import AssetCard from '../../components/cards/AssetCard';
import AssetTable from '../../components/tables/AssetTable';

/**
 * Markets — full asset browser with search, filter, and view toggle.
 */
export default function Markets() {
  const { filteredAssets, isLoading, error, refreshAssets } = useMarket();
  const { watchlistIds, toggleWatchlist } = useWatchlist();
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'

  if (isLoading) return <PageLoader label="Loading markets..." />;
  if (error) return <ErrorMessage message={error} onRetry={refreshAssets} variant="page" />;

  return (
    <div className="page markets-page" data-testid="markets-page">
      {/* ── Toolbar ── */}
      <div className="markets-toolbar">
        <SearchBar />
        <FilterComponent />

        {/* View mode toggle */}
        <div className="markets-view-toggle" role="group" aria-label="View mode">
          <button
            className={`view-toggle-btn${viewMode === 'grid' ? ' view-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            data-testid="view-toggle-grid"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'table' ? ' view-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            aria-pressed={viewMode === 'table'}
            data-testid="view-toggle-table"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="markets-count" aria-live="polite" data-testid="markets-count">
        {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
      </p>

      {/* ── Asset list ── */}
      {viewMode === 'grid' ? (
        <div className="markets-grid" data-testid="markets-grid">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isWatched={watchlistIds.includes(asset.id)}
              onWatchlistToggle={toggleWatchlist}
            />
          ))}
        </div>
      ) : (
        <AssetTable
          assets={filteredAssets}
          watchlistIds={watchlistIds}
          onWatchlistToggle={toggleWatchlist}
        />
      )}
    </div>
  );
}
