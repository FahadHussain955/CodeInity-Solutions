// =============================================================================
// DASHBOARD PAGE
// Overview: portfolio summary, top movers, quick watchlist, AI signals preview.
// =============================================================================

import { usePortfolio } from '../../hooks/usePortfolio';
import { useMarket } from '../../hooks/useMarket';
import { PageLoader } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import AssetCard from '../../components/cards/AssetCard';
import PredictionCard from '../../components/cards/PredictionCard';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useState, useEffect } from 'react';
import { getPredictions } from '../../services/predictionService';
import { mockAssets } from '../../data/assets';

/**
 * Dashboard — landing page showing portfolio overview + market highlights.
 */
export default function Dashboard() {
  const { summary, isLoading: portfolioLoading, error: portfolioError, refreshPortfolio } = usePortfolio();
  const { assets, isLoading: marketLoading } = useMarket();
  const { toggleWatchlist, isWatched } = useWatchlist();

  const [topSignals, setTopSignals] = useState([]);

  useEffect(() => {
    getPredictions().then((preds) => setTopSignals(preds.slice(0, 3)));
  }, []);

  // Top 4 gainers for quick view
  const topGainers = [...assets]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4);

  if (portfolioLoading || marketLoading) return <PageLoader label="Loading dashboard..." />;
  if (portfolioError) return <ErrorMessage message={portfolioError} onRetry={refreshPortfolio} variant="page" />;

  return (
    <div className="page dashboard-page" data-testid="dashboard-page">
      <h2 className="page-section-title">Portfolio Overview</h2>

      {/* ── Portfolio Summary Stats ── */}
      {summary && (
        <div className="dashboard-stats" data-testid="dashboard-stats">
          <div className="stat-card" data-testid="stat-total-value">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">{formatCurrency(summary.totalValue)}</span>
          </div>
          <div className="stat-card" data-testid="stat-total-pnl">
            <span className="stat-label">Total P&amp;L</span>
            <span className="stat-value">{formatCurrency(summary.totalPnL)}</span>
          </div>
          <div className="stat-card" data-testid="stat-total-roi">
            <span className="stat-label">ROI</span>
            <span className="stat-value">{formatPercent(summary.totalROI, 2, true)}</span>
          </div>
          <div className="stat-card" data-testid="stat-total-cost">
            <span className="stat-label">Cost Basis</span>
            <span className="stat-value">{formatCurrency(summary.totalCost)}</span>
          </div>
        </div>
      )}

      {/* ── Top Movers ── */}
      <h2 className="page-section-title">Top Movers</h2>
      <div className="dashboard-movers" data-testid="dashboard-movers">
        {topGainers.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isWatched={isWatched(asset.id)}
            onWatchlistToggle={toggleWatchlist}
          />
        ))}
      </div>

      {/* ── AI Signal Preview ── */}
      <h2 className="page-section-title">Latest AI Signals</h2>
      <div className="dashboard-signals" data-testid="dashboard-signals">
        {topSignals.map((pred) => {
          const asset = mockAssets.find((a) => a.id === pred.assetId);
          return (
            <PredictionCard
              key={pred.id}
              prediction={pred}
              assetSymbol={asset?.symbol}
              assetName={asset?.name}
            />
          );
        })}
      </div>
    </div>
  );
}
