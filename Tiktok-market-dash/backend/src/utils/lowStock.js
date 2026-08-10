import { prisma } from '../lib/prisma.js';
import { createNotification } from './notifications.js';
import { logger } from './logger.js';

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
export const ALLOWED_LOW_STOCK_THRESHOLDS = [5, 10, 20, 50];

export const normalizeLowStockThreshold = (value) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LOW_STOCK_THRESHOLD;
  if (n > 10000) return 10000;
  return n;
};

export const isOutOfStock = (currentStock) => Number(currentStock) <= 0;

/** Low stock = above zero and at/below the user's threshold. */
export const isLowStock = (currentStock, threshold) => {
  const stock = Number(currentStock);
  const limit = normalizeLowStockThreshold(threshold);
  return stock > 0 && stock <= limit;
};

export const getLowStockThreshold = async (userId) => {
  if (!userId) return DEFAULT_LOW_STOCK_THRESHOLD;
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { lowStockThreshold: true },
  });
  return normalizeLowStockThreshold(settings?.lowStockThreshold);
};

export const ensureUserSettings = async (userId) => {
  if (!userId) return null;
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
};

const findActiveLowStockNotification = async (userId, productId) => {
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      type: 'INVENTORY',
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    rows.find((n) => {
      const meta = n.meta && typeof n.meta === 'object' ? n.meta : {};
      return meta.event === 'low_stock' && String(meta.productId) === String(productId);
    }) || null
  );
};

export const resolveLowStockNotifications = async (userId, productId) => {
  if (!userId || !productId) return 0;
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      type: 'INVENTORY',
      isRead: false,
    },
    take: 100,
  });

  const ids = rows
    .filter((n) => {
      const meta = n.meta && typeof n.meta === 'object' ? n.meta : {};
      return meta.event === 'low_stock' && String(meta.productId) === String(productId);
    })
    .map((n) => n.id);

  if (!ids.length) return 0;

  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId },
    data: { isRead: true },
  });
  return ids.length;
};

/**
 * Evaluate stock transition and create/resolve low-stock notifications.
 * - Entering low stock → create one notification (deduped while unread exists)
 * - Leaving low stock → mark related unread notifications as read
 */
export const evaluateLowStockTransition = async ({
  userId,
  productId,
  productName,
  sku,
  previousStock,
  newStock,
  threshold: thresholdOverride,
} = {}) => {
  if (!userId || !productId) return { action: 'skipped' };

  await ensureUserSettings(userId);
  const threshold =
    thresholdOverride != null
      ? normalizeLowStockThreshold(thresholdOverride)
      : await getLowStockThreshold(userId);

  const wasLow = isLowStock(previousStock, threshold);
  const nowLow = isLowStock(newStock, threshold);

  if (nowLow && !wasLow) {
    const existing = await findActiveLowStockNotification(userId, productId);
    if (existing) {
      return { action: 'deduped', notificationId: existing.id };
    }

    const name = productName || 'Product';
    const created = await createNotification({
      userId,
      type: 'INVENTORY',
      title: 'Low stock alert',
      message: `Low stock: ${name} has only ${Number(newStock)} unit${Number(newStock) === 1 ? '' : 's'} remaining.`,
      link: `/dashboard/inventory?status=low_stock`,
      // Low-stock alerts are driven by threshold, not the legacy lowStockAlerts preference.
      skipPrefCheck: true,
      meta: {
        event: 'low_stock',
        productId,
        sku: sku || null,
        productName: name,
        currentStock: Number(newStock),
        threshold,
      },
    });

    return { action: created ? 'created' : 'create_failed', notificationId: created?.id || null };
  }

  if (!nowLow && wasLow) {
    const resolved = await resolveLowStockNotifications(userId, productId);
    return { action: 'resolved', resolved };
  }

  return { action: 'none' };
};

/**
 * After threshold change: notify products newly in low-stock range; resolve recovered ones.
 */
export const recalculateLowStockForUser = async (userId, threshold) => {
  if (!userId) return { checked: 0, created: 0, resolved: 0 };
  const limit = normalizeLowStockThreshold(threshold);
  const rows = await prisma.inventory.findMany({
    where: { product: { userId } },
    include: {
      product: { select: { id: true, name: true, sku: true, userId: true } },
    },
  });

  let created = 0;
  let resolved = 0;

  for (const row of rows) {
    const stock = row.currentStock;
    const nowLow = isLowStock(stock, limit);
    if (nowLow) {
      // Treat as entering low stock from "unknown" previous above-threshold state
      // only if no active unread exists (dedupe). Use previousStock = limit + 1 to force enter.
      const result = await evaluateLowStockTransition({
        userId,
        productId: row.productId,
        productName: row.product?.name,
        sku: row.product?.sku,
        previousStock: limit + 1,
        newStock: stock,
        threshold: limit,
      });
      if (result.action === 'created') created += 1;
    } else {
      const count = await resolveLowStockNotifications(userId, row.productId);
      resolved += count;
    }
  }

  logger.info(
    `recalculateLowStockForUser user=${userId} threshold=${limit} checked=${rows.length} created=${created} resolved=${resolved}`
  );
  return { checked: rows.length, created, resolved, threshold: limit };
};
