// =============================================================================
// PORTFOLIO CARD — Displays a single portfolio holding
// Used in: Portfolio page holdings list
//
// Shows: asset identity, current value, cost basis, P&L, ROI, allocation %
// =============================================================================

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  formatCurrency,
  formatPercent,
  formatPrice,
  getPriceChangeClass,
} from '../../utils/formatCurrency';
import { calculateROI, calculatePnL } from '../../utils/calculateROI';
import { buildRoute } from '../../constants/appConstants';

/**
 * PortfolioCard — shows holding details with P&L and allocation.
 *
 * @param {Object} props
 * @param {EnrichedHolding} props.holding - From portfolioService.getPortfolio()
 * @param {number} [props.allocationPercent] - Weight in portfolio (0-100)
 */
export default function PortfolioCard({ holding, allocationPercent }) {
  const navigate = useNavigate();

  const currentValue = holding.currentPrice * holding.quantity;
  const costBasis = holding.averageCost * holding.quantity;
  const pnl = calculatePnL(currentValue, costBasis);
  const roi = calculateROI(currentValue, costBasis);
  const changeClass = getPriceChangeClass(pnl);
  const isPositive = pnl >= 0;

  return (
    <article
      className="portfolio-card"
      onClick={() => navigate(buildRoute.assetDetails(holding.assetId))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(buildRoute.assetDetails(holding.assetId))}
      aria-label={`${holding.name} holding — ${formatCurrency(currentValue)}`}
      data-testid={`portfolio-card-${holding.assetId}`}
    >
      {/* ── Identity ── */}
      <div className="portfolio-card-identity">
        <span className="portfolio-card-symbol">{holding.symbol}</span>
        <span className="portfolio-card-name">{holding.name}</span>
        <span className="portfolio-card-qty">
          {holding.quantity} units @ {formatPrice(holding.averageCost)}
        </span>
      </div>

      {/* ── Values ── */}
      <div className="portfolio-card-values">
        <div className="portfolio-card-value">
          <span className="portfolio-card-value-label">Current</span>
          <span className="portfolio-card-value-amount">{formatCurrency(currentValue)}</span>
        </div>

        <div className={`portfolio-card-pnl portfolio-card-pnl--${changeClass}`}>
          {isPositive ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
          <span>{formatCurrency(Math.abs(pnl))}</span>
          <span>({formatPercent(roi, 2, true)})</span>
        </div>
      </div>

      {/* ── Allocation bar ── */}
      {allocationPercent !== undefined && (
        <div className="portfolio-card-allocation">
          <span className="portfolio-card-allocation-label">
            {formatPercent(allocationPercent, 1)} of portfolio
          </span>
          <div
            className="portfolio-card-allocation-bar"
            role="progressbar"
            aria-valuenow={allocationPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="portfolio-card-allocation-fill"
              style={{ width: `${Math.min(allocationPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
