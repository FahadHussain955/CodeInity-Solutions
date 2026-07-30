// =============================================================================
// ASSET CARD — Compact display card for a single asset
// Used in: Markets grid, Watchlist, Dashboard quick-view
//
// Props:
//   asset: Asset object from mock data / market service
//   onWatchlistToggle: optional callback
//   isWatched: boolean
//   onClick: navigation handler
// =============================================================================

import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatPercent, getPriceChangeClass } from '../../utils/formatCurrency';
import { buildRoute } from '../../constants/appConstants';

/**
 * AssetCard — clickable card showing asset summary.
 *
 * @param {Object} props
 * @param {Asset} props.asset
 * @param {boolean} [props.isWatched=false]
 * @param {(id: string) => void} [props.onWatchlistToggle]
 */
export default function AssetCard({ asset, isWatched = false, onWatchlistToggle }) {
  const navigate = useNavigate();
  const isPositive = asset.changePercent >= 0;
  const changeClass = getPriceChangeClass(asset.changePercent);

  const handleCardClick = () => navigate(buildRoute.assetDetails(asset.id));

  const handleWatchlistClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    onWatchlistToggle?.(asset.id);
  };

  return (
    <article
      className="asset-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`${asset.name} — ${formatPrice(asset.price)}`}
      data-testid={`asset-card-${asset.id}`}
    >
      {/* ── Header: symbol + watchlist toggle ── */}
      <div className="asset-card-header">
        <div className="asset-card-identity">
          <span className="asset-card-symbol">{asset.symbol}</span>
          <span className="asset-card-type-badge">{asset.type}</span>
        </div>

        {onWatchlistToggle && (
          <button
            className={`asset-card-watchlist-btn${isWatched ? ' asset-card-watchlist-btn--active' : ''}`}
            onClick={handleWatchlistClick}
            aria-label={isWatched ? `Remove ${asset.symbol} from watchlist` : `Add ${asset.symbol} to watchlist`}
            aria-pressed={isWatched}
            data-testid={`watchlist-btn-${asset.id}`}
          >
            <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* ── Name ── */}
      <p className="asset-card-name">{asset.name}</p>

      {/* ── Price ── */}
      <p className="asset-card-price">{formatPrice(asset.price)}</p>

      {/* ── Change ── */}
      <div className={`asset-card-change asset-card-change--${changeClass}`}>
        {isPositive ? (
          <TrendingUp size={14} aria-hidden="true" />
        ) : (
          <TrendingDown size={14} aria-hidden="true" />
        )}
        <span>{formatPercent(asset.changePercent, 2, true)}</span>
      </div>
    </article>
  );
}
