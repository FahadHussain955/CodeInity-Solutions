import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLowStock,
  isOutOfStock,
  normalizeLowStockThreshold,
  evaluateLowStockTransition,
} from '../src/utils/lowStock.js';
import { TYPE_PREF_MAP } from '../src/utils/notifications.js';
import { prisma } from '../src/lib/prisma.js';

after(async () => {
  await prisma.$disconnect().catch(() => {});
});

test('normalizeLowStockThreshold defaults and clamps', () => {
  assert.equal(normalizeLowStockThreshold(undefined), 10);
  assert.equal(normalizeLowStockThreshold(0), 10);
  assert.equal(normalizeLowStockThreshold(-3), 10);
  assert.equal(normalizeLowStockThreshold(20), 20);
});

test('stock classification with threshold 10', () => {
  assert.equal(isOutOfStock(0), true);
  assert.equal(isLowStock(0, 10), false);
  assert.equal(isLowStock(1, 10), true);
  assert.equal(isLowStock(5, 10), true);
  assert.equal(isLowStock(10, 10), true);
  assert.equal(isLowStock(11, 10), false);
  assert.equal(isLowStock(25, 10), false);
});

test('INVENTORY notifications are not gated by lowStockAlerts preference', () => {
  assert.equal(TYPE_PREF_MAP.INVENTORY, null);
  assert.notEqual(TYPE_PREF_MAP.INVENTORY, 'lowStockAlerts');
});

test('low-stock notification is created even when lowStockAlerts is false', async () => {
  const settings = await prisma.userSettings.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  assert.ok(settings, 'expected at least one user_settings row');

  const inventory = await prisma.inventory.findFirst({
    where: { product: { userId: settings.userId } },
    include: { product: { select: { id: true, name: true, sku: true } } },
  });
  assert.ok(inventory, 'expected inventory owned by that user');

  const previousAlerts = settings.lowStockAlerts;
  const previousThreshold = settings.lowStockThreshold;

  await prisma.userSettings.update({
    where: { userId: settings.userId },
    data: { lowStockAlerts: false, lowStockThreshold: 10 },
  });

  // Clear any active unread low-stock notifs for this product so we can assert creation.
  const unread = await prisma.notification.findMany({
    where: { userId: settings.userId, type: 'INVENTORY', isRead: false },
    take: 100,
  });
  const activeIds = unread
    .filter((n) => {
      const meta = n.meta && typeof n.meta === 'object' ? n.meta : {};
      return meta.event === 'low_stock' && String(meta.productId) === String(inventory.productId);
    })
    .map((n) => n.id);
  if (activeIds.length) {
    await prisma.notification.updateMany({
      where: { id: { in: activeIds } },
      data: { isRead: true },
    });
  }

  const result = await evaluateLowStockTransition({
    userId: settings.userId,
    productId: inventory.productId,
    productName: inventory.product?.name || 'Test Product',
    sku: inventory.product?.sku,
    previousStock: 11,
    newStock: 8,
    threshold: 10,
  });

  assert.equal(
    result.action,
    'created',
    `expected created notification with lowStockAlerts=false, got ${result.action}`
  );
  assert.ok(result.notificationId, 'expected notification id');

  const created = await prisma.notification.findUnique({
    where: { id: result.notificationId },
  });
  assert.ok(created);
  assert.equal(created.userId, settings.userId);
  assert.equal(created.isRead, false);
  assert.equal(created.meta?.event, 'low_stock');
  assert.equal(String(created.meta?.productId), String(inventory.productId));

  // Restore prior settings (keep DB tidy for other tests/manual use).
  await prisma.userSettings.update({
    where: { userId: settings.userId },
    data: { lowStockAlerts: previousAlerts, lowStockThreshold: previousThreshold },
  });
});
