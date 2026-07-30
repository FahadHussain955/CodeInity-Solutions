// =============================================================================
// ASSET DETAILS PAGE
// Full detail view for a single asset.
// Route: /assets/:id
//
// Shows: price, change, market stats, AI prediction, portfolio position,
//        and a chart placeholder (wire up Recharts in Phase 2).
// =============================================================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { getAssetById } from '../../services/marketService';
import { getPredictionByAssetId } from '../../services/predictionService';
import { PageLoader } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import PredictionCard from '../../components/cards/PredictionCard';
import ChartContainer from '../../components/charts/ChartContainer';
import useWatchlist from '../../hooks/useWatchlist';
import { formatPrice, formatPercent, formatLargeNumber } from '../../utils/formatCurrency';

/**
 * AssetDetails — full-page detail view for a single asset.
 */
export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWatched, toggleWatchlist } = useWatchlist();

  const [asset, setAsset] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [assetData, predData] = await Promise.all([
        getAssetById(id),
        getPredictionByAssetId(id),
      ]);
      if (!assetData) {
        setError(`Asset "${id}" not found.`);
      } else {
        setAsset(assetData);
        setPrediction(predData);
      }
    } catch (err) {
      setError(err.message ?? 'Failed to load asset details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (isLoading) return <PageLoader label="Loading asset..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} variant="page" />;
  if (!asset) return null;

  const watched = isWatched(asset.id);
  const isPositive = asset.changePercent >= 0;

  return (
    <div className="page asset-details-page" data-testid="asset-details-page">
      {/* ── Back button ── */}
      <button
        className="asset-details-back"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        data-testid="asset-details-back"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* ── Header ── */}
      <div className="asset-details-header">
        <div className="asset-details-identity">
          <h2 className="asset-details-symbol">{asset.symbol}</h2>
          <span className="asset-details-name">{asset.name}</span>
          <span className="asset-details-type">{asset.type}</span>
        </div>

        <button
          className={`asset-details-watchlist-btn${watched ? ' asset-details-watchlist-btn--active' : ''}`}
          onClick={() => toggleWatchlist(asset.id)}
          aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-pressed={watched}
          data-testid="asset-details-watchlist-btn"
        >
          <Star size={20} fill={watched ? 'currentColor' : 'none'} />
          {watched ? 'Watching' : 'Watch'}
        </button>
      </div>

      {/* ── Price block ── */}
      <div className="asset-details-price-block" data-testid="asset-details-price">
        <span className="asset-details-price">{formatPrice(asset.price)}</span>
        <span className={`asset-details-change asset-details-change--${isPositive ? 'positive' : 'negative'}`}>
          {formatPercent(asset.changePercent, 2, true)}
        </span>
      </div>

      {/* ── Market stats grid ── */}
      <div className="asset-details-stats" data-testid="asset-details-stats">
        {[
          { label: '24h High', value: formatPrice(asset.high24h) },
          { label: '24h Low', value: formatPrice(asset.low24h) },
          { label: 'Market Cap', value: formatLargeNumber(asset.marketCap) },
          { label: 'Volume', value: formatLargeNumber(asset.volume) },
        ].map(({ label, value }) => (
          <div key={label} className="asset-details-stat">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Price chart placeholder ── */}
      <ChartContainer
        title="Price History"
        subtitle="Chart data coming in Phase 2"
        isLoading={false}
        height={280}
      >
        {/* PHASE 2: Replace with <LineChart data={priceHistory}>...</LineChart> */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
          data-testid="chart-placeholder"
        >
          Chart placeholder — wire up Recharts in Phase 2
        </div>
      </ChartContainer>

      {/* ── AI Prediction ── */}
      {prediction && (
        <>
          <h3 className="page-section-title">AI Signal</h3>
          <PredictionCard
            prediction={prediction}
            assetSymbol={asset.symbol}
            assetName={asset.name}
          />
        </>
      )}
    </div>
  );
}
