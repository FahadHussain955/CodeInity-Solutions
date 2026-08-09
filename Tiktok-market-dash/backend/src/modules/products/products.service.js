import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  formatDate,
  formatMoney,
  paginatedResult,
  parsePagination,
  relativeDaysAgo,
  toNumber,
} from '../../utils/queryHelpers.js';
import { logActivity } from '../../utils/activity.js';
import {
  SALE_ORDER_STATUSES,
  aggregateItems,
  buildTrends,
  orderDateWhere,
  parsePerformanceRange,
  resolveUnitCost,
} from '../../utils/productPerformance.js';

const STATUS_MAP = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

const ownershipWhere = (userId) => ({
  OR: [{ userId }, { userId: null }],
});

const assertProductAccess = async (productId, userId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, ...ownershipWhere(userId) },
    include: { inventory: true },
  });
  if (!product) throw ApiError.notFound('Product not found.');
  // Strict ownership: if product is owned by another user, hide it
  if (product.userId && product.userId !== userId) {
    throw ApiError.notFound('Product not found.');
  }
  return product;
};

const mapProduct = (p, perf = null) => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  category: p.category,
  price: toNumber(p.price),
  priceFormatted: formatMoney(p.price),
  costPrice: p.costPrice == null ? null : toNumber(p.costPrice),
  costPriceFormatted: p.costPrice == null ? '—' : formatMoney(p.costPrice),
  image: p.image,
  description: p.description,
  status: STATUS_MAP[p.status] || p.status,
  statusRaw: p.status,
  stock: p.inventory?.currentStock ?? null,
  reorderLevel: p.inventory?.reorderLevel ?? null,
  warehouse: p.inventory?.warehouse ?? null,
  updatedAt: p.updatedAt,
  updatedLabel: relativeDaysAgo(p.updatedAt),
  createdAt: p.createdAt,
  joined: formatDate(p.createdAt),
  aiOptimized: false,
  performance: perf,
});

const salesItemWhere = (productIds, start, end) => ({
  productId: Array.isArray(productIds) ? { in: productIds } : productIds,
  order: {
    status: { in: SALE_ORDER_STATUSES },
    ...orderDateWhere(start, end),
  },
});

const loadItemsForProducts = async (productIds, start, end) => {
  if (!productIds.length) return { items: [], refundsByOrderId: new Map() };
  const items = await prisma.orderItem.findMany({
    where: salesItemWhere(productIds, start, end),
    select: {
      productId: true,
      orderId: true,
      quantity: true,
      unitPrice: true,
      unitCost: true,
      lineTotal: true,
      order: { select: { createdAt: true, status: true } },
    },
  });

  const orderIds = [...new Set(items.map((i) => i.orderId).filter(Boolean))];
  const refundsByOrderId = new Map();
  if (orderIds.length) {
    const refunds = await prisma.refund.groupBy({
      by: ['orderId'],
      where: { orderId: { in: orderIds } },
      _sum: { amount: true },
    });
    for (const row of refunds) {
      refundsByOrderId.set(row.orderId, Number(row._sum.amount || 0));
    }
  }

  return { items, refundsByOrderId };
};

