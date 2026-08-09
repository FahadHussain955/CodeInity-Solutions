import { logger } from '../utils/logger.js';
import { prisma } from '../lib/prisma.js';

/**
 * Placeholder job: queue connected store re-syncs.
 * Currently marks IDLE integrations as PENDING for manual/worker pickup.
 * Swap the body for a real provider sync when TikTok Shop credentials are live.
 */
export const runStoreSyncJob = async () => {
  logger.info('storeSyncJob: starting');

  const connected = await prisma.storeIntegration.findMany({
    where: { isConnected: true, syncStatus: { in: ['IDLE', 'SUCCESS', 'FAILED'] } },
    select: { id: true, userId: true, provider: true },
    take: 100,
  });

  let queued = 0;
  for (const row of connected) {
    await prisma.storeIntegration.update({
      where: { id: row.id },
      data: {
        syncStatus: 'PENDING',
        syncMessage: 'Queued by scheduled store sync job',
      },
    });
    queued += 1;
  }

  logger.info(`storeSyncJob: queued ${queued} integrations`);
  return { queued };
};

export default runStoreSyncJob;
