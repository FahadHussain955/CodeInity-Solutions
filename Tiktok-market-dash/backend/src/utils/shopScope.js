import { prisma } from '../lib/prisma.js';
import { ApiError } from './ApiError.js';

export const ALL_SHOPS = 'all';

/**
 * Normalize query/body shop id. Empty / "all" → null (no shop filter).
 */
export const normalizeShopIdParam = (value) => {
  if (value == null || value === '') return null;
  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === ALL_SHOPS) return null;
  return raw;
};

/**
 * Verify shop belongs to the authenticated user. Returns the integration row.
 * Throws 404 (not 403) to avoid leaking existence across tenants.
 */
export const assertOwnedShop = async (userId, shopId, { requireConnected = false } = {}) => {
  const id = normalizeShopIdParam(shopId);
  if (!id) throw ApiError.badRequest('shopId is required.');
  if (!userId) throw ApiError.unauthorized();

  const shop = await prisma.storeIntegration.findFirst({
    where: {
      id,
      userId,
      ...(requireConnected ? { isConnected: true } : {}),
    },
  });

  if (!shop) {
    throw ApiError.notFound('Store not found.');
  }
  return shop;
};

/**
 * Resolve optional list filter shopId with ownership check.
 * @returns {Promise<string|null>} concrete shop id or null for all shops
 */
export const resolveShopFilter = async (userId, shopId) => {
  const id = normalizeShopIdParam(shopId);
  if (!id) return null;
  await assertOwnedShop(userId, id);
  return id;
};

/**
 * Resolve shop for create/write operations.
 * Prefer explicit shopId; otherwise use the user's oldest connected shop.
 */
export const resolveWritableShopId = async (userId, shopId) => {
  const id = normalizeShopIdParam(shopId);
  if (id) {
    const shop = await assertOwnedShop(userId, id, { requireConnected: true });
    return shop.id;
  }

  const primary = await prisma.storeIntegration.findFirst({
    where: { userId, isConnected: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!primary) {
    throw ApiError.badRequest('Connect a shop before creating this record.');
  }
  return primary.id;
};

/** Prisma where fragment for direct storeIntegrationId columns. */
export const shopWhere = (shopId) =>
  shopId ? { storeIntegrationId: shopId } : {};

/** Prisma where fragment when shop is nested under product. */
export const productShopWhere = (shopId) =>
  shopId ? { product: { storeIntegrationId: shopId } } : {};

/** Campaign ownership + optional shop. */
export const campaignShopWhere = (userId, shopId) => ({
  userId,
  ...shopWhere(shopId),
});
