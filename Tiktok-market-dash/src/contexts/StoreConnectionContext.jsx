import { createContext, useContext, useState } from 'react';

const StoreConnectionContext = createContext(null);

export const StoreConnectionProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null); // 'Shopify' | 'TikTok Shop' | 'WooCommerce'

  const openConnectModal = (platform = 'Shopify') => {
    setActivePlatform(platform);
    setIsModalOpen(true);
  };

  const closeConnectModal = () => {
    setIsModalOpen(false);
    setActivePlatform(null);
  };

  const connectStore = (details) => {
    setIsConnected(true);
    setStoreDetails(details);
  };

  const disconnectStore = () => {
    setIsConnected(false);
    setStoreDetails(null);
  };

  return (
    <StoreConnectionContext.Provider
      value={{
        isConnected,
        storeDetails,
        isModalOpen,
        activePlatform,
        openConnectModal,
        closeConnectModal,
        connectStore,
        disconnectStore,
      }}
    >
      {children}
    </StoreConnectionContext.Provider>
  );
};

export const useStoreConnection = () => {
  const context = useContext(StoreConnectionContext);
  if (!context) {
    throw new Error('useStoreConnection must be used within a StoreConnectionProvider');
  }
  return context;
};
