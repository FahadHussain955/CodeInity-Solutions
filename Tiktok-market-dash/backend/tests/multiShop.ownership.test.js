import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertOwnedShop,
  normalizeShopIdParam,
  resolveShopFilter,
} from '../src/utils/shopScope.js';
import { ApiError } from '../src/utils/ApiError.js';
import { prisma } from '../src/lib/prisma.js';

/**
 * Multi-shop ownership contract:
 * - Missing / foreign shops must surface as 404 via ApiError.notFound
 * - assertOwnedShop is the shared gate used by resolveShopFilter
 */

test('ApiError.notFound is 404 for missing shop contract', () => {
  const err = ApiError.notFound('Store not found.');
  assert.equal(err.statusCode, 404);
  assert.equal(err.message, 'Store not found.');
});

test('shopScope exports assertOwnedShop + normalize helpers', () => {
  assert.equal(typeof assertOwnedShop, 'function');
  assert.equal(typeof resolveShopFilter, 'function');
  assert.equal(typeof normalizeShopIdParam, 'function');
  assert.equal(normalizeShopIdParam('all'), null);
});

test('resolveShopFilter rejects another user shop id (live DB when available)', async () => {
  let users;
  try {
    users = await prisma.user.findMany({
      take: 2,
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
  } catch {
    // DB unavailable — skip gracefully
    assert.ok(true);
    return;
  }

  if (!users?.length) {
    assert.ok(true, 'no users — skip live ownership matrix');
    return;
  }

  const owner = users[0];
  let shops = await prisma.storeIntegration.findMany({
    where: { userId: owner.id },
    take: 2,
    orderBy: { createdAt: 'asc' },
  });

  // Prefer existing shops; create a disposable one if the owner has none
  let createdShopId = null;
  if (!shops.length) {
    try {
      const created = await prisma.storeIntegration.create({
        data: {
          userId: owner.id,
          provider: 'TIKTOK_SHOP',
          storeName: 'test-shop-scope-temp',
          storeUrl: `https://test-shop-scope-${Date.now()}.example`,
          isConnected: true,
        },
      });
      shops = [created];
      createdShopId = created.id;
    } catch {
      assert.ok(true, 'could not create shop — skip');
      return;
    }
  }

  const shopId = shops[0].id;

  try {
    // Owner can resolve their shop
    const resolved = await resolveShopFilter(owner.id, shopId);
    assert.equal(resolved, shopId);

    // Another user (or fake id) must not resolve owner's shop
    const otherUserId = users[1]?.id || '00000000-0000-0000-0000-000000000000';
    if (otherUserId === owner.id) {
      assert.ok(true, 'single user — skip cross-tenant check');
      return;
    }

    await assert.rejects(
      () => resolveShopFilter(otherUserId, shopId),
      (err) => err instanceof ApiError && err.statusCode === 404
    );
  } finally {
    if (createdShopId) {
      await prisma.storeIntegration.delete({ where: { id: createdShopId } }).catch(() => {});
    }
  }
});
