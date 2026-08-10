import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';


export const runCleanupJob = async () => {
  const now = new Date();
  const revokedCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [cacheResult, sessionResult] = await Promise.all([
    prisma.aiInsightCache.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    prisma.refreshSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { revokedAt: { not: null, lt: revokedCutoff } },
        ],
      },
    }),
  ]);

  logger.info(
    `cleanupJob: expiredCaches=${cacheResult.count} purgedSessions=${sessionResult.count}`
  );

  return {
    expiredCaches: cacheResult.count,
    purgedSessions: sessionResult.count,
  };
};

export default runCleanupJob;
