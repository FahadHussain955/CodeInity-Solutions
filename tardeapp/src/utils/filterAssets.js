// =============================================================================
// ASSET FILTER & SORT UTILITIES
// Pure functions for searching, filtering, and sorting asset arrays.
// =============================================================================

import { ASSET_TYPES, SORT_OPTIONS } from '../constants/appConstants';

/**
 * Filters an array of assets by type.
 * @param {Array} assets
 * @param {string} type - One of ASSET_TYPES values, or 'all'
 * @returns {Array}
 */
export function filterByType(assets, type) {
  if (!type || type === 'all') return assets;
  return assets.filter((asset) => asset.type === type);
}

/**
 * Filters assets by a search query (matches symbol or name, case-insensitive).
 * @param {Array} assets
 * @param {string} query
 * @returns {Array}
 */
export function filterBySearch(assets, query) {
  if (!query || query.trim() === '') return assets;
  const q = query.trim().toLowerCase();
  return assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q)
  );
}

/**
 * Filters assets to only those in the watchlist.
 * @param {Array} assets
 * @param {string[]} watchlistIds - Array of asset IDs on the watchlist
 * @returns {Array}
 */
export function filterByWatchlist(assets, watchlistIds) {
  const idSet = new Set(watchlistIds);
  return assets.filter((asset) => idSet.has(asset.id));
}

/**
 * Sorts an array of assets by a given sort key.
 * Returns a new sorted array without mutating the original.
 * @param {Array} assets
 * @param {string} sortKey - One of SORT_OPTIONS values
 * @returns {Array}
 */
export function sortAssets(assets, sortKey) {
  if (!sortKey) return assets;
  const sorted = [...assets];

  switch (sortKey) {
    case SORT_OPTIONS.PRICE_ASC:
      return sorted.sort((a, b) => a.price - b.price);
    case SORT_OPTIONS.PRICE_DESC:
      return sorted.sort((a, b) => b.price - a.price);
    case SORT_OPTIONS.CHANGE_ASC:
      return sorted.sort((a, b) => a.changePercent - b.changePercent);
    case SORT_OPTIONS.CHANGE_DESC:
      return sorted.sort((a, b) => b.changePercent - a.changePercent);
    case SORT_OPTIONS.NAME_ASC:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case SORT_OPTIONS.NAME_DESC:
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case SORT_OPTIONS.MARKET_CAP_DESC:
      return sorted.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
    default:
      return sorted;
  }
}

/**
 * Applies all filters and sorting in one pass.
 * @param {Array} assets
 * @param {{ type: string, search: string, sortKey: string }} filters
 * @returns {Array}
 */
export function applyFilters(assets, { type, search, sortKey }) {
  let result = assets;
  result = filterByType(result, type);
  result = filterBySearch(result, search);
  result = sortAssets(result, sortKey);
  return result;
}
