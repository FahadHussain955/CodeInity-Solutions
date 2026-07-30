// =============================================================================
// CHART CONTAINER — Wrapper for all Recharts chart components
// Provides a consistent shell: title, subtitle, loading/error states, 
// and a ResponsiveContainer to make charts fill their parent.
//
// FUTURE: Add chart type switcher (line / area / candlestick / bar)
// =============================================================================

import { ResponsiveContainer } from 'recharts';
import { Loader } from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

/**
 * ChartContainer — wraps any Recharts chart in a responsive, labeled shell.
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {boolean} [props.isLoading=false]
 * @param {string | null} [props.error]
 * @param {() => void} [props.onRetry]
 * @param {number} [props.height=300]
 * @param {React.ReactNode} props.children - A single Recharts chart component
 */
export default function ChartContainer({
  title,
  subtitle,
  isLoading = false,
  error = null,
  onRetry,
  height = 300,
  children,
}) {
  return (
    <div className="chart-container" data-testid="chart-container">
      {/* ── Header ── */}
      {(title || subtitle) && (
        <div className="chart-container-header">
          {title && <h3 className="chart-container-title">{title}</h3>}
          {subtitle && <p className="chart-container-subtitle">{subtitle}</p>}
        </div>
      )}

      {/* ── Content area ── */}
      <div className="chart-container-body" style={{ height }}>
        {isLoading ? (
          <div className="chart-container-loader">
            <Loader size="md" label="Loading chart data..." />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={onRetry} variant="card" />
        ) : (
          /*
            ResponsiveContainer makes the inner chart fill this div.
            Pass any valid Recharts chart as children:
              <LineChart data={data}>...</LineChart>
              <AreaChart data={data}>...</AreaChart>
              <BarChart data={data}>...</BarChart>
          */
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
