import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedShopId } from '@/features/integrations/integrationsSlice';
import { ALL_SHOPS, shopIdQueryParam } from '@/utils/shopQuery';

/**
 * Global shop context for list/create API calls.
 * selectedShopId is 'all' or a StoreIntegration id owned by the user.
 */
export const useShopScope = () => {
  const dispatch = useDispatch();
  const { stores, selectedShopId } = useSelector((s) => s.integrations);
  const userId = useSelector((s) => s.auth?.user?.id);

  const setShop = useCallback(
    (id) => {
      dispatch(setSelectedShopId({ shopId: id || ALL_SHOPS, userId }));
    },
    [dispatch, userId]
  );

  const shopQuery = useMemo(
    () => ({ shopId: shopIdQueryParam(selectedShopId) }),
    [selectedShopId]
  );

  const selectedShop = useMemo(() => {
    if (!selectedShopId || selectedShopId === ALL_SHOPS) return null;
    return stores.find((s) => s.id === selectedShopId) || null;
  }, [stores, selectedShopId]);

  return {
    stores,
    selectedShopId: selectedShopId || ALL_SHOPS,
    selectedShop,
    isAllShops: !selectedShopId || selectedShopId === ALL_SHOPS,
    setShop,
    shopQuery,
    shopIdForCreate: shopIdQueryParam(selectedShopId),
  };
};

export default useShopScope;
