// =============================================================================
// PREDICTION SERVICE
// Abstracts all AI prediction data fetching.
// Currently returns mock data. Replace with AI Prediction API calls.
//
// FUTURE INTEGRATION:
//   import { AI_API_BASE } from '../constants/appConstants';
//   const res = await fetch(`${AI_API_BASE}/predictions`);
// =============================================================================

import { mockPredictions } from '../data/predictions';
import { SIGNAL_DIRECTIONS } from '../constants/appConstants';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches all AI-generated predictions.
 * @returns {Promise<Prediction[]>}
 */
export async function getPredictions() {
  await delay();
  return [...mockPredictions];
}

/**
 * Fetches the prediction for a specific asset.
 * @param {string} assetId
 * @returns {Promise<Prediction | null>}
 */
export async function getPredictionByAssetId(assetId) {
  await delay(200);
  return mockPredictions.find((p) => p.assetId === assetId) ?? null;
}

/**
 * Fetches only BUY signals, sorted by confidence descending.
 * @returns {Promise<Prediction[]>}
 */
export async function getBuySignals() {
  await delay();
  return mockPredictions
    .filter((p) => p.direction === SIGNAL_DIRECTIONS.BUY)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Fetches only SELL signals, sorted by confidence descending.
 * @returns {Promise<Prediction[]>}
 */
export async function getSellSignals() {
  await delay();
  return mockPredictions
    .filter((p) => p.direction === SIGNAL_DIRECTIONS.SELL)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Fetches signals above a minimum confidence threshold.
 * @param {number} minConfidence - 0–100
 * @returns {Promise<Prediction[]>}
 */
export async function getHighConfidenceSignals(minConfidence = 75) {
  await delay();
  return mockPredictions
    .filter((p) => p.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence);
}
