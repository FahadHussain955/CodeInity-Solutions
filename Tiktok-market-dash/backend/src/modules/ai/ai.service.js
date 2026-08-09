import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { formatMoney, toNumber } from '../../utils/queryHelpers.js';
import { formatAiInsights } from './ai.formatter.js';
import { geminiProvider } from './providers/geminiProvider.js';
import { heuristicProvider } from './providers/heuristicProvider.js';

const CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_CACHE_KEY = 'insights:default';

const gatherBusinessContext = async (userId) => {
  const ownershipProducts = userId
    ? { OR: [{ userId }, { userId: null }] }
    : undefined;

  const [
    products,
    inventories,
    customers,
    recentOrders,
    campaigns,
    soldItems,
  ] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(ownershipProducts || {}),
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        price: true,
        costPrice: true,
        userId: true,
      },
    }),
    prisma.inventory.findMany({
      where: ownershipProducts ? { product: ownershipProducts } : undefined,
      include: {
        product: { select: { name: true, sku: true, price: true, userId: true } },
      },
    }),
    prisma.customer.findMany({
      where: userId ? { userId } : undefined,
      select: {
        status: true,
        totalSpent: true,
        totalOrders: true,
      },
    }),
    prisma.order.findMany({
      where: {
        ...(userId ? { userId } : {}),
        status: { not: 'CANCELLED' },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { totalAmount: true },
    }),
    prisma.campaign.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { totalSpend: 'desc' },
      take: 20,
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          ...(userId ? { userId } : {}),
        status: { in: ['PENDING', 'PROCESSING', 'DELIVERED', 'UNDER_REVIEW'] },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        productId: { not: null },
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        lineTotal: true,
        unitCost: true,
        product: { select: { costPrice: true, price: true } },
      },
    }),
  ]);

  const scopedProducts = userId
    ? products.filter((p) => !p.userId || p.userId === userId)
    : products;
  const scopedInventories = userId
    ? inventories.filter((row) => !row.product?.userId || row.product.userId === userId)
    : inventories;

  const profitByProduct = new Map();
  for (const item of soldItems) {
    const key = item.productId;
    const row = profitByProduct.get(key) || {
      name: item.productName,
      unitsSold: 0,
      revenue: 0,
      cogs: 0,
    };
    const qty = item.quantity || 0;
    const revenue = toNumber(item.lineTotal);
    const unitCost =
      item.unitCost != null ? toNumber(item.unitCost) : toNumber(item.product?.costPrice);
    row.unitsSold += qty;
    row.revenue += revenue;
    row.cogs += unitCost * qty;
    profitByProduct.set(key, row);
  }

  const profitability = [...profitByProduct.values()]
    .map((p) => {
      const profit = p.revenue - p.cogs;
      const margin = p.revenue > 0 ? Math.round((profit / p.revenue) * 1000) / 10 : null;
      return {
        name: p.name,
        unitsSold: p.unitsSold,
        revenue: Math.round(p.revenue * 100) / 100,
        cogs: Math.round(p.cogs * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        margin,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  const lowMargin = profitability.filter((p) => p.margin != null && p.margin < 25 && p.revenue > 0);
  const highRevenueLowMargin = profitability.filter(
    (p) => p.revenue >= 100 && p.margin != null && p.margin < 20
  );
  const losingMoney = profitability.filter((p) => p.profit < 0);

  const lowStock = scopedInventories
    .filter((row) => row.currentStock <= row.reorderLevel)
    .map((row) => ({
      name: row.product?.name,
      sku: row.product?.sku,
      currentStock: row.currentStock,
      inStock: row.currentStock,
      reorderLevel: row.reorderLevel,
    }));

  const activeCustomers = customers.filter((c) => c.status === 'ACTIVE').length;
  const avgSpend =
    customers.length === 0
      ? 0
      : customers.reduce((s, c) => s + toNumber(c.totalSpent), 0) / customers.length;

  return {
    products: scopedProducts.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: toNumber(p.price),
      costPrice: p.costPrice == null ? null : toNumber(p.costPrice),
    })),
    lowStock,
    inventoryAlerts: lowStock,
    profitability: {
      topProfit: profitability.slice(0, 5),
      lowMargin: lowMargin.slice(0, 5),
      highRevenueLowMargin: highRevenueLowMargin.slice(0, 5),
      losingMoney: losingMoney.slice(0, 5),
      storeAvgMargin: (() => {
        const withMargin = profitability.filter((p) => p.margin != null);
        if (!withMargin.length) return null;
        return (
          Math.round(
            (withMargin.reduce((s, p) => s + p.margin, 0) / withMargin.length) * 10
          ) / 10
        );
      })(),
    },
    customerStats: {
      total: customers.length,
      active: activeCustomers,
      avgSpend,
    },
    orderStats: {
      recentCount: recentOrders.length,
      recentRevenue: recentOrders.reduce((s, o) => s + toNumber(o.totalAmount), 0),
    },
    campaigns: campaigns.map((c) => ({
      code: c.code,
      name: c.campaignName,
      status: c.status,
      statusRaw: c.status,
      objective: c.objective,
      budget: toNumber(c.budget),
      spent: toNumber(c.totalSpend),
      totalSpend: toNumber(c.totalSpend),
      revenue: toNumber(c.revenue),
      roas: toNumber(c.roas),
      impressions: c.impressions,
      clicks: c.clicks,
      conversions: c.conversions,
    })),
  };
};

const getCached = async (userId, cacheKey) => {
  const now = new Date();
  const row = await prisma.aiInsightCache.findFirst({
    where: {
      cacheKey,
      expiresAt: { gt: now },
      ...(userId ? { userId } : { userId: null }),
    },
    orderBy: { createdAt: 'desc' },
  });
  return row;
};

