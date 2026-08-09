import cron from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { runInventoryCheckJob } from './inventoryCheckJob.js';
import { runCleanupJob } from './cleanupJob.js';
import { runAiRefreshJob } from './aiRefreshJob.js';
import { runStoreSyncJob } from './storeSyncJob.js';

let started = false;

/**
 * Register scheduled jobs. Add new jobs here following the same try/catch pattern.
 */
export const startCronJobs = () => {
  if (!env.jobsEnabled) {
    logger.info('Cron jobs disabled (JOBS_ENABLED=false)');
    return;
  }
  if (started) return;
  started = true;

  // Inventory low-stock alerts — every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await runInventoryCheckJob();
    } catch (err) {
      logger.error('inventoryCheckJob failed:', err.message);
    }
  });

  // Store sync queue — every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    try {
      await runStoreSyncJob();
    } catch (err) {
      logger.error('storeSyncJob failed:', err.message);
    }
  });

  // AI insight cache refresh — daily at 04:00
  cron.schedule('0 4 * * *', async () => {
    try {
      await runAiRefreshJob();
    } catch (err) {
      logger.error('aiRefreshJob failed:', err.message);
    }
  });

  // Cleanup expired cache / revoked sessions — daily at 03:15
  cron.schedule('15 3 * * *', async () => {
    try {
      await runCleanupJob();
    } catch (err) {
      logger.error('cleanupJob failed:', err.message);
    }
  });

  logger.info('Cron jobs started (inventoryCheck, storeSync, aiRefresh, cleanup)');
};

export default startCronJobs;
