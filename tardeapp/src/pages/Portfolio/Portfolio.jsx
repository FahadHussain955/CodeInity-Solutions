// =============================================================================
// PORTFOLIO PAGE
// Holdings list, portfolio summary stats, and transaction history.
// =============================================================================

import usePortfolio from '../../hooks/usePortfolio';
import { PageLoader } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import PortfolioCard from '../../components/cards/PortfolioCard';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';
import { calculatePortfolioValue, calculateAllocationWeight } from '../../utils/calculateROI';

/**
 * Portfolio — holdings overview, summary, and transaction log.
 */
export default function Portfolio() {
  const { holdings, summary, transactions, isLoading, error, refreshPortfolio } = usePortfolio();

  if (isLoading) return <PageLoader label="Loading portfolio..." />;
  if (error) return <ErrorMessage message={error} onRetry={refreshPortfolio} variant="page" />;

  const totalValue = summary?.totalValue ?? 0;

  return (
    <div className="page portfolio-page" data-testid="portfolio-page">
      {/* ── Summary Stats ── */}
      {summary && (
        <div className="portfolio-summary" data-testid="portfolio-summary">
          <div className="stat-card">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">{formatCurrency(summary.totalValue)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cost Basis</span>
            <span className="stat-value">{formatCurrency(summary.totalCost)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total P&amp;L</span>
            <span className="stat-value">{formatCurrency(summary.totalPnL)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Return</span>
            <span className="stat-value">{formatPercent(summary.totalROI, 2, true)}</span>
          </div>
        </div>
      )}

      {/* ── Holdings ── */}
      <h2 className="page-section-title">Holdings ({holdings.length})</h2>
      <div className="portfolio-holdings" data-testid="portfolio-holdings">
        {holdings.map((holding) => {
          const currentValue = holding.currentPrice * holding.quantity;
          const allocationPct = calculateAllocationWeight(currentValue, totalValue);
          return (
            <PortfolioCard
              key={holding.id}
              holding={holding}
              allocationPercent={allocationPct}
            />
          );
        })}
      </div>

      {/* ── Recent Transactions ── */}
      <h2 className="page-section-title">Recent Transactions</h2>
      <div className="portfolio-transactions" data-testid="portfolio-transactions">
        {transactions.slice(0, 10).map((txn) => (
          <div key={txn.id} className="transaction-row" data-testid={`txn-${txn.id}`}>
            <span className={`transaction-type transaction-type--${txn.type}`}>
              {txn.type.toUpperCase()}
            </span>
            <span className="transaction-asset">{txn.symbol}</span>
            <span className="transaction-qty">{txn.quantity} units</span>
            <span className="transaction-price">@ {formatCurrency(txn.price)}</span>
            <span className="transaction-total">{formatCurrency(txn.amount)}</span>
            <span className="transaction-date">
              {new Date(txn.date).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
