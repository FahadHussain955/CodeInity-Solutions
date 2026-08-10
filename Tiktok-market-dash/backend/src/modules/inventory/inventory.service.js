import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  formatMoney,
  paginatedResult,
  parsePagination,
  toNumber,
} from '../../utils/queryHelpers.js';
import {
  evaluateLowStockTransition,
  getLowStockThreshold,
  isLowStock,
  isOutOfStock,
} from '../../utils/lowStock.js';
import { resolveShopFilter } from '../../utils/shopScope.js';

const stockStatus = (currentStock, threshold, maxStockLevel) => {
  if (isOutOfStock(currentStock)) return 'Out of Stock';
  if (isLowStock(currentStock, threshold)) return 'Low Stock';
  if (currentStock >= maxStockLevel) return 'Overstocked';
  return 'In Stock';
};

const availableStock = (row) => Math.max(0, row.currentStock - row.reservedStock);

const mapInventoryItem = (row, threshold) => {
  const current = row.currentStock;
  const reserved = row.reservedStock;
  const max = row.maxStockLevel;
  const lowThreshold = Number(threshold) || 10;
  return {
    id: row.id,
    productId: row.productId,
    name: row.product?.name,
    sku: row.product?.sku,
    category: row.product?.category,
    productStatus: row.product?.status,
    price: toNumber(row.product?.price),
    costPrice: toNumber(row.product?.costPrice),
    image: row.product?.image,
    storeIntegrationId: row.product?.storeIntegrationId || null,
    shopId: row.product?.storeIntegrationId || null,
    inStock: current,
    currentStock: current,
    reserved,
    reservedStock: reserved,
    available: availableStock(row),
    reorderPoint: lowThreshold,
    reorderLevel: row.reorderLevel,
    lowStockThreshold: lowThreshold,
    maxStockLevel: max,
    warehouse: row.warehouse,
    lastRestockedAt: row.lastRestockedAt,
    lastMovementAt: row.lastMovementAt,
    status: stockStatus(current, lowThreshold, max),
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  };
};

const inventoryInclude = {
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      price: true,
      costPrice: true,
      image: true,
      status: true,
      userId: true,
      storeIntegrationId: true,
    },
  },
};

const ownershipProductFilter = (userId) => ({
  OR: [{ userId }, { userId: null }],
});

const buildWhere = ({ search, status, userId, shopId }) => {
  const where = {};

  const productFilter = {
    ...(userId ? ownershipProductFilter(userId) : {}),
    ...(shopId ? { storeIntegrationId: shopId } : {}),
  };

  if (search) {
    where.product = {
      AND: [
        productFilter,
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        },
      ],
    };
  } else if (userId || shopId) {
    where.product = productFilter;
  }

  if (status === 'out_of_stock') {
    where.currentStock = { lte: 0 };
  }

  return where;
};

const buildOrderBy = (sort) => {
  switch (sort) {
    case 'name':
      return { product: { name: 'asc' } };
    case 'stock_asc':
      return { currentStock: 'asc' };
    case 'stock_desc':
      return { currentStock: 'desc' };
    case 'updated':
    default:
      return { updatedAt: 'desc' };
  }
};

const matchesStatusFilter = (item, status) => {
  if (!status || status === 'all') return true;
  if (status === 'in_stock') return item.status === 'In Stock';
  if (status === 'low_stock') return item.status === 'Low Stock';
  if (status === 'out_of_stock') return item.status === 'Out of Stock';
  if (status === 'overstocked') return item.status === 'Overstocked';
  return true;
};

const recordMovement = async (tx, { inventory, previousQty, newQty, adjustmentType, reason, userId }) => {
  await tx.stockMovement.create({
    data: {
      inventoryId: inventory.id,
      productId: inventory.productId,
      previousQty,
      newQty,
      adjustmentType,
      reason: reason || null,
      userId: userId || null,
    },
  });
};

const updateInventoryStock = async ({
  inventoryId,
  nextStock,
  reservedStock,
  adjustmentType,
  reason,
  userId,
  markRestocked = false,
}) => {
  const txResult = await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { id: inventoryId },
      include: inventoryInclude,
    });
    if (!inventory) throw ApiError.notFound('Inventory record not found.');

    const previousQty = inventory.currentStock;
    const newQty = Math.max(0, Number(nextStock));
    let nextReserved =
      reservedStock === undefined ? inventory.reservedStock : Math.max(0, Number(reservedStock));

    // When stock is reduced without an explicit reserved override, clamp reserved
    // so sellers can lower inventory into the low-stock range without a hard failure.
    if (nextReserved > newQty) {
      if (reservedStock === undefined) {
        nextReserved = newQty;
      } else {
        throw ApiError.badRequest('Reserved stock cannot exceed current stock.');
      }
    }

    const updated = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        currentStock: newQty,
        reservedStock: nextReserved,
        lastMovementAt: new Date(),
        ...(markRestocked ? { lastRestockedAt: new Date() } : {}),
      },
      include: inventoryInclude,
    });

    await recordMovement(tx, {
      inventory,
      previousQty,
      newQty,
      adjustmentType,
      reason,
      userId,
    });

    return { updated, previousQty, newQty };
  });

  const ownerId = txResult.updated.product?.userId || userId || null;
  if (ownerId) {
    await evaluateLowStockTransition({
      userId: ownerId,
      productId: txResult.updated.productId,
      productName: txResult.updated.product?.name,
      sku: txResult.updated.product?.sku,
      previousStock: txResult.previousQty,
      newStock: txResult.newQty,
    });
  }

  const threshold = ownerId ? await getLowStockThreshold(ownerId) : 10;
  return mapInventoryItem(txResult.updated, threshold);
};

