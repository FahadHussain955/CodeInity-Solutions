// =============================================================================
// FORMAT CURRENCY UTILITIES
// Pure functions for formatting monetary values, percentages, and large numbers.
// No side effects — safe to use anywhere.
// =============================================================================

/**
 * Formats a number as a USD currency string.
 * @param {number} value - The numeric value to format.
 * @param {number} [decimals=2] - Decimal places (default 2).
 * @param {string} [currency='USD'] - ISO 4217 currency code.
 * @returns {string} e.g. "$1,234.56"
 */
export function formatCurrency(value, decimals = 2, currency = 'USD') {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a decimal (0.05) or whole number (5) as a percentage string.
 * @param {number} value - The value to format (pass 5 for 5%, not 0.05).
 * @param {number} [decimals=2] - Decimal places.
 * @param {boolean} [withSign=false] - Prepend + for positive values.
 * @returns {string} e.g. "+5.00%" or "-2.50%"
 */
export function formatPercent(value, decimals = 2, withSign = false) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Formats large numbers with K / M / B / T suffixes.
 * @param {number} value
 * @returns {string} e.g. "1.23B", "456.7M"
 */
export function formatLargeNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3)  return `${(value / 1e3).toFixed(2)}K`;
  return value.toString();
}

/**
 * Formats a price, automatically selecting decimal precision based on magnitude.
 * Crypto assets often need more decimals (e.g. $0.00042).
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return '—';
  if (price < 0.01) return formatCurrency(price, 6);
  if (price < 1)    return formatCurrency(price, 4);
  if (price < 100)  return formatCurrency(price, 3);
  return formatCurrency(price, 2);
}

/**
 * Returns a sign-aware class label for styling price changes.
 * @param {number} value
 * @returns {'positive' | 'negative' | 'neutral'}
 */
export function getPriceChangeClass(value) {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}
