import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectIntegration,
  disconnectIntegration,
  fetchIntegrationStatus,
  resetIntegrations,
  syncIntegration,
} from '@/features/integrations/integrationsSlice';

const StoreConnectionContext = createContext(null);

export const StoreConnectionProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { stores, selected, status: loadStatus } = useSelector((s) => s.integrations);
  const isAuthenticated = useSelector((s) => Boolean(s.auth?.isAuthenticated && s.auth?.token));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(resetIntegrations());
      return;
    }
    dispatch(fetchIntegrationStatus());
  }, [dispatch, isAuthenticated]);

  const isConnected = stores.length > 0;
  const storeDetails = useMemo(() => {
    if (!selected) return null;
    return {
      id: selected.id,
      platform: selected.platform,
      name: selected.name || selected.storeName,
      url: selected.url || selected.storeUrl,
      connectedAt: selected.connectedAt || selected.createdAt,
      lastSync: selected.lastSync,
      lastSyncLabel: selected.lastSyncLabel,
      syncStatus: selected.syncStatus,
      syncProgress: selected.syncProgress,
    };
  }, [selected]);

  const openConnectModal = useCallback((platform = 'TikTok Shop') => {
    setActivePlatform(platform);
    setIsModalOpen(true);
  }, []);

  const closeConnectModal = useCallback(() => {
    setIsModalOpen(false);
    setActivePlatform(null);
  }, []);

  const connectStore = useCallback(
    async ({ platform, name, url, apiToken }) => {
      const result = await dispatch(
        connectIntegration({
          platform: platform || activePlatform || 'TikTok Shop',
          storeName: name,
          storeUrl: url,
          apiToken,
        })
      );
      if (connectIntegration.rejected.match(result)) {
        throw new Error(result.payload || 'Unable to connect store.');
      }
      await dispatch(fetchIntegrationStatus());
      return result.payload?.store || result.payload;
    },
    [dispatch, activePlatform]
  );

  const disconnectStore = useCallback(
    async (id) => {
      const targetId = id || selected?.id;
      if (!targetId) return;
      const result = await dispatch(disconnectIntegration(targetId));
      if (disconnectIntegration.rejected.match(result)) {
        throw new Error(result.payload || 'Unable to disconnect store.');
      }
      await dispatch(fetchIntegrationStatus());
    },
    [dispatch, selected?.id]
  );

  const syncStore = useCallback(
    async (id) => {
      const targetId = id || selected?.id;
      if (!targetId) throw new Error('No connected store to sync.');
      const result = await dispatch(syncIntegration(targetId));
      if (syncIntegration.rejected.match(result)) {
        throw new Error(result.payload || 'Unable to sync store.');
      }
      await dispatch(fetchIntegrationStatus());
      return result.payload;
    },
    [dispatch, selected?.id]
  );

  const getStoreForPlatform = useCallback(
    (platformName) => stores.find((s) => s.platform === platformName) || null,
    [stores]
  );

  const getStoresForPlatform = useCallback(
    (platformName) => stores.filter((s) => s.platform === platformName),
    [stores]
  );

  const value = useMemo(
    () => ({
      isConnected,
      storeDetails,
      stores,
      isModalOpen,
      activePlatform,
      loadStatus,
      openConnectModal,
      closeConnectModal,
      connectStore,
      disconnectStore,
      syncStore,
      getStoreForPlatform,
      getStoresForPlatform,
      refreshStores: () => dispatch(fetchIntegrationStatus()),
    }),
    [
      isConnected,
      storeDetails,
      stores,
      isModalOpen,
      activePlatform,
      loadStatus,
      openConnectModal,
      closeConnectModal,
      connectStore,
      disconnectStore,
      syncStore,
      getStoreForPlatform,
      getStoresForPlatform,
      dispatch,
    ]
  );

  return (
    <StoreConnectionContext.Provider value={value}>{children}</StoreConnectionContext.Provider>
  );
};

export const useStoreConnection = () => {
  const context = useContext(StoreConnectionContext);
  if (!context) {
    throw new Error('useStoreConnection must be used within a StoreConnectionProvider');
  }
  return context;
};
