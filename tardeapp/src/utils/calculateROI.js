// =============================================================================
// ROI & P&L CALCULATION UTILITIES
// Pure financial math functions.
// =============================================================================

/**
 * Calculates Return on Investment as a percentage.
 * @param {number} currentValue - Current market value.
 * @param {number} costBasis - Original purchase cost.
 * @returns {number} ROI percentage (e.g. 12.5 means +12.5%)
 */
export function calculateROI(currentValue, costBasis) {
  if (!costBasis || costBasis === 0) return 0;
  return ((currentValue - costBasis) / costBasis) * 100;
}

/**
 * Calculates absolute Profit & Loss.
 * @param {number} currentValue
 * @param {number} costBasis
 * @returns {number} P&L in currency units (can be negative)
 */
export function calculatePnL(currentValue, costBasis) {
  return currentValue - costBasis;
}

/**
 * Calculates the current total value of a holding.
 * @param {number} quantity - Number of units held.
 * @param {number} currentPrice - Current price per unit.
 * @returns {number}
 */
export function calculateHoldingValue(quantity, currentPrice) {
  return quantity * currentPrice;
}

/**
 * Calculates the cost basis of a holding.
 * @param {number} quantity
 * @param {number} averageCost - Average cost per unit.
 * @returns {number}
 */
export function calculateCostBasis(quantity, averageCost) {
  return quantity * averageCost;
}

/**
 * Calculates the total value of an entire portfolio.
 * @param {Array<{quantity: number, currentPrice: number}>} holdings
 * @returns {number} Total portfolio market value
 */
export function calculatePortfolioValue(holdings) {
  return holdings.reduce((total, holding) => {
    return total + calculateHoldingValue(holding.quantity, holding.currentPrice);
  }, 0);
}

/**
 * Calculates the total cost basis of an entire portfolio.
 * @param {Array<{quantity: number, averageCost: number}>} holdings
 * @returns {number}
 */
export function calculateTotalCostBasis(holdings) {
  return holdings.reduce((total, holding) => {
    return total + calculateCostBasis(holding.quantity, holding.averageCost);
  }, 0);
}

/**
 * Calculates portfolio-level P&L and ROI.
 * @param {Array<{quantity: number, currentPrice: number, averageCost: number}>} holdings
 * @returns {{ totalValue: number, totalCost: number, totalPnL: number, totalROI: number }}
 */
export function calculatePortfolioSummary(holdings) {
  const totalValue = calculatePortfolioValue(holdings);
  const totalCost = calculateTotalCostBasis(holdings);
  const totalPnL = calculatePnL(totalValue, totalCost);
  const totalROI = calculateROI(totalValue, totalCost);
  return { totalValue, totalCost, totalPnL, totalROI };
}

/**
 * Calculates the weight of a single holding within the portfolio (%).
 * @param {number} holdingValue
 * @param {number} totalPortfolioValue
 * @returns {number}
 */
export function calculateAllocationWeight(holdingValue, totalPortfolioValue) {
  if (!totalPortfolioValue || totalPortfolioValue === 0) return 0;
  return (holdingValue / totalPortfolioValue) * 100;
}
