import { useEffect, useMemo, useState } from 'react';
import defaultProduct from '@/assets/default-product.svg';
import { resolveMediaUrl } from '@/utils/mediaUrl';

const SIZE_CLASS = {
  xs: 'w-8 h-8',
  sm: 'w-9 h-9',
  md: 'w-14 h-14',
  review: 'w-28 h-28',
  lg: 'w-full aspect-square max-w-md',
};

/**
 * Consistent product image rendering:
 * - Fixed square container (variant sizes)
 * - object-contain so source aspect ratio is preserved (no stretch/crop distortion)
 * - Professional local placeholder for missing/broken URLs
 * - Soft surface background so letterboxing looks intentional
 */
const ProductImage = ({
  src,
  alt,
  name,
  size = 'sm',
  className = '',
  imgClassName = '',
  rounded = 'rounded-lg',
  lazy = true,
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const photoUrl = useMemo(() => resolveMediaUrl(src), [src]);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [photoUrl]);

  const showRemote = Boolean(photoUrl) && !failed;
  const label = alt || name || 'Product image';
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.sm;
  const displaySrc = showRemote ? photoUrl : defaultProduct;

  return (
    <div
      className={`relative overflow-hidden bg-surface-container border border-outline-variant/20 flex items-center justify-center shrink-0 ${rounded} ${sizeClass} ${className}`}
    >
      {showRemote && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-surface-container-high/70" aria-hidden="true" />
      )}

      <img
        src={displaySrc}
        alt={label}
        loading={lazy && showRemote ? 'lazy' : undefined}
        decoding="async"
        className={`relative z-[1] max-w-full max-h-full w-full h-full object-contain object-center ${
          showRemote ? '' : 'p-1.5 opacity-90'
        } ${imgClassName}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // Only fall back once — avoids infinite error loops on the placeholder.
          if (showRemote) {
            setFailed(true);
            setLoaded(true);
          }
        }}
      />
    </div>
  );
};

export default ProductImage;
