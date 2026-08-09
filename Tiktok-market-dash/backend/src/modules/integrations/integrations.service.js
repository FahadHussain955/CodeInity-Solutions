import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { encryptSecret } from '../../utils/tokenCrypto.js';
import { formatDate, relativeDaysAgo } from '../../utils/queryHelpers.js';
import { labelToProvider, providerToLabel } from './providers/index.js';
import { syncService } from './sync.service.js';

const normalizeUrl = (url) => {
  let value = String(url || '').trim().toLowerCase();
  value = value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return value;
};

const isValidStoreUrl = (url) => {
  const normalized = normalizeUrl(url);
  if (!normalized || normalized.length < 3) return false;
  // Basic host validation — allows myshop.myshopify.com, custom domains, etc.
  return /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(normalized) ||
    /^[a-z0-9][a-z0-9.-]+$/i.test(normalized);
};

const mapIntegration = (row) => ({
  id: row.id,
  provider: row.provider,
  platform: providerToLabel(row.provider),
  storeName: row.storeName,
  name: row.storeName,
  storeUrl: row.storeUrl,
  url: row.storeUrl,
  storeId: row.storeId,
  isConnected: row.isConnected,
  lastSyncAt: row.lastSyncAt,
  lastSync: row.lastSyncAt ? relativeDaysAgo(row.lastSyncAt) : 'Never',
  lastSyncLabel: row.lastSyncAt ? formatDate(row.lastSyncAt) : 'Never',
  syncStatus: row.syncStatus,
  syncProgress: row.syncProgress,
  syncMessage: row.syncMessage,
  connectedAt: row.createdAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  hasCredentials: Boolean(row.accessToken),
});

export const integrationsService = {
  async list(userId) {
    const rows = await prisma.storeIntegration.findMany({
      where: { userId, isConnected: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapIntegration);
  },

  async status(userId) {
    const stores = await this.list(userId);
    return {
      isConnected: stores.length > 0,
      connectedCount: stores.length,
      stores,
      primary: stores[0] || null,
    };
  },

  async getById(userId, id) {
    const row = await prisma.storeIntegration.findFirst({
      where: { id, userId },
    });
    if (!row) throw ApiError.notFound('Store integration not found.');
    return mapIntegration(row);
  },

  async connect(userId, body) {
    const provider =
      body.providerEnum ||
      labelToProvider(body.provider || body.platform) ||
      (typeof body.provider === 'string' && ['SHOPIFY', 'TIKTOK_SHOP', 'WOOCOMMERCE'].includes(body.provider)
        ? body.provider
        : null) ||
      'TIKTOK_SHOP';

    if (!['SHOPIFY', 'TIKTOK_SHOP', 'WOOCOMMERCE'].includes(provider)) {
      throw ApiError.badRequest('Unsupported store provider.');
    }

    // Nexora is TikTok Marketplace–first; other channels are scaffolded for later.
    if (provider === 'SHOPIFY') {
      throw ApiError.badRequest('Shopify integration is coming soon. Connect TikTok Shop for now.');
    }
    if (provider === 'WOOCOMMERCE') {
      throw ApiError.badRequest('WooCommerce integration is coming soon.');
    }

    const storeName = String(body.storeName || body.name || '').trim();
    const storeUrl = normalizeUrl(body.storeUrl || body.url);

    if (!storeName || storeName.length < 2) {
      throw ApiError.badRequest('Store name is required.');
    }
    if (!isValidStoreUrl(storeUrl)) {
      throw ApiError.badRequest('A valid store URL is required.');
    }

    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, provider, storeUrl },
    });

    if (existing?.isConnected) {
      throw ApiError.conflict('This store is already connected.');
    }

    const accessToken = encryptSecret(body.accessToken || body.apiToken || body.token);
    const refreshToken = encryptSecret(body.refreshToken);

    const data = {
      userId,
      provider,
      storeName,
      storeUrl,
      storeId: body.storeId || `sandbox-${provider.toLowerCase()}-${Date.now()}`,
      accessToken,
      refreshToken,
      isConnected: true,
      syncStatus: 'IDLE',
      syncProgress: 0,
      syncMessage: 'Connected — awaiting first sync',
      lastSyncAt: null,
      metadata: {
        connectedVia: 'manual',
        sandbox: true,
      },
    };

    const row = existing
      ? await prisma.storeIntegration.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.storeIntegration.create({ data });

    // Kick off an initial sandbox sync (non-blocking best-effort)
    syncService.runManualSync(row.id, userId).catch(() => {});

    return mapIntegration(row);
  },

  async update(userId, id, body) {
    const row = await prisma.storeIntegration.findFirst({
      where: { id, userId, isConnected: true },
    });
    if (!row) throw ApiError.notFound('Connected store not found.');

    const nextName = body.storeName || body.name;
    const nextUrl = body.storeUrl || body.url;

    const data = {};
    if (nextName) data.storeName = String(nextName).trim();
    if (nextUrl) {
      const normalized = normalizeUrl(nextUrl);
      if (!isValidStoreUrl(normalized)) {
        throw ApiError.badRequest('A valid store URL is required.');
      }
      const clash = await prisma.storeIntegration.findFirst({
        where: {
          userId,
          provider: row.provider,
          storeUrl: normalized,
          NOT: { id },
        },
      });
      if (clash) throw ApiError.conflict('Another connection already uses this store URL.');
      data.storeUrl = normalized;
    }
    if (body.storeId) data.storeId = String(body.storeId);
    if (body.accessToken || body.apiToken) {
      data.accessToken = encryptSecret(body.accessToken || body.apiToken);
    }
    if (body.refreshToken) {
      data.refreshToken = encryptSecret(body.refreshToken);
    }

    const updated = await prisma.storeIntegration.update({
      where: { id },
      data,
    });
    return mapIntegration(updated);
  },

  async disconnect(userId, id) {
    const row = await prisma.storeIntegration.findFirst({
      where: { id, userId, isConnected: true },
    });
    if (!row) throw ApiError.notFound('Connected store not found.');

    const updated = await prisma.storeIntegration.update({
      where: { id },
      data: {
        isConnected: false,
        syncStatus: 'IDLE',
        syncProgress: 0,
        syncMessage: 'Disconnected',
        accessToken: null,
        refreshToken: null,
      },
    });

    return { id: updated.id, disconnected: true };
  },

  async disconnectByProvider(userId, platformLabel) {
    const provider = labelToProvider(platformLabel);
    if (!provider) throw ApiError.badRequest('Unknown provider.');

    const row = await prisma.storeIntegration.findFirst({
      where: { userId, provider, isConnected: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) throw ApiError.notFound('No connected store for this provider.');
    return this.disconnect(userId, row.id);
  },

  async sync(userId, id) {
    const result = await syncService.runManualSync(id, userId);
    return {
      integration: mapIntegration(result.integration),
      log: result.log,
    };
  },

  async lastSync(userId, id) {
    const status = await syncService.getStatus(id, userId);
    const logs = await syncService.getLogs(id, userId, { limit: 1 });
    return {
      ...status,
      lastLog: logs[0] || null,
    };
  },

  async syncLogs(userId, id, query = {}) {
    const logs = await syncService.getLogs(id, userId, {
      limit: Number.parseInt(query.limit, 10) || 20,
    });
    return { items: logs };
  },
};
