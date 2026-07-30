// =============================================================================
// AI SIGNALS PAGE
// Displays all AI-generated trading signals with filtering by direction.
// =============================================================================

import { useState, useEffect } from 'react';
import { getPredictions } from '../../services/predictionService';
import { mockAssets } from '../../data/assets';
import PredictionCard from '../../components/cards/PredictionCard';
import { PageLoader } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { SIGNAL_DIRECTIONS } from '../../constants/appConstants';

const FILTER_OPTIONS = [
  { label: 'All Signals', value: 'all' },
  { label: 'Buy', value: SIGNAL_DIRECTIONS.BUY },
  { label: 'Sell', value: SIGNAL_DIRECTIONS.SELL },
  { label: 'Hold', value: SIGNAL_DIRECTIONS.HOLD },
];

/**
 * AISignals — full list of AI-generated trading signals.
 */
export default function AISignals() {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directionFilter, setDirectionFilter] = useState('all');

  const fetchSignals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPredictions();
      setPredictions(data);
    } catch (err) {
      setError(err.message ?? 'Failed to load AI signals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSignals(); }, []);

  const filtered = directionFilter === 'all'
    ? predictions
    : predictions.filter((p) => p.direction === directionFilter);

  if (isLoading) return <PageLoader label="Analyzing markets..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchSignals} variant="page" />;

  return (
    <div className="page ai-signals-page" data-testid="ai-signals-page">
      {/* ── Direction filter tabs ── */}
      <div className="signals-filter" role="tablist" aria-label="Filter signals by direction">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={directionFilter === opt.value}
            className={`filter-tab${directionFilter === opt.value ? ' filter-tab--active' : ''}`}
            onClick={() => setDirectionFilter(opt.value)}
            data-testid={`signal-filter-${opt.value}`}
          >
            {opt.label}
            <span className="filter-tab-count">
              {opt.value === 'all'
                ? predictions.length
                : predictions.filter((p) => p.direction === opt.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Signal cards ── */}
      <div className="signals-grid" data-testid="signals-grid">
        {filtered.map((pred) => {
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

      {filtered.length === 0 && (
        <p className="signals-empty" data-testid="signals-empty">
          No {directionFilter} signals available.
        </p>
      )}
    </div>
  );
}
