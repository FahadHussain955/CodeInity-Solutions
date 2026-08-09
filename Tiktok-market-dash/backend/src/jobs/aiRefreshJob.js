import { logger } from '../utils/logger.js';
import { prisma } from '../lib/prisma.js';

/**
 * Placeholder job: refresh AI insight caches for active users.
 * Designed for easy extension (batching, Gemini rate limits, per-tenant queues).
 */
export const runAiRefreshJob = async () => {
  logger.info('aiRefreshJob: starting');

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true },
    take: 50,
  });

  // Soft-expire stale caches so next /ai/insights call regenerates.
  const expired = await prisma.aiInsightCache.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        {
          userId: { in: users.map((u) => u.id) },
          updatedAt: { lt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        },
      ],
    },
  });

  logger.info(`aiRefreshJob: cleared ${expired.count} stale insight cache rows`);
  return { cleared: expired.count };
};

export default runAiRefreshJob;
