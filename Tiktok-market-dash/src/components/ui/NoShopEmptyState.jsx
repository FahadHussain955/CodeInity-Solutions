import { useStoreConnection } from '@/contexts/StoreConnectionContext';

/**
 * Professional empty state when the authenticated user has zero connected shops.
 * Distinct from "shop connected but no records" empty lists.
 */
const NoShopEmptyState = ({
  title = 'No TikTok Shop Connected',
  description = 'Connect your TikTok Shop to start managing your products, orders, inventory, analytics and other marketplace data from Nexora.',
  className = '',
}) => {
  const { openConnectModal } = useStoreConnection();

  return (
    <div
      className={`glass-panel rounded-xl px-6 py-14 sm:py-16 flex flex-col items-center text-center max-w-xl mx-auto ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-5">
        <span
          className="material-symbols-outlined text-[28px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          storefront
        </span>
      </div>
      <h3 className="text-headline-md text-on-background">{title}</h3>
      <p className="text-body-md text-on-surface-variant mt-2 max-w-md">{description}</p>
      <p className="text-body-sm text-on-surface-variant mt-3 max-w-sm">
        Connect your TikTok Shop to get started.
      </p>
      <button
        type="button"
        onClick={() => openConnectModal('TikTok Shop')}
        className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          link
        </span>
        Connect TikTok Shop
      </button>
    </div>
  );
};

export default NoShopEmptyState;