const setCached = async (userId, cacheKey, payload, provider) => {
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  // Unique on [userId, cacheKey] — userId may be null for shared cache
  try {
    if (userId) {
      return prisma.aiInsightCache.upsert({
        where: {
          userId_cacheKey: { userId, cacheKey },
        },
        create: {
          userId,
          cacheKey,
          payload,
          provider,
          expiresAt,
        },
        update: {
          payload,
          provider,
          expiresAt,
        },
      });
    }

    const existing = await prisma.aiInsightCache.findFirst({
      where: { userId: null, cacheKey },
    });
    if (existing) {
      return prisma.aiInsightCache.update({
        where: { id: existing.id },
        data: { payload, provider, expiresAt },
      });
    }
    return prisma.aiInsightCache.create({
      data: {
        userId: null,
        cacheKey,
        payload,
        provider,
        expiresAt,
      },
    });
  } catch {
    return prisma.aiInsightCache.create({
      data: {
        userId: userId || null,
        cacheKey: `${cacheKey}:${Date.now()}`,
        payload,
        provider,
        expiresAt,
      },
    });
  }
};

const generateRawInsights = async (context, options = {}) => {
  if (env.gemini?.apiKey) {
    try {
      const geminiResult = await geminiProvider.generateInsights(context, options);
      if (geminiResult) return geminiResult;
    } catch (err) {
      // Fall through to heuristic
      console.warn('[ai] Gemini failed, using heuristic:', err.message);
    }
  }
  return heuristicProvider.generateInsights(context, options);
};

export const aiService = {
  async getInsights(userId, { force = false, cacheKey = DEFAULT_CACHE_KEY } = {}) {
    if (!force) {
      const cached = await getCached(userId, cacheKey);
      if (cached?.payload) {
        return formatAiInsights(cached.payload, {
          provider: cached.provider,
          cached: true,
          generatedAt: cached.updatedAt?.toISOString?.() || cached.createdAt?.toISOString?.(),
        });
      }
    }

    const context = await gatherBusinessContext(userId);
    const raw = await generateRawInsights(context);
    const formatted = formatAiInsights(raw, {
      provider: raw.provider || 'heuristic',
      cached: false,
      generatedAt: new Date().toISOString(),
    });

    await setCached(userId, cacheKey, formatted, formatted.provider);
    return formatted;
  },

  async generate(userId, options = {}) {
    return this.getInsights(userId, { ...options, force: true });
  },

  async refresh(userId, options = {}) {
    return this.getInsights(userId, { ...options, force: true, cacheKey: DEFAULT_CACHE_KEY });
  },

  async recommendations(userId) {
    const insights = await this.getInsights(userId);
    return {
      recommendations: insights.groups.flatMap((g) =>
        g.items.map((text) => ({
          category: g.category,
          icon: g.icon,
          color: g.color,
          bg: g.bg,
          text,
        }))
      ),
      actions: insights.actions,
      provider: insights.provider,
      cached: insights.cached,
      generatedAt: insights.generatedAt,
    };
  },

  async forecasts(userId) {
    const insights = await this.getInsights(userId);
    const context = await gatherBusinessContext(userId);
    const recentRevenue = toNumber(context.orderStats.recentRevenue);
    const campaignRevenue = context.campaigns.reduce((s, c) => s + toNumber(c.revenue), 0);

    return {
      forecast: insights.forecast,
      weekly: {
        revenue: insights.forecast.revenue,
        revenueFormatted: insights.forecast.revenueFormatted,
        changeLabel: insights.forecast.changeLabel,
        basedOnOrders: recentRevenue,
        basedOnOrdersFormatted: formatMoney(recentRevenue),
      },
      campaigns: {
        attributedRevenue: campaignRevenue,
        attributedRevenueFormatted: formatMoney(campaignRevenue),
      },
      provider: insights.provider,
      cached: insights.cached,
      generatedAt: insights.generatedAt,
    };
  },

  async campaignSuggestions(userId) {
    const context = await gatherBusinessContext(userId);
    const insights = await this.getInsights(userId);
    const best = [...context.campaigns].sort((a, b) => toNumber(b.roas) - toNumber(a.roas))[0];
    const weak = [...context.campaigns]
      .filter((c) => toNumber(c.spent) > 0)
      .sort((a, b) => toNumber(a.roas) - toNumber(b.roas))[0];

    const suggestions = [];
    if (best) {
      suggestions.push({
        type: 'scale',
        title: `Scale ${best.name}`,
        description: `ROAS ${toNumber(best.roas).toFixed(2)}x — increase budget 15–20%.`,
        campaignCode: best.code,
      });
    }
    if (weak && weak.code !== best?.code) {
      suggestions.push({
        type: 'pause_or_trim',
        title: `Trim ${weak.name}`,
        description: `ROAS ${toNumber(weak.roas).toFixed(2)}x — reduce daily budget or refresh creatives.`,
        campaignCode: weak.code,
      });
    }
    if (context.lowStock.length) {
      suggestions.push({
        type: 'inventory_guard',
        title: 'Pause ads on low-stock SKUs',
        description: `${context.lowStock.length} item(s) at or below reorder level.`,
      });
    }

    const fromInsights = insights.groups
      .filter((g) =>
        ['Campaign Optimization', 'Growth Opportunities', 'Budget Optimisation'].includes(
          g.category
        )
      )
      .flatMap((g) =>
        g.items.map((text) => ({
          type: 'insight',
          title: g.category,
          description: text,
        }))
      );

    return {
      suggestions: [...suggestions, ...fromInsights].slice(0, 10),
      provider: insights.provider,
      cached: insights.cached,
      generatedAt: insights.generatedAt,
    };
  },
};
