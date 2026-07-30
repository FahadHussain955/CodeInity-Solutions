// =============================================================================
// LOADER — Loading spinner / skeleton placeholder
// =============================================================================

/**
 * Spinner loader.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.label='Loading...'] - Screen reader text
 */
export function Loader({ size = 'md', label = 'Loading...' }) {
  return (
    <div
      className={`loader loader--${size}`}
      role="status"
      aria-label={label}
      data-testid="loader"
    >
      <div className="loader-spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Full-page centered loader.
 */
export function PageLoader({ label = 'Loading page...' }) {
  return (
    <div className="page-loader" data-testid="page-loader">
      <Loader size="lg" label={label} />
    </div>
  );
}

/**
 * Inline content loader — skeleton shimmer block.
 * @param {Object} props
 * @param {string} [props.width='100%']
 * @param {string} [props.height='1rem']
 * @param {string} [props.borderRadius='4px']
 */
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px' }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
      aria-hidden="true"
      data-testid="skeleton"
    />
  );
}

export default Loader;
