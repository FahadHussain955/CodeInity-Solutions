import { prisma } from '../lib/prisma.js';
import { logger } from './logger.js';

/** Preference keys that can suppress a notification type. INVENTORY is intentionally null —
 * low-stock alerts are controlled by the user's threshold, not a separate toggle. */
export const TYPE_PREF_MAP = {
  ORDER: 'orderNotifications',
  INVENTORY: null,
  AI: 'aiNotifications',
  CAMPAIGN: 'campaignNotifications',
  SYNC: 'emailNotifications',
  SYSTEM: null,
};

/**
 * Create an in-app notification, respecting UserSettings prefs when possible.
 */
export const createNotification = async ({
  userId,
  type = 'SYSTEM',
  title,
  message,
  link = null,
  meta = null,
  skipPrefCheck = false,
} = {}) => {
  if (!userId || !title || !message) {
    logger.warn('createNotification skipped — userId, title, and message are required');
    return null;
  }

  const normalizedType = String(type || 'SYSTEM').toUpperCase();

  if (!skipPrefCheck) {
    const prefKey = TYPE_PREF_MAP[normalizedType];
    if (prefKey) {
      try {
        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        if (settings && settings[prefKey] === false) {
          return null;
        }
      } catch (err) {
        logger.warn('Could not read notification prefs:', err.message);
      }
    }
  }

  try {
    return await prisma.notification.create({
      data: {
        userId,
        type: normalizedType,
        title: String(title),
        message: String(message),
        link: link || null,
        meta: meta ?? undefined,
      },
    });
  } catch (err) {
    logger.error('Failed to create notification:', err.message);
    return null;
  }
};

export default createNotification;
