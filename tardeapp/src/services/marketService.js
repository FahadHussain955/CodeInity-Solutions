// =============================================================================
// MARKET SERVICE
// Abstracts all market data fetching.
// Currently returns mock data. Replace function bodies with API/Supabase calls.
//
// FUTURE INTEGRATION:
//   import { supabase } from '../lib/supabaseClient';
//   import { MARKET_API_BASE } from '../constants/appConstants';
// =============================================================================

import { mockAssets } from '../data/assets';

/**
 * Simulates an async delay to mimic network latency.
 * Remove when using real API calls.
 * @param {number} ms
 */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches all available assets (stocks + crypto).
 * @returns {Promise<Asset[]>}
 */
export async function getAssets() {
  await delay();
  return [...mockAssets];
}

/**
 * Fetches a single asset by its ID.
 * @param {string} id - The asset ID (e.g. 'btc', 'aapl')
 * @returns {Promise<Asset | null>}
 */
export async function getAssetById(id) {
  await delay(200);
  const asset = mockAssets.find((a) => a.id === id) ?? null;
  return asset;
}

/**
 * Fetches assets filtered by type.
 * @param {'stock' | 'crypto' | 'etf'} type
 * @returns {Promise<Asset[]>}
 */
export async function getAssetsByType(type) {
  await delay();
  return mockAssets.filter((a) => a.type === type);
}

/**
 * Searches assets by symbol or name.
 * @param {string} query
 * @returns {Promise<Asset[]>}
 */
export async function searchAssets(query) {
  await delay(150);
  const q = query.toLowerCase();
  return mockAssets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  );
}

/**
 * Fetches top N gainers.
 * @param {number} limit
 * @returns {Promise<Asset[]>}
 */
export async function getTopGainers(limit = 5) {
  await delay();
  return [...mockAssets]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
}

/**
 * Fetches top N losers.
 * @param {number} limit
 * @returns {Promise<Asset[]>}
 */
export async function getTopLosers(limit = 5) {
  await delay();
  return [...mockAssets]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);
}
