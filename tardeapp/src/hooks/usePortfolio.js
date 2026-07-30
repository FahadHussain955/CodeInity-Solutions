// =============================================================================
// usePortfolio — custom hook for portfolio data
// Wraps PortfolioContext and exposes a clean, component-friendly API.
// =============================================================================

import { usePortfolioContext } from '../context/PortfolioContext';

/**
 * usePortfolio — access holdings, summary, and transactions.
 *
 * @example
 * const { holdings, summary, isLoading } = usePortfolio();
 *
 * @returns {PortfolioContextValue}
 */
export function usePortfolio() {
  return usePortfolioContext();
}

export default usePortfolio;
