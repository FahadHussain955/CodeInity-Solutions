// =============================================================================
// ASSET TABLE — Tabular list view of assets
// Used in: Markets page, Watchlist (table view)
//
// FUTURE: Add column sorting, virtual scrolling for large lists (react-virtual)
// =============================================================================

import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import {
  formatPrice,
  formatPercent,
  formatLargeNumber,
  getPriceChangeClass,
} from '../../utils/formatCurrency';
import { buildRoute } from '../../constants/appConstants';

/**
 * AssetTable — full-width responsive table of assets.
 *
 * @param {Object} props
 * @param {Asset[]} props.assets
 * @param {string[]} [props.watchlistIds] - IDs currently on watchlist
 * @param {(id: string) => void} [props.onWatchlistToggle]
 */
export default function AssetTable({ assets, watchlistIds = [], onWatchlistToggle }) {
  const navigate = useNavigate();

  if (!assets || assets.length === 0) {
    return (
      <p className="asset-table-empty" data-testid="asset-table-empty">
        No assets found.
      </p>
    );
  }

  return (
    <div className="asset-table-wrapper" data-testid="asset-table">
      <table className="asset-table">
        <thead>
          <tr>
            <th scope="col" className="asset-table-th asset-table-th--watchlist" aria-label="Watchlist" />
            <th scope="col" className="asset-table-th">Asset</th>
            <th scope="col" className="asset-table-th asset-table-th--right">Price</th>
            <th scope="col" className="asset-table-th asset-table-th--right">24h Change</th>
            <th scope="col" className="asset-table-th asset-table-th--right">Market Cap</th>
            <th scope="col" className="asset-table-th asset-table-th--right">Volume</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const isWatched = watchlistIds.includes(asset.id);
            const changeClass = getPriceChangeClass(asset.changePercent);
            const isPositive = asset.changePercent >= 0;

            return (
              <tr
                key={asset.id}
                className="asset-table-row"
                onClick={() => navigate(buildRoute.assetDetails(asset.id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(buildRoute.assetDetails(asset.id))}
                aria-label={`View ${asset.name}`}
                data-testid={`asset-row-${asset.id}`}
              >
                {/* Watchlist */}
                <td className="asset-table-td asset-table-td--watchlist">
                  {onWatchlistToggle && (
                    <button
                      className={`table-watchlist-btn${isWatched ? ' table-watchlist-btn--active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onWatchlistToggle(asset.id); }}
                      aria-label={isWatched ? `Remove ${asset.symbol} from watchlist` : `Add ${asset.symbol} to watchlist`}
                      aria-pressed={isWatched}
                      data-testid={`table-watchlist-btn-${asset.id}`}
                    >
                      <Star size={14} fill={isWatched ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </td>

                {/* Identity */}
                <td className="asset-table-td">
                  <div className="asset-table-identity">
                    <span className="asset-table-symbol">{asset.symbol}</span>
                    <span className="asset-table-name">{asset.name}</span>
                  </div>
                </td>

                {/* Price */}
                <td className="asset-table-td asset-table-td--right asset-table-price">
                  {formatPrice(asset.price)}
                </td>

                {/* 24h Change */}
                <td className={`asset-table-td asset-table-td--right asset-table-change asset-table-change--${changeClass}`}>
                  <div className="asset-table-change-inner">
                    {isPositive
                      ? <TrendingUp size={12} aria-hidden="true" />
                      : <TrendingDown size={12} aria-hidden="true" />
                    }
                    {formatPercent(asset.changePercent, 2, true)}
                  </div>
                </td>

                {/* Market Cap */}
                <td className="asset-table-td asset-table-td--right">
                  {asset.marketCap ? formatLargeNumber(asset.marketCap) : '—'}
                </td>

                {/* Volume */}
                <td className="asset-table-td asset-table-td--right">
                  {asset.volume ? formatLargeNumber(asset.volume) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
