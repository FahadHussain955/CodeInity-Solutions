// =============================================================================
// ERROR MESSAGE — Displays error states with retry support
// =============================================================================

import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorMessage component.
 * @param {Object} props
 * @param {string} props.message - The error message to display
 * @param {() => void} [props.onRetry] - Optional retry callback
 * @param {'inline'|'page'|'card'} [props.variant='inline']
 */
export default function ErrorMessage({ message, onRetry, variant = 'inline' }) {
  return (
    <div
      className={`error-message error-message--${variant}`}
      role="alert"
      aria-live="assertive"
      data-testid="error-message"
    >
      <AlertCircle size={variant === 'page' ? 48 : 20} className="error-icon" aria-hidden="true" />

      <div className="error-body">
        <p className="error-text">{message}</p>

        {onRetry && (
          <button
            className="error-retry-btn"
            onClick={onRetry}
            aria-label="Retry"
            data-testid="error-retry-btn"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Try again</span>
          </button>
        )}
      </div>
    </div>
  );
}
