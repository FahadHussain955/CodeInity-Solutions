/** Sentinel for "no shop filter" — combined data across the user's shops. */
export const ALL_SHOPS = 'all';

export const shopStorageKey = (userId) =>
  userId ? `nexora:selectedShopId:${userId}` : 'nexora:selectedShopId';

export const readPersistedShopId = (userId) => {
  try {
    const raw = localStorage.getItem(shopStorageKey(userId));
    return raw || ALL_SHOPS;
  } catch {
    return ALL_SHOPS;
  }
};

export const persistShopId = (userId, shopId) => {
  try {
    localStorage.setItem(shopStorageKey(userId), shopId || ALL_SHOPS);
  } catch {
    /* ignore quota / private mode */
  }
};

/** API query value: omit when All Shops. */
export const shopIdQueryParam = (selectedShopId) => {
  if (!selectedShopId || selectedShopId === ALL_SHOPS) return undefined;
  return selectedShopId;
};
