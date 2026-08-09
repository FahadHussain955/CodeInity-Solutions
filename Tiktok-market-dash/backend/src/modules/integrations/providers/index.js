/**
 * Provider adapters for store sync.
 * TikTok Shop is the primary marketplace channel for Nexora.
 * Shopify / WooCommerce adapters are scaffolded for later.
 */

export const PROVIDER_LABELS = {
  TIKTOK_SHOP: 'TikTok Shop',
  SHOPIFY: 'Shopify',
  WOOCOMMERCE: 'WooCommerce',
};

export const PRIMARY_PROVIDER = 'TIKTOK_SHOP';

export const labelToProvider = (label) => {
  const map = {
    'tiktok shop': 'TIKTOK_SHOP',
    tiktok: 'TIKTOK_SHOP',
    tiktok_shop: 'TIKTOK_SHOP',
    marketplace: 'TIKTOK_SHOP',
    shopify: 'SHOPIFY',
    woocommerce: 'WOOCOMMERCE',
  };
  return map[String(label || '').trim().toLowerCase()] || null;
};

export const providerToLabel = (provider) => PROVIDER_LABELS[provider] || provider;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sandboxSync = async (provider, integration, onProgress) => {
  const steps = [
    { progress: 15, message: `Authenticating with ${providerToLabel(provider)}…` },
    { progress: 35, message: 'Fetching TikTok catalog snapshot…' },
    { progress: 55, message: 'Syncing TikTok Shop orders…' },
    { progress: 75, message: 'Updating inventory mirrors…' },
    { progress: 100, message: 'TikTok Shop sandbox sync completed' },
  ];

  const details = {
    mode: 'sandbox',
    provider,
    storeUrl: integration.storeUrl,
    productsSynced: Math.floor(Math.random() * 40) + 10,
    ordersSynced: Math.floor(Math.random() * 20) + 5,
    inventoryUpdated: Math.floor(Math.random() * 30) + 8,
  };

  for (const step of steps) {
    await sleep(180);
    // eslint-disable-next-line no-await-in-loop
    await onProgress(step.progress, step.message);
  }

  return details;
};

export const providerAdapters = {
  TIKTOK_SHOP: {
    async sync(integration, onProgress) {
      // TODO: replace with TikTok Shop Partner API client
      return sandboxSync('TIKTOK_SHOP', integration, onProgress);
    },
  },
  SHOPIFY: {
    async sync(integration, onProgress) {
      // Scaffolded — not enabled for connect yet
      return sandboxSync('SHOPIFY', integration, onProgress);
    },
  },
  WOOCOMMERCE: {
    async sync(integration, onProgress) {
      return sandboxSync('WOOCOMMERCE', integration, onProgress);
    },
  },
};

export const getAdapter = (provider) => {
  const adapter = providerAdapters[provider];
  if (!adapter) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  return adapter;
};
