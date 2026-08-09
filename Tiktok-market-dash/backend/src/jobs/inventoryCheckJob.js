import { prisma } from '../lib/prisma.js';
import { createNotification } from '../utils/notifications.js';
import { logger } from '../utils/logger.js';

/**
 * Find low-stock inventory items and notify users with lowStockAlerts enabled.
 */
export const runInventoryCheckJob = async () => {
  const rows = await prisma.inventory.findMany({
    include: { product: { select: { id: true, name: true, sku: true } } },
    take: 500,
  });

  const items = rows.filter((row) => row.currentStock <= row.reorderLevel);

  if (items.length === 0) {
    logger.info('inventoryCheckJob: no low-stock items');
    return { notified: 0, items: 0 };
  }

  const settingsUsers = await prisma.userSettings.findMany({
    where: { lowStockAlerts: true },
    select: { userId: true },
  });

  let notified = 0;
  for (const { userId } of settingsUsers) {
    for (const item of items.slice(0, 20)) {
      const created = await createNotification({
        userId,
        type: 'INVENTORY',
        title: 'Low stock alert',
        message: `${item.product?.name || 'Product'} (${item.product?.sku || 'SKU'}) is at ${item.currentStock} units (reorder at ${item.reorderLevel}).`,
        link: '/inventory',
        meta: {
          productId: item.productId,
          currentStock: item.currentStock,
          reorderLevel: item.reorderLevel,
        },
      });
      if (created) notified += 1;
    }
  }

  logger.info(`inventoryCheckJob: notified=${notified} lowStockItems=${items.length}`);
  return { notified, items: items.length };
};

export default runInventoryCheckJob;