export const productsService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const search = String(query.search || '').trim();
    const status = String(query.status || query.filter || 'all').toUpperCase();

    const where = {
      AND: [
        ownershipWhere(userId),
        status !== 'ALL' && ['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(status)
          ? { status }
          : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { inventory: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const { start, end, rangeKey } = parsePerformanceRange(query);
    const ids = rows.map((r) => r.id);
    const { items, refundsByOrderId } = await loadItemsForProducts(ids, start, end);
    const byProduct = new Map();
    for (const item of items) {
      if (!byProduct.has(item.productId)) byProduct.set(item.productId, []);
      byProduct.get(item.productId).push(item);
    }

    const mapped = rows.map((p) => {
      const perf = aggregateItems(byProduct.get(p.id) || [], {
        fallbackUnitCost: resolveUnitCost(p),
        refundsByOrderId,
      });
      return mapProduct(p, perf);
    });

    const counts = await prisma.product.groupBy({
      by: ['status'],
      where: ownershipWhere(userId),
      _count: { _all: true },
    });
    const countMap = { all: 0, active: 0, draft: 0, archived: 0 };
    for (const row of counts) {
      const n = row._count._all;
      countMap.all += n;
      if (row.status === 'ACTIVE') countMap.active = n;
      if (row.status === 'DRAFT') countMap.draft = n;
      if (row.status === 'ARCHIVED') countMap.archived = n;
    }

    return {
      ...paginatedResult({ items: mapped, total, page, limit }),
      counts: countMap,
      range: rangeKey,
    };
  },

  async getById(userId, id) {
    const product = await assertProductAccess(id, userId);
    return mapProduct(product);
  },

  async create(userId, payload = {}) {
    const name = String(payload.name || '').trim();
    const sku = String(payload.sku || '').trim().toUpperCase();
    if (!name) throw ApiError.badRequest('Product name is required.');
    if (!sku) throw ApiError.badRequest('SKU is required.');

    const statusRaw = String(payload.status || 'DRAFT').toUpperCase();
    const status = ['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(statusRaw) ? statusRaw : 'DRAFT';
    const price = toNumber(payload.price);
    const costPrice =
      payload.costPrice != null && payload.costPrice !== ''
        ? toNumber(payload.costPrice)
        : payload.cost != null && payload.cost !== ''
          ? toNumber(payload.cost)
          : null;

    const stock = Math.max(0, Number.parseInt(payload.stock ?? payload.quantity ?? 0, 10) || 0);
    const reorderLevel = Math.max(
      0,
      Number.parseInt(payload.reorderPoint ?? payload.reorderLevel ?? 10, 10) || 10
    );

    try {
      const product = await prisma.product.create({
        data: {
          userId,
          name,
          sku,
          category: String(payload.category || 'Uncategorized').trim(),
          price,
          costPrice,
          description: payload.description ? String(payload.description).trim() : null,
          image: payload.image || null,
          status,
          inventory: {
            create: {
              currentStock: stock,
              reorderLevel,
              maxStockLevel: Math.max(stock, reorderLevel * 10, 100),
              lastRestockedAt: stock > 0 ? new Date() : null,
              lastMovementAt: new Date(),
            },
          },
        },
        include: { inventory: true },
      });

      await logActivity({
        userId,
        action: 'product.created',
        entity: 'Product',
        entityId: product.id,
        message: `Product created: ${product.name}`,
        icon: 'inventory_2',
      });

      return mapProduct(product);
    } catch (err) {
      if (err.code === 'P2002') throw ApiError.conflict('A product with this SKU already exists.');
      throw err;
    }
  },

  async update(userId, id, payload = {}) {
    await assertProductAccess(id, userId);
    const data = {};
    if (payload.name !== undefined) data.name = String(payload.name).trim();
    if (payload.sku !== undefined) data.sku = String(payload.sku).trim().toUpperCase();
    if (payload.category !== undefined) data.category = String(payload.category).trim();
    if (payload.description !== undefined) {
      data.description = payload.description ? String(payload.description).trim() : null;
    }
    if (payload.image !== undefined) data.image = payload.image || null;
    if (payload.price !== undefined) data.price = toNumber(payload.price);
    if (payload.costPrice !== undefined || payload.cost !== undefined) {
      const raw = payload.costPrice !== undefined ? payload.costPrice : payload.cost;
      data.costPrice = raw === null || raw === '' ? null : toNumber(raw);
    }
    if (payload.status !== undefined) {
      const s = String(payload.status).toUpperCase();
      if (['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(s)) data.status = s;
      else if (['Active', 'Draft', 'Archived'].includes(payload.status)) {
        data.status = payload.status.toUpperCase();
      }
    }

    try {
      const product = await prisma.product.update({
        where: { id },
        data,
        include: { inventory: true },
      });

      if (payload.stock !== undefined || payload.reorderPoint !== undefined) {
        const invData = {};
        if (payload.stock !== undefined) {
          invData.currentStock = Math.max(0, Number.parseInt(payload.stock, 10) || 0);
          invData.lastMovementAt = new Date();
        }
        if (payload.reorderPoint !== undefined || payload.reorderLevel !== undefined) {
          invData.reorderLevel = Math.max(
            0,
            Number.parseInt(payload.reorderPoint ?? payload.reorderLevel, 10) || 0
          );
        }
        if (Object.keys(invData).length) {
          await prisma.inventory.upsert({
            where: { productId: id },
            update: invData,
            create: {
              productId: id,
              currentStock: invData.currentStock ?? 0,
              reorderLevel: invData.reorderLevel ?? 10,
            },
          });
        }
      }

      await logActivity({
        userId,
        action: 'product.updated',
        entity: 'Product',
        entityId: id,
        message: `Product updated: ${product.name}`,
        icon: 'edit',
      });

      const fresh = await prisma.product.findUnique({
        where: { id },
        include: { inventory: true },
      });
      return mapProduct(fresh);
    } catch (err) {
      if (err.code === 'P2002') throw ApiError.conflict('A product with this SKU already exists.');
      throw err;
    }
  },

  async remove(userId, id) {
    await assertProductAccess(id, userId);
    await prisma.product.delete({ where: { id } });
    await logActivity({
      userId,
      action: 'product.deleted',
      entity: 'Product',
      entityId: id,
      message: 'Product deleted',
      icon: 'delete',
    });
    return { deleted: true };
  },

  async getPerformance(userId, id, query = {}) {
    const product = await assertProductAccess(id, userId);
    const { start, end, rangeKey } = parsePerformanceRange(query);
    const { items, refundsByOrderId } = await loadItemsForProducts([id], start, end);
    const metrics = aggregateItems(items, {
      fallbackUnitCost: resolveUnitCost(product),
      refundsByOrderId,
    });
    const trends = buildTrends(items, {
      start,
      end,
      fallbackUnitCost: resolveUnitCost(product),
      refundsByOrderId,
    });

    return {
      productId: id,
      productName: product.name,
      sku: product.sku,
      unitCost: resolveUnitCost(product),
      unitCostFormatted: formatMoney(resolveUnitCost(product)),
      sellingPrice: toNumber(product.price),
      sellingPriceFormatted: formatMoney(product.price),
      range: rangeKey,
      start,
      end,
      ...metrics,
      ...trends,
    };
  },

  async getBatchPerformance(userId, query = {}) {
    const { start, end, rangeKey } = parsePerformanceRange(query);
    const ids = String(query.ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const allowed = await prisma.product.findMany({
      where: {
        ...(ids.length ? { id: { in: ids } } : {}),
        OR: [{ userId }, { userId: null }],
      },
      select: { id: true, userId: true, costPrice: true, name: true, sku: true },
      take: ids.length ? Math.min(ids.length, 200) : 100,
      orderBy: { updatedAt: 'desc' },
    });

    const scoped = allowed.filter((p) => !p.userId || p.userId === userId);
    const allowedIds = scoped.map((p) => p.id);
    const { items, refundsByOrderId } = await loadItemsForProducts(allowedIds, start, end);
    const byProduct = new Map();
    for (const item of items) {
      if (!byProduct.has(item.productId)) byProduct.set(item.productId, []);
      byProduct.get(item.productId).push(item);
    }

    return {
      range: rangeKey,
      items: scoped.map((p) => ({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        ...aggregateItems(byProduct.get(p.id) || [], {
          fallbackUnitCost: resolveUnitCost(p),
          refundsByOrderId,
        }),
      })),
    };
  },

  async rankings(userId, query = {}) {
    const { start, end, rangeKey } = parsePerformanceRange(query);
    const metric = String(query.metric || 'units').toLowerCase();
    const limit = Math.min(20, Math.max(1, Number.parseInt(query.limit, 10) || 5));

    const products = await prisma.product.findMany({
      where: ownershipWhere(userId),
      select: { id: true, userId: true, name: true, sku: true, costPrice: true, image: true },
    });
    const allowed = products.filter((p) => !p.userId || p.userId === userId);
    const { items, refundsByOrderId } = await loadItemsForProducts(
      allowed.map((p) => p.id),
      start,
      end
    );
    const byProduct = new Map();
    for (const item of items) {
      if (!byProduct.has(item.productId)) byProduct.set(item.productId, []);
      byProduct.get(item.productId).push(item);
    }

    let ranked = allowed.map((p) => {
      const perf = aggregateItems(byProduct.get(p.id) || [], {
        fallbackUnitCost: resolveUnitCost(p),
        refundsByOrderId,
      });
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        image: p.image,
        ...perf,
      };
    });

    const sorters = {
      units: (a, b) => b.unitsSold - a.unitsSold,
      revenue: (a, b) => b.netSales - a.netSales,
      profit: (a, b) => b.grossProfit - a.grossProfit,
      margin: (a, b) => (b.profitMargin ?? -Infinity) - (a.profitMargin ?? -Infinity),
      worst: (a, b) => a.grossProfit - b.grossProfit,
    };
    const sortFn = sorters[metric] || sorters.units;
    ranked = ranked.sort(sortFn).slice(0, limit);

    return { range: rangeKey, metric, items: ranked };
  },
};

export { assertProductAccess, resolveUnitCost, SALE_ORDER_STATUSES };
