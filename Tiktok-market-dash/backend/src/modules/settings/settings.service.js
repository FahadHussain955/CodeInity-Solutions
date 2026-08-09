import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { logActivity } from '../../utils/activity.js';

const STORE_FIELDS = [
  'storeName',
  'storeUrl',
  'businessName',
  'contactEmail',
  'contactPhone',
  'addressLine1',
  'addressLine2',
  'city',
  'country',
  'timezone',
  'currency',
  'description',
];

/** Map frontend-friendly pref keys → Prisma UserSettings columns */
const PREF_MAP = {
  orders: 'orderNotifications',
  orderNotifications: 'orderNotifications',
  inventory: 'lowStockAlerts',
  lowStockAlerts: 'lowStockAlerts',
  customers: 'customerNotifications',
  customerNotifications: 'customerNotifications',
  marketing: 'marketingEmails',
  marketingEmails: 'marketingEmails',
  campaign: 'campaignNotifications',
  campaignNotifications: 'campaignNotifications',
  ai: 'aiNotifications',
  aiNotifications: 'aiNotifications',
  email: 'emailNotifications',
  emailNotifications: 'emailNotifications',
};

const mapSettings = (s) => ({
  id: s.id,
  userId: s.userId,
  store: {
    storeName: s.storeName,
    storeUrl: s.storeUrl,
    businessName: s.businessName,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    addressLine1: s.addressLine1,
    addressLine2: s.addressLine2,
    city: s.city,
    country: s.country,
    timezone: s.timezone,
    currency: s.currency,
    description: s.description,
  },
  notifications: {
    email: s.emailNotifications,
    orders: s.orderNotifications,
    inventory: s.lowStockAlerts,
    customers: s.customerNotifications,
    marketing: s.marketingEmails,
    campaign: s.campaignNotifications,
    ai: s.aiNotifications,
  },
  billing: {
    planName: s.planName,
    planStatus: s.planStatus,
    planRenewsAt: s.planRenewsAt,
    usage: {
      seats: s.usageSeats,
      orders: s.usageOrders,
      storageMb: s.usageStorageMb,
    },
  },
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

export const settingsService = {
  async getOrCreate(userId) {
    let settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId } });
    }
    return mapSettings(settings);
  },

  async updateStore(userId, payload = {}) {
    await this.getOrCreate(userId);
    const data = {};
    for (const key of STORE_FIELDS) {
      if (payload[key] !== undefined) {
        data[key] = payload[key] === '' ? null : payload[key];
      }
    }
    // Allow nested store object
    if (payload.store && typeof payload.store === 'object') {
      for (const key of STORE_FIELDS) {
        if (payload.store[key] !== undefined) {
          data[key] = payload.store[key] === '' ? null : payload.store[key];
        }
      }
    }

    const settings = await prisma.userSettings.update({
      where: { userId },
      data,
    });

    await logActivity({
      userId,
      action: 'settings.store_updated',
      entity: 'UserSettings',
      entityId: settings.id,
      message: 'Store settings updated',
      icon: 'storefront',
    });

    return mapSettings(settings);
  },

  async updateNotifications(userId, payload = {}) {
    await this.getOrCreate(userId);
    const source = payload.notifications && typeof payload.notifications === 'object'
      ? payload.notifications
      : payload;

    const data = {};
    for (const [key, value] of Object.entries(source)) {
      const col = PREF_MAP[key];
      if (col && typeof value === 'boolean') {
        data[col] = value;
      }
    }

    if (Object.keys(data).length === 0) {
      throw ApiError.badRequest('No valid notification preference fields provided.');
    }

    const settings = await prisma.userSettings.update({
      where: { userId },
      data,
    });

    await logActivity({
      userId,
      action: 'settings.notifications_updated',
      entity: 'UserSettings',
      entityId: settings.id,
      message: 'Notification preferences updated',
      icon: 'notifications',
    });

    return mapSettings(settings);
  },

  async getBilling(userId) {
    const settings = await this.getOrCreate(userId);
    return {
      plan: {
        name: settings.billing.planName,
        status: settings.billing.planStatus,
        renewsAt: settings.billing.planRenewsAt,
      },
      usage: settings.billing.usage,
      limits: {
        seats: 5,
        orders: 10000,
        storageMb: 5120,
      },
    };
  },

  async getSecurity(userId) {
    const [loginHistory, sessions] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.refreshSession.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastSeenAt: 'desc' },
      }),
    ]);

    return {
      loginHistory: loginHistory.map((h) => ({
        id: h.id,
        ip: h.ip,
        userAgent: h.userAgent,
        success: h.success,
        createdAt: h.createdAt,
      })),
      activeSessions: {
        count: sessions.length,
        items: sessions.map((s) => ({
          id: s.id,
          ip: s.ip,
          userAgent: s.userAgent,
          createdAt: s.createdAt,
          lastSeenAt: s.lastSeenAt,
          expiresAt: s.expiresAt,
        })),
      },
    };
  },
};
