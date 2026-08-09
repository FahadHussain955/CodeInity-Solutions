import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getAdapter } from './providers/index.js';

/**
 * Orchestrates sync runs and persists SyncLog rows.
 * Provider-specific work is delegated to adapters.
 */
export const syncService = {
  async runManualSync(integrationId, userId) {
    const integration = await prisma.storeIntegration.findFirst({
      where: { id: integrationId, userId, isConnected: true },
    });
    if (!integration) {
      throw ApiError.notFound('Connected store not found.');
    }

    if (integration.syncStatus === 'SYNCING') {
      throw ApiError.conflict('A sync is already in progress for this store.');
    }

    const log = await prisma.syncLog.create({
      data: {
        integrationId,
        userId,
        status: 'SYNCING',
        progress: 0,
        message: 'Sync started',
      },
    });

    await prisma.storeIntegration.update({
      where: { id: integrationId },
      data: {
        syncStatus: 'SYNCING',
        syncProgress: 0,
        syncMessage: 'Sync started',
      },
    });

    const onProgress = async (progress, message) => {
      await prisma.storeIntegration.update({
        where: { id: integrationId },
        data: { syncProgress: progress, syncMessage: message, syncStatus: 'SYNCING' },
      });
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { progress, message },
      });
    };

    try {
      const adapter = getAdapter(integration.provider);
      const details = await adapter.sync(integration, onProgress);

      const finishedAt = new Date();
      const [updated, updatedLog] = await prisma.$transaction([
        prisma.storeIntegration.update({
          where: { id: integrationId },
          data: {
            syncStatus: 'SUCCESS',
            syncProgress: 100,
            syncMessage: 'Last sync completed successfully',
            lastSyncAt: finishedAt,
          },
        }),
        prisma.syncLog.update({
          where: { id: log.id },
          data: {
            status: 'SUCCESS',
            progress: 100,
            message: 'Sync completed',
            details,
            finishedAt,
          },
        }),
      ]);

      return { integration: updated, log: updatedLog };
    } catch (error) {
      const finishedAt = new Date();
      await prisma.storeIntegration.update({
        where: { id: integrationId },
        data: {
          syncStatus: 'FAILED',
          syncMessage: error.message || 'Sync failed',
        },
      });
      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          message: error.message || 'Sync failed',
          finishedAt,
        },
      });
      throw ApiError.internal(error.message || 'Store sync failed.');
    }
  },

  async getStatus(integrationId, userId) {
    const integration = await prisma.storeIntegration.findFirst({
      where: { id: integrationId, userId },
    });
    if (!integration) throw ApiError.notFound('Store integration not found.');

    return {
      id: integration.id,
      syncStatus: integration.syncStatus,
      syncProgress: integration.syncProgress,
      syncMessage: integration.syncMessage,
      lastSyncAt: integration.lastSyncAt,
    };
  },

  async getLogs(integrationId, userId, { limit = 20 } = {}) {
    const integration = await prisma.storeIntegration.findFirst({
      where: { id: integrationId, userId },
      select: { id: true },
    });
    if (!integration) throw ApiError.notFound('Store integration not found.');

    return prisma.syncLog.findMany({
      where: { integrationId, userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(50, Math.max(1, limit)),
    });
  },
};
