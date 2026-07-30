// =============================================================================
// BUTTON — Reusable button component
// Supports: variant, size, loading state, icon, disabled.
// =============================================================================

import { Loader2 } from 'lucide-react';

/**
 * Button component.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 * @param {React.ButtonHTMLAttributes} props - All native button props are forwarded
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    isLoading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      data-testid={rest['data-testid'] ?? 'button'}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={16} className="btn-spinner" aria-hidden="true" />
      ) : (
        leftIcon && <span className="btn-icon-left" aria-hidden="true">{leftIcon}</span>
      )}
      <span className="btn-label">{children}</span>
      {!isLoading && rightIcon && (
        <span className="btn-icon-right" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}
