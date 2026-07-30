// =============================================================================
// PORTFOLIO CONTEXT
// Manages portfolio holdings, summary calculations, and transaction history.
// =============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  getPortfolio,
  getPortfolioSummary,
  getTransactions,
} from '../services/portfolioService';

// ─── Context Creation ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} PortfolioContextValue
 * @property {EnrichedHolding[]} holdings
 * @property {PortfolioSummary | null} summary
 * @property {Transaction[]} transactions
 * @property {boolean} isLoading
 * @property {string | null} error
 * @property {() => void} refreshPortfolio
 */

/** @type {React.Context<PortfolioContextValue>} */
export const PortfolioContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * PortfolioProvider — provides portfolio data to the component tree.
 * @param {{ children: React.ReactNode }} props
 */
export function PortfolioProvider({ children }) {
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [holdingsData, summaryData, txData] = await Promise.all([
        getPortfolio(),
        getPortfolioSummary(),
        getTransactions(),
      ]);
      setHoldings(holdingsData);
      setSummary(summaryData);
      setTransactions(txData);
    } catch (err) {
      setError(err.message ?? 'Failed to load portfolio data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    // FUTURE: Refresh portfolio on real-time trade events
  }, [fetchPortfolio]);

  const value = {
    holdings,
    summary,
    transactions,
    isLoading,
    error,
    refreshPortfolio: fetchPortfolio,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * usePortfolioContext — consume PortfolioContext.
 * Prefer the usePortfolio() hook in src/hooks/usePortfolio.js for components.
 * @returns {PortfolioContextValue}
 */
export function usePortfolioContext() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  return ctx;
}
