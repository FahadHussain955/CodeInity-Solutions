import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';
import {
  evaluateLowStockTransition,
  getLowStockThreshold,
  isLowStock,
} from '../utils/lowStock.js';

/**
 * Tenant-scoped low-stock scan for all users with settings.
 * Dedupes via evaluateLowStockTransition (unread low_stock meta per product).
 * Not gated by the legacy lowStockAlerts boolean — threshold alone controls detection.
 */
export const runInventoryCheckJob = async () => {
  const settingsUsers = await prisma.userSettings.findMany({
    select: { userId: true, lowStockThreshold: true },
  });

  let notified = 0;
  let checked = 0;

  for (const { userId, lowStockThreshold } of settingsUsers) {
    const threshold = await getLowStockThreshold(userId).catch(() => lowStockThreshold || 10);
    const rows = await prisma.inventory.findMany({
      where: { product: { userId } },
      include: {
        product: { select: { id: true, name: true, sku: true, userId: true } },
      },
      take: 500,
    });

    checked += rows.length;

    for (const item of rows) {
      if (!isLowStock(item.currentStock, threshold)) continue;

      // Force "enter low stock" check; dedupe prevents spam if unread already exists.
      const result = await evaluateLowStockTransition({
        userId,
        productId: item.productId,
        productName: item.product?.name,
        sku: item.product?.sku,
        previousStock: threshold + 1,
        newStock: item.currentStock,
        threshold,
      });
      if (result.action === 'created') notified += 1;
    }
  }

  logger.info(`inventoryCheckJob: notified=${notified} checked=${checked} users=${settingsUsers.length}`);
  return { notified, checked, users: settingsUsers.length };
};

export default runInventoryCheckJob;
