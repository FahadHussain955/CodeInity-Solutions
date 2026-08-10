import { useStoreConnection } from '@/contexts/StoreConnectionContext';
import NoShopEmptyState from '@/components/ui/NoShopEmptyState';

/**
 * Renders children only when at least one shop is connected.
 * Distinguishes loading → no-shop empty state → connected content.
 */
const NoShopGate = ({ children, description, title }) => {
  const { isConnected, loadStatus } = useStoreConnection();

  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return (
      <div className="glass-panel rounded-xl py-14 text-center text-body-sm text-on-surface-variant">
        Checking shop connection…
      </div>
    );
  }

  // Failed status with zero stores still shows the connect empty state.
  if (!isConnected) {
    return <NoShopEmptyState title={title} description={description} />;
  }

  return <div className="space-y-6">{children}</div>;
};

export default NoShopGate;
