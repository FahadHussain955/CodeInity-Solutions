import { useShopScope } from '@/hooks/useShopScope';
import { ALL_SHOPS } from '@/utils/shopQuery';

/**
 * Compact shop switcher for the dashboard chrome.
 * Options: All Shops + each connected StoreIntegration.
 * When no shops are connected, renders nothing in the navbar
 * (Connect CTAs live on empty states / Settings / sidebar).
 */
const ShopSwitcher = ({ className = '' }) => {
  const { stores, selectedShopId, setShop } = useShopScope();

  if (!stores.length) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <label htmlFor="nexora-shop-switcher" className="sr-only">
        Select shop
      </label>
      <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0" aria-hidden="true">
        storefront
      </span>
      <select
        id="nexora-shop-switcher"
        value={selectedShopId || ALL_SHOPS}
        onChange={(e) => setShop(e.target.value)}
        className="h-8 max-w-[140px] lg:max-w-[180px] truncate px-2 pr-7 rounded-lg border border-outline-variant/40 bg-surface text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 appearance-auto"
        title="Filter dashboard data by connected shop"
      >
        <option value={ALL_SHOPS}>All Shops</option>
        {stores.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name || shop.storeName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ShopSwitcher;
