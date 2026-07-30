// =============================================================================
// PREDICTION CARD — Displays an AI-generated trading signal
// Used in: AI Signals page, Asset Details panel
//
// Shows: direction badge, confidence bar, RSI, reasoning, target/stop loss
// =============================================================================

import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';
import { SIGNAL_DIRECTIONS } from '../../constants/appConstants';
import { formatPrice, formatPercent } from '../../utils/formatCurrency';

// Direction config for styling and icons
const DIRECTION_CONFIG = {
  [SIGNAL_DIRECTIONS.BUY]: {
    label: 'BUY',
    icon: TrendingUp,
    className: 'prediction-card--buy',
    badgeClass: 'badge--buy',
  },
  [SIGNAL_DIRECTIONS.SELL]: {
    label: 'SELL',
    icon: TrendingDown,
    className: 'prediction-card--sell',
    badgeClass: 'badge--sell',
  },
  [SIGNAL_DIRECTIONS.HOLD]: {
    label: 'HOLD',
    icon: Minus,
    className: 'prediction-card--hold',
    badgeClass: 'badge--hold',
  },
};

/**
 * PredictionCard — displays an AI signal for an asset.
 *
 * @param {Object} props
 * @param {Prediction} props.prediction
 * @param {string} [props.assetSymbol] - e.g. 'BTC'
 * @param {string} [props.assetName]
 */
export default function PredictionCard({ prediction, assetSymbol, assetName }) {
  const config = DIRECTION_CONFIG[prediction.direction] ?? DIRECTION_CONFIG[SIGNAL_DIRECTIONS.HOLD];
  const DirectionIcon = config.icon;

  return (
    <article
      className={`prediction-card ${config.className}`}
      data-testid={`prediction-card-${prediction.id}`}
    >
      {/* ── Header ── */}
      <div className="prediction-card-header">
        <div className="prediction-card-asset">
          <Brain size={16} aria-hidden="true" className="prediction-card-ai-icon" />
          <span className="prediction-card-symbol">{assetSymbol ?? prediction.assetId.toUpperCase()}</span>
          {assetName && <span className="prediction-card-name">{assetName}</span>}
        </div>

        <span className={`direction-badge ${config.badgeClass}`} aria-label={`Signal: ${config.label}`}>
          <DirectionIcon size={12} aria-hidden="true" />
          {config.label}
        </span>
      </div>

      {/* ── Confidence bar ── */}
      <div className="prediction-confidence">
        <div className="prediction-confidence-header">
          <span>AI Confidence</span>
          <strong>{prediction.confidence}%</strong>
        </div>
        <div
          className="prediction-confidence-bar"
          role="progressbar"
          aria-valuenow={prediction.confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence: ${prediction.confidence}%`}
        >
          <div
            className="prediction-confidence-fill"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>

      {/* ── Indicators ── */}
      <div className="prediction-indicators">
        <div className="prediction-indicator">
          <span className="indicator-label">RSI</span>
          <span className="indicator-value">{prediction.rsi}</span>
        </div>
        <div className="prediction-indicator">
          <span className="indicator-label">Vol. Δ</span>
          <span className="indicator-value">
            {formatPercent(prediction.volumeChange, 1, true)}
          </span>
        </div>
        {prediction.targetPrice && (
          <div className="prediction-indicator">
            <span className="indicator-label">Target</span>
            <span className="indicator-value">{formatPrice(prediction.targetPrice)}</span>
          </div>
        )}
        {prediction.stopLoss && (
          <div className="prediction-indicator">
            <span className="indicator-label">Stop</span>
            <span className="indicator-value">{formatPrice(prediction.stopLoss)}</span>
          </div>
        )}
      </div>

      {/* ── Reasoning ── */}
      <p className="prediction-reasoning">{prediction.reasoning}</p>
    </article>
  );
}
