import { prisma } from '../lib/prisma.js';
import { logger } from './logger.js';

/**
 * Persist an activity log row for the activity feed.
 */
export const logActivity = async ({
  userId = null,
  action,
  entity = null,
  entityId = null,
  message,
  icon = 'history',
  meta = null,
} = {}) => {
  if (!action || !message) {
    logger.warn('logActivity skipped — action and message are required');
    return null;
  }

  try {
    return await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action: String(action),
        entity: entity ? String(entity) : null,
        entityId: entityId ? String(entityId) : null,
        message: String(message),
        icon: icon || 'history',
        meta: meta ?? undefined,
      },
    });
  } catch (err) {
    logger.error('Failed to write activity log:', err.message);
    return null;
  }
};

export default logActivity;
