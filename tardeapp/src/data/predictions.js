// =============================================================================
// MOCK AI PREDICTIONS DATA
// Each entry is an AI-generated signal for a specific asset.
// Shape: { id, assetId, direction, confidence, rsi, volumeChange, reasoning,
//          targetPrice, stopLoss, generatedAt, validUntil }
//
// FUTURE: Replace with predictionService.getPredictions() → AI Prediction API
// =============================================================================

import { SIGNAL_DIRECTIONS } from '../constants/appConstants';

/** @type {Prediction[]} */
export const mockPredictions = [
  {
    id: 'pred-001',
    assetId: 'nvda',
    direction: SIGNAL_DIRECTIONS.BUY,
    confidence: 87,
    rsi: 58.4,
    volumeChange: 34.2,
    targetPrice: 155.00,
    stopLoss: 128.00,
    reasoning:
      'Strong institutional accumulation detected. RSI is in bullish zone without being overbought. Volume surge confirms breakout above key resistance at $134. Positive earnings catalyst expected next quarter.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-06T06:00:00Z',
  },
  {
    id: 'pred-002',
    assetId: 'btc',
    direction: SIGNAL_DIRECTIONS.BUY,
    confidence: 79,
    rsi: 61.2,
    volumeChange: 22.8,
    targetPrice: 125000.00,
    stopLoss: 99000.00,
    reasoning:
      'Bitcoin holding above 200-day EMA with strong support at $105K. On-chain metrics show whale accumulation. Hash rate at all-time high indicates miner confidence. Macro tailwinds from ETF inflows.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-13T06:00:00Z',
  },
  {
    id: 'pred-003',
    assetId: 'tsla',
    direction: SIGNAL_DIRECTIONS.SELL,
    confidence: 72,
    rsi: 71.8,
    volumeChange: -12.4,
    targetPrice: 220.00,
    stopLoss: 265.00,
    reasoning:
      'RSI entering overbought territory at 71.8. Declining volume on recent rally suggests weakening momentum. Bearish divergence on MACD. Competitive pressure from BYD and new EV entrants.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-06T06:00:00Z',
  },
  {
    id: 'pred-004',
    assetId: 'sol',
    direction: SIGNAL_DIRECTIONS.BUY,
    confidence: 83,
    rsi: 55.1,
    volumeChange: 48.7,
    targetPrice: 240.00,
    stopLoss: 178.00,
    reasoning:
      'Solana ecosystem TVL growth of 28% month-over-month. Network activity at record high. Developer activity surging. Technical setup shows bullish flag pattern with strong support at $190.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-13T06:00:00Z',
  },
  {
    id: 'pred-005',
    assetId: 'meta',
    direction: SIGNAL_DIRECTIONS.BUY,
    confidence: 76,
    rsi: 52.3,
    volumeChange: 18.9,
    targetPrice: 650.00,
    stopLoss: 545.00,
    reasoning:
      'Meta Reality Labs showing improving unit economics. AI-driven ad revenue accelerating. Instagram and WhatsApp monetization expanding. P/E ratio attractive relative to growth peers.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-06T06:00:00Z',
  },
  {
    id: 'pred-006',
    assetId: 'xrp',
    direction: SIGNAL_DIRECTIONS.HOLD,
    confidence: 58,
    rsi: 49.7,
    volumeChange: 5.2,
    targetPrice: null,
    stopLoss: null,
    reasoning:
      'XRP awaiting regulatory clarity on SEC case outcome. Price consolidating in a tight range. Mixed on-chain signals. Better to hold current positions and wait for directional confirmation.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-06T06:00:00Z',
  },
  {
    id: 'pred-007',
    assetId: 'aapl',
    direction: SIGNAL_DIRECTIONS.HOLD,
    confidence: 64,
    rsi: 53.8,
    volumeChange: 8.1,
    targetPrice: null,
    stopLoss: null,
    reasoning:
      'Apple trading near fair value. iPhone 17 cycle expectations already priced in. Services revenue growth steady but slowing. Await Q3 earnings for directional clarity.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-06T06:00:00Z',
  },
  {
    id: 'pred-008',
    assetId: 'eth',
    direction: SIGNAL_DIRECTIONS.SELL,
    confidence: 68,
    rsi: 68.9,
    volumeChange: -8.3,
    targetPrice: 3400.00,
    stopLoss: 4100.00,
    reasoning:
      'Ethereum approaching key resistance at $3,900. RSI elevated near overbought. Staking yields declining. Layer-2 fragmentation reducing ETH demand. Short-term retracement likely.',
    generatedAt: '2026-07-30T06:00:00Z',
    validUntil: '2026-08-06T06:00:00Z',
  },
];

export default mockPredictions;
