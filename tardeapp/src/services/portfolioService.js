// =============================================================================
// PORTFOLIO SERVICE
// Abstracts all portfolio data fetching and mutations.
// Currently returns mock data. Replace with Supabase calls.
//
// FUTURE INTEGRATION:
//   import { supabase } from '../lib/supabaseClient';
//   const { data } = await supabase.from('holdings').select('*').eq('user_id', userId);
// =============================================================================

import { mockPortfolio } from '../data/portfolio';
import { mockTransactions } from '../data/transactions';
import { mockAssets } from '../data/assets';
import { calculatePortfolioSummary } from '../utils/calculateROI';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches all portfolio holdings, enriched with current asset price data.
 * @returns {Promise<EnrichedHolding[]>}
 */
export async function getPortfolio() {
  await delay();
  return mockPortfolio.map((holding) => {
    const asset = mockAssets.find((a) => a.id === holding.assetId);
    return {
      ...holding,
      symbol: asset?.symbol ?? '???',
      name: asset?.name ?? 'Unknown',
      type: asset?.type ?? 'stock',
      currentPrice: asset?.price ?? 0,
      currentValue: (asset?.price ?? 0) * holding.quantity,
      costBasis: holding.averageCost * holding.quantity,
    };
  });
}

/**
 * Fetches portfolio summary: total value, cost, P&L, ROI.
 * @returns {Promise<PortfolioSummary>}
 */
export async function getPortfolioSummary() {
  await delay(200);
  const holdings = await getPortfolio();
  const enriched = holdings.map((h) => ({
    quantity: h.quantity,
    currentPrice: h.currentPrice,
    averageCost: h.averageCost,
  }));
  return calculatePortfolioSummary(enriched);
}

/**
 * Fetches all transactions, sorted by date descending.
 * @returns {Promise<Transaction[]>}
 */
export async function getTransactions() {
  await delay();
  return [...mockTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

/**
 * Fetches transactions for a specific asset.
 * @param {string} assetId
 * @returns {Promise<Transaction[]>}
 */
export async function getTransactionsByAsset(assetId) {
  await delay(200);
  return mockTransactions
    .filter((t) => t.assetId === assetId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