export const inventoryService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const search = String(query.search || '').trim();
    const status = String(query.status || query.filter || 'all').toLowerCase();
    const sort = String(query.sort || 'updated').toLowerCase();
    const shopId = await resolveShopFilter(userId, query.shopId);
    const threshold = await getLowStockThreshold(userId);

    const where = buildWhere({ search, status, userId, shopId });

    // When filtering by computed status (low/overstocked/in_stock), load candidates then paginate in memory.
    const needsMemoryFilter = ['low_stock', 'in_stock', 'overstocked'].includes(status);

    if (needsMemoryFilter) {
      const all = await prisma.inventory.findMany({
        where,
        include: inventoryInclude,
        orderBy: buildOrderBy(sort),
      });
      const mapped = all
        .map((row) => mapInventoryItem(row, threshold))
        .filter((item) => matchesStatusFilter(item, status));
      const total = mapped.length;
      const items = mapped.slice(skip, skip + limit);
      return {
        ...paginatedResult({ items, total, page, limit }),
        lowStockThreshold: threshold,
      };
    }

    const [total, rows] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        include: inventoryInclude,
        orderBy: buildOrderBy(sort),
        skip,
        take: limit,
      }),
    ]);

    return {
      ...paginatedResult({
        items: rows.map((row) => mapInventoryItem(row, threshold)),
        total,
        page,
        limit,
      }),
      lowStockThreshold: threshold,
    };
  },

  async getById(userId, id) {
    const threshold = await getLowStockThreshold(userId);
    const row = await prisma.inventory.findFirst({
      where: {
        id,
        product: ownershipProductFilter(userId),
      },
      include: inventoryInclude,
    });
    if (!row) throw ApiError.notFound('Inventory record not found.');
    return mapInventoryItem(row, threshold);
  },

  async getByProductId(productId, userId = null) {
    const row = await prisma.inventory.findUnique({
      where: { productId },
      include: inventoryInclude,
    });
    if (!row) throw ApiError.notFound('Inventory record not found for product.');
    const ownerId = userId || row.product?.userId;
    const threshold = await getLowStockThreshold(ownerId);
    return mapInventoryItem(row, threshold);
  },

  async updateStock(id, { currentStock, reservedStock, reason }, userId) {
    if (currentStock === undefined || currentStock === null) {
      throw ApiError.badRequest('currentStock is required.');
    }
    return updateInventoryStock({
      inventoryId: id,
      nextStock: currentStock,
      reservedStock,
      adjustmentType: 'ADJUSTMENT',
      reason: reason || 'Manual stock update',
      userId,
    });
  },

  async adjustStock(id, { delta, reason }, userId) {
    const inventory = await prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw ApiError.notFound('Inventory record not found.');
    const next = inventory.currentStock + Number(delta || 0);
    return updateInventoryStock({
      inventoryId: id,
      nextStock: next,
      adjustmentType: 'ADJUSTMENT',
      reason: reason || `Adjustment by ${delta}`,
      userId,
    });
  },

  async restock(id, { quantity, reason }, userId) {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw ApiError.badRequest('Restock quantity must be a positive number.');
    }
    const inventory = await prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw ApiError.notFound('Inventory record not found.');
    return updateInventoryStock({
      inventoryId: id,
      nextStock: inventory.currentStock + qty,
      adjustmentType: 'RESTOCK',
      reason: reason || `Restocked +${qty}`,
      userId,
      markRestocked: true,
    });
  },

  async markOutOfStock(id, { reason } = {}, userId) {
    return updateInventoryStock({
      inventoryId: id,
      nextStock: 0,
      reservedStock: 0,
      adjustmentType: 'OUT_OF_STOCK',
      reason: reason || 'Marked out of stock',
      userId,
    });
  },

  async bulkUpdate(updates = [], userId) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw ApiError.badRequest('updates array is required.');
    }
    const results = [];
    for (const item of updates) {
      if (!item.id) throw ApiError.badRequest('Each update requires an inventory id.');
      const updated = await updateInventoryStock({
        inventoryId: item.id,
        nextStock: item.currentStock ?? item.inStock,
        reservedStock: item.reservedStock ?? item.reserved,
        adjustmentType: 'BULK',
        reason: item.reason || 'Bulk stock update',
        userId,
        markRestocked: Boolean(item.markRestocked),
      });
      results.push(updated);
    }
    return { items: results, count: results.length };
  },

  async history(inventoryId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const where = { inventoryId };

    const [total, rows] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items = rows.map((m) => ({
      id: m.id,
      productId: m.productId,
      productName: m.product?.name,
      sku: m.product?.sku,
      previousQuantity: m.previousQty,
      newQuantity: m.newQty,
      delta: m.newQty - m.previousQty,
      adjustmentType: m.adjustmentType,
      reason: m.reason,
      user: m.user
        ? { id: m.user.id, name: m.user.fullName, email: m.user.email }
        : null,
      createdAt: m.createdAt,
    }));

    return paginatedResult({ items, total, page, limit });
  },

  async analytics(userId, query = {}) {
    const shopId = await resolveShopFilter(userId, query.shopId);
    const threshold = await getLowStockThreshold(userId);
    const productWhere = {
      ...(userId ? ownershipProductFilter(userId) : {}),
      ...(shopId ? { storeIntegrationId: shopId } : {}),
    };
    const rows = await prisma.inventory.findMany({
      where: userId || shopId ? { product: productWhere } : undefined,
      include: {
        product: {
          select: {
            price: true,
            costPrice: true,
            name: true,
            sku: true,
            image: true,
            category: true,
            status: true,
            storeIntegrationId: true,
          },
        },
      },
    });

    const mapped = rows.map((row) => mapInventoryItem(row, threshold));
    const totalSkus = mapped.length;
    const totalUnits = mapped.reduce((s, i) => s + i.currentStock, 0);
    const lowStock = mapped.filter((i) => i.status === 'Low Stock');
    const outOfStock = mapped.filter((i) => i.status === 'Out of Stock');
    const overstocked = mapped.filter((i) => i.status === 'Overstocked');
    const inStock = mapped.filter((i) => i.status === 'In Stock');

    const totalValue = mapped.reduce((s, i) => s + i.currentStock * (i.costPrice || i.price || 0), 0);
    const retailValue = mapped.reduce((s, i) => s + i.currentStock * (i.price || 0), 0);

    const recentlyUpdated = [...mapped]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        currentStock: i.currentStock,
        status: i.status,
        updatedAt: i.updatedAt,
      }));

    const distribution = [
      { label: 'In Stock', count: inStock.length },
      { label: 'Low Stock', count: lowStock.length },
      { label: 'Out of Stock', count: outOfStock.length },
      { label: 'Overstocked', count: overstocked.length },
    ];

    return {
      totalSkus,
      totalUnits,
      totalInventoryValue: totalValue,
      totalInventoryValueFormatted: formatMoney(totalValue),
      retailValue,
      retailValueFormatted: formatMoney(retailValue),
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      overstockedCount: overstocked.length,
      inStockCount: inStock.length,
      lowStockThreshold: threshold,
      lowStockItems: lowStock.slice(0, 20).map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        image: i.image,
        category: i.category,
        productStatus: i.productStatus,
        stock: i.currentStock,
        currentStock: i.currentStock,
        threshold: i.lowStockThreshold,
        reorderLevel: i.lowStockThreshold,
        status: i.status,
      })),
      recentlyUpdated,
      distribution,
      cards: [
        { label: 'Total SKUs', value: String(totalSkus), icon: 'inventory_2', change: `${inStock.length} healthy` },
        {
          label: 'Low Stock Items',
          value: String(lowStock.length),
          icon: 'warning',
          change: lowStock.length ? 'Needs attention' : 'All clear',
          alert: lowStock.length > 0,
        },
        {
          label: 'Out of Stock',
          value: String(outOfStock.length),
          icon: 'remove_shopping_cart',
          change: outOfStock.length ? 'Restock needed' : 'None',
          alert: outOfStock.length > 0,
        },
        {
          label: 'Total Units',
          value: totalUnits.toLocaleString(),
          icon: 'stacked_bar_chart',
          change: formatMoney(totalValue),
        },
      ],
    };
  },

  async dashboardSummary(userId, query = {}) {
    const analytics = await this.analytics(userId, query);
    return {
      inventoryValue: analytics.totalInventoryValueFormatted,
      inventoryValueRaw: analytics.totalInventoryValue,
      lowStockCount: analytics.lowStockCount,
      outOfStockCount: analytics.outOfStockCount,
      lowStockItems: analytics.lowStockItems.slice(0, 5),
      totalSkus: analytics.totalSkus,
      totalUnits: analytics.totalUnits,
    };
  },
};

export default inventoryService;
