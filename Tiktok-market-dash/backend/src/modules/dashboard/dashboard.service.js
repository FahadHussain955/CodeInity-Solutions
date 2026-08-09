import { prisma } from '../../lib/prisma.js';
import { formatDate, formatMoney, toNumber } from '../../utils/queryHelpers.js';
import {
  orderNetRevenue,
  sumRefundAmounts,
} from '../../utils/refundMath.js';

const CANCELLED = 'CANCELLED';
const REFUNDED = 'REFUNDED';
const DELIVERED = 'DELIVERED';

const ownershipWhere = (userId) => ({
  OR: [{ userId }, { userId: null }],
});

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const parseRange = (query = {}) => {
  const today = new Date();
  const preset = String(query.preset || '').toLowerCase();
  let start;
  let end = endOfDay(today);

  if (query.start && query.end) {
    start = startOfDay(query.start);
    end = endOfDay(query.end);
  } else if (preset === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    start = startOfDay(y);
    end = endOfDay(y);
  } else if (preset === 'last7') {
    start = startOfDay(today);
    start.setDate(start.getDate() - 6);
  } else if (preset === 'last14') {
    start = startOfDay(today);
    start.setDate(start.getDate() - 13);
  } else {
    // today / default
    start = startOfDay(today);
  }

  if (start > end) start = startOfDay(end);

  const previousMs = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - previousMs);

  return { start, end, previousStart, previousEnd, preset: preset || 'today' };
};

const orderWhereInRange = (userId, start, end, extra = {}) => ({
  userId,
  createdAt: { gte: start, lte: end },
  status: { notIn: [CANCELLED, REFUNDED] },
  ...extra,
});

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const formatChange = (pct) => `${pct >= 0 ? '+' : ''}${pct}%`;

const dayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const enumerateDays = (start, end) => {
  const days = [];
  const cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const sumOrderRevenue = (orders) =>
  orders.reduce((sum, o) => {
    const refunded = sumRefundAmounts(o.refunds || []);
    return sum + orderNetRevenue(o.totalAmount, refunded, o.status);
  }, 0);

const loadOrdersNet = async (where) => {
  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      refunds: { select: { amount: true } },
    },
  });
  return {
    orders,
    netRevenue: sumOrderRevenue(orders),
    count: orders.length,
  };
};

const rollupSeries = (series, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < series.length; i += chunkSize) {
    const slice = series.slice(i, i + chunkSize);
    const revenue = slice.reduce((s, p) => s + p.revenue, 0);
    chunks.push({
      label: `${slice[0]?.label} – ${slice[slice.length - 1]?.label}`,
      revenue,
      revenueFormatted: formatMoney(revenue),
    });
  }
  return chunks;
};

export const dashboardService = {
  async getKpis(userId, query = {}) {
    const { start, end, previousStart, previousEnd } = parseRange(query);
    const productScope = ownershipWhere(userId);

    const [
      periodNet,
      previousNet,
      productsCount,
      customersCount,
      previousCustomers,
      inventoryRows,
      overallNet,
      campaigns,
    ] = await Promise.all([
      loadOrdersNet(orderWhereInRange(userId, start, end)),
      loadOrdersNet(orderWhereInRange(userId, previousStart, previousEnd)),
      prisma.product.count({ where: { status: 'ACTIVE', ...productScope } }),
      prisma.customer.count({ where: { userId } }),
      prisma.customer.count({
        where: { userId, createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      prisma.inventory.findMany({
        where: { product: productScope },
        select: {
          currentStock: true,
          product: { select: { price: true, costPrice: true, userId: true } },
        },
      }),
      loadOrdersNet({ userId, status: { notIn: [CANCELLED, REFUNDED] } }),
      prisma.campaign.findMany({
        where: { userId },
        select: {
          totalSpend: true,
          revenue: true,
          impressions: true,
          clicks: true,
          conversions: true,
          roas: true,
        },
      }),
    ]);

    const ownedInventory = inventoryRows.filter(
      (row) => !row.product?.userId || row.product.userId === userId
    );

    const revenue = periodNet.netRevenue;
    const prevRevenue = previousNet.netRevenue;
    const ordersCount = periodNet.count;
    const prevOrdersCount = previousNet.count;
    const inventoryValue = ownedInventory.reduce((sum, row) => {
      const unit = toNumber(row.product?.costPrice ?? row.product?.price);
      return sum + row.currentStock * unit;
    }, 0);

    const aov = ordersCount ? revenue / ordersCount : 0;
    const overallOrderCount = overallNet.count;
    const overallAov = overallOrderCount === 0 ? 0 : overallNet.netRevenue / overallOrderCount;

    const newCustomers = await prisma.customer.count({
      where: { userId, createdAt: { gte: start, lte: end } },
    });
    const customerGrowth = pctChange(newCustomers, previousCustomers);

    const revenueGrowth = pctChange(revenue, prevRevenue);
    const ordersGrowth = pctChange(ordersCount, prevOrdersCount);

    const campaignSpend = campaigns.reduce((s, c) => s + toNumber(c.totalSpend), 0);
    const campaignRevenue = campaigns.reduce((s, c) => s + toNumber(c.revenue), 0);
    const campaignImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
    const campaignClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
    const campaignConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
    const campaignsWithSpend = campaigns.filter((c) => toNumber(c.totalSpend) > 0);

    const roas =
      campaignSpend > 0
        ? Number((campaignRevenue / campaignSpend).toFixed(2))
        : campaignsWithSpend.length > 0
          ? Number(
              (
                campaignsWithSpend.reduce((s, c) => s + toNumber(c.roas), 0) /
                campaignsWithSpend.length
              ).toFixed(2)
            )
          : 0;

    const conversionRate =
      campaignClicks > 0
        ? Number(((campaignConversions / campaignClicks) * 100).toFixed(2))
        : campaignImpressions > 0
          ? Number(((campaignConversions / campaignImpressions) * 100).toFixed(2))
          : 0;

    const cards = [
      {
        id: 'revenue',
        label: 'Total Revenue',
        value: formatMoney(revenue).replace('.00', ''),
        valueRaw: revenue,
        change: formatChange(revenueGrowth),
        positive: revenueGrowth >= 0,
        icon: 'payments',
        route: '/dashboard/orders',
      },
      {
        id: 'orders',
        label: 'Total Orders',
        value: ordersCount.toLocaleString(),
        valueRaw: ordersCount,
        change: formatChange(ordersGrowth),
        positive: ordersGrowth >= 0,
        icon: 'shopping_cart',
        route: '/dashboard/orders',
      },
      {
        id: 'products',
        label: 'Active Products',
        value: productsCount.toLocaleString(),
        valueRaw: productsCount,
        change: formatMoney(inventoryValue).replace('.00', ''),
        positive: true,
        icon: 'inventory_2',
        route: '/dashboard/products',
        meta: { inventoryValue, inventoryValueFormatted: formatMoney(inventoryValue) },
      },
      {
        id: 'customers',
        label: 'Total Customers',
        value: customersCount.toLocaleString(),
        valueRaw: customersCount,
        change: formatChange(customerGrowth),
        positive: customerGrowth >= 0,
        icon: 'group',
        route: '/dashboard/customers',
      },
    ];

    return {
      range: { start, end },
      totalRevenue: revenue,
      totalRevenueFormatted: formatMoney(revenue),
      totalSales: revenue,
      totalOrders: ordersCount,
      totalProducts: productsCount,
      totalCustomers: customersCount,
      inventoryValue,
      inventoryValueFormatted: formatMoney(inventoryValue),
      averageOrderValue: aov || overallAov,
      averageOrderValueFormatted: formatMoney(aov || overallAov),
      conversionRate,
      conversionRateFormatted: `${conversionRate}%`,
      roas,
      revenueGrowth,
      ordersGrowth,
      customerGrowth,
      cards,
    };
  },

  async getRevenue(userId, query = {}) {
    const { start, end, preset } = parseRange(query);
    const orders = await prisma.order.findMany({
      where: orderWhereInRange(userId, start, end),
      select: {
        totalAmount: true,
        status: true,
        createdAt: true,
        refunds: { select: { amount: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const byDay = new Map();
    for (const o of orders) {
      const key = dayKey(o.createdAt);
      const net = orderNetRevenue(o.totalAmount, sumRefundAmounts(o.refunds), o.status);
      byDay.set(key, (byDay.get(key) || 0) + net);
    }

    const days = enumerateDays(start, end);
    const series = days.map((d) => {
      const key = dayKey(d);
      const revenue = byDay.get(key) || 0;
      return {
        date: key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue,
        revenueFormatted: formatMoney(revenue),
        // Chart UI historically showed `$nK` — expose both raw and chart units
        chartValue: Math.round((revenue / 1000) * 10) / 10,
      };
    });

    const total = series.reduce((s, p) => s + p.revenue, 0);
    const spanDays = days.length;

    return {
      preset,
      range: { start, end },
      granularity: spanDays <= 1 ? 'daily' : spanDays <= 14 ? 'daily' : 'daily',
      daily: series,
      weekly: rollupSeries(series, 7),
      monthly: rollupSeries(series, 30),
      total,
      totalFormatted: formatMoney(total),
      labels: series.map((p) => p.label),
      values: series.map((p) => (p.chartValue > 0 ? p.chartValue : Math.round(p.revenue) || 0)),
      max: Math.max(...series.map((p) => (p.chartValue > 0 ? p.chartValue : Math.round(p.revenue) || 0)), 1),
    };
  },

  async getSales(userId, query = {}) {
    const { start, end, previousStart, previousEnd } = parseRange(query);
    const [orders, prevOrders, newCustomers, prevNewCustomers] = await Promise.all([
      prisma.order.findMany({
        where: orderWhereInRange(userId, start, end),
        select: {
          totalAmount: true,
          status: true,
          createdAt: true,
          refunds: { select: { amount: true } },
        },
      }),
      prisma.order.findMany({
        where: orderWhereInRange(userId, previousStart, previousEnd),
        select: {
          totalAmount: true,
          status: true,
          refunds: { select: { amount: true } },
        },
      }),
      prisma.customer.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
      prisma.customer.count({
        where: { userId, createdAt: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const byDay = new Map();
    for (const o of orders) {
      const key = dayKey(o.createdAt);
      const entry = byDay.get(key) || { revenue: 0, orders: 0 };
      entry.revenue += orderNetRevenue(o.totalAmount, sumRefundAmounts(o.refunds), o.status);
      entry.orders += 1;
      byDay.set(key, entry);
    }

    const days = enumerateDays(start, end);
    const salesTrend = days.map((d) => {
      const key = dayKey(d);
      const entry = byDay.get(key) || { revenue: 0, orders: 0 };
      return {
        date: key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: entry.revenue,
        orders: entry.orders,
      };
    });

    return {
      salesTrend,
      ordersTrend: salesTrend.map((p) => ({ date: p.date, label: p.label, orders: p.orders })),
      revenueGrowth: pctChange(sumOrderRevenue(orders), sumOrderRevenue(prevOrders)),
      customerGrowth: pctChange(newCustomers, prevNewCustomers),
      periodOrders: orders.length,
      periodRevenue: sumOrderRevenue(orders),
    };
  },

  async getProductInsights(userId) {
    const productScope = ownershipWhere(userId);
    const items = await prisma.orderItem.findMany({
      where: { order: { userId, status: { notIn: [CANCELLED, REFUNDED] } } },
      select: {
        productId: true,
        productName: true,
        sku: true,
        quantity: true,
        lineTotal: true,
        unitCost: true,
        orderId: true,
        product: { select: { category: true, status: true, costPrice: true } },
        order: {
          select: {
            status: true,
            totalAmount: true,
            refunds: { select: { amount: true } },
          },
        },
      },
    });

    const byProduct = new Map();
    const byCategory = new Map();
    const { allocateOrderRefundToItems, resolveRefundStatus } = await import(
      '../../utils/refundMath.js'
    );

    const byOrder = new Map();
    for (const item of items) {
      if (!byOrder.has(item.orderId)) byOrder.set(item.orderId, []);
      byOrder.get(item.orderId).push(item);
    }

    const adjusted = [];
    for (const [, orderItems] of byOrder.entries()) {
      const order = orderItems[0].order;
      const refunded = sumRefundAmounts(order?.refunds || []);
      if (resolveRefundStatus(order?.totalAmount, refunded, order?.status) === 'full') continue;
      adjusted.push(
        ...(refunded > 0 ? allocateOrderRefundToItems(orderItems, refunded) : orderItems)
      );
    }

    for (const item of adjusted) {
      const key = item.productId || item.sku || item.productName;
      const existing = byProduct.get(key) || {
        productId: item.productId,
        name: item.productName,
        sku: item.sku,
        category: item.product?.category || 'Uncategorized',
        unitsSold: 0,
        revenue: 0,
        cogs: 0,
      };
      const qty = item.quantity;
      const line = toNumber(item.lineTotal);
      const revenue = Math.max(0, line - (toNumber(item.allocatedRefund) || 0));
      const unitCost =
        item.unitCost != null ? toNumber(item.unitCost) : toNumber(item.product?.costPrice);
      existing.unitsSold += qty;
      existing.revenue += revenue;
      existing.cogs += unitCost * qty;
      byProduct.set(key, existing);

      const cat = existing.category;
      byCategory.set(cat, (byCategory.get(cat) || 0) + revenue);
    }

    const ranked = [...byProduct.values()]
      .map((p) => {
        const profit = p.revenue - p.cogs;
        const margin = p.revenue > 0 ? Math.round((profit / p.revenue) * 1000) / 10 : null;
        return {
          ...p,
          profit: Math.round(profit * 100) / 100,
          margin,
          revenueFormatted: formatMoney(p.revenue),
          profitFormatted: formatMoney(profit),
          marginLabel: margin == null ? '—' : `${margin.toFixed(1)}%`,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
    const bestSellers = ranked.slice(0, 5);
    const topProfit = [...ranked].sort((a, b) => b.profit - a.profit).slice(0, 5);
    const worstPerforming = [...ranked].reverse().slice(0, 5);
    const topCategories = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue, revenueFormatted: formatMoney(revenue) }));

    const inventory = await prisma.inventory.findMany({
      where: { product: productScope },
      include: { product: { select: { name: true, sku: true, userId: true } } },
    });
    const lowStockProducts = inventory
      .filter((row) => !row.product?.userId || row.product.userId === userId)
      .filter((row) => row.currentStock > 0 && row.currentStock <= row.reorderLevel)
      .map((row) => ({
        name: row.product.name,
        sku: row.product.sku,
        stock: row.currentStock,
        reorderLevel: row.reorderLevel,
      }))
      .slice(0, 10);

    return { bestSellers, topProfit, worstPerforming, topCategories, lowStockProducts };
  },

  async getCustomerInsights(userId, query = {}) {
    const { start, end, previousStart, previousEnd } = parseRange(query);
    const [
      newCustomers,
      prevNew,
      customers,
      returning,
    ] = await Promise.all([
      prisma.customer.count({ where: { userId, createdAt: { gte: start, lte: end } } }),
      prisma.customer.count({
        where: { userId, createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      prisma.customer.findMany({
        where: { userId },
        select: { totalSpent: true, totalOrders: true },
      }),
      prisma.customer.count({ where: { userId, totalOrders: { gte: 2 } } }),
    ]);

    const total = customers.length;
    const avgLtv =
      total === 0
        ? 0
        : customers.reduce((s, c) => s + toNumber(c.totalSpent), 0) / total;

    return {
      newCustomers,
      returningCustomers: returning,
      customerLifetimeValue: avgLtv,
      customerLifetimeValueFormatted: formatMoney(avgLtv),
      customerGrowth: pctChange(newCustomers, prevNew),
      totalCustomers: total,
    };
  },

  async getRecentOrders(userId, query = {}) {
    const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));
    const { start, end } = parseRange(query);

    const where = {
      userId,
      createdAt: { gte: start, lte: end },
    };

    let orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { fullName: true } },
        items: { select: { productName: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // If range has no orders, fall back to latest overall (keeps dashboard useful)
    if (orders.length === 0) {
      orders = await prisma.order.findMany({
        where: { userId },
        include: {
          customer: { select: { fullName: true } },
          items: { select: { productName: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }

    return orders.map((o) => ({
      id: o.orderNumber,
      orderId: o.id,
      customer: o.customer?.fullName || '—',
      product: o.items[0]?.productName || '—',
      amount: formatMoney(o.totalAmount),
      amountRaw: toNumber(o.totalAmount),
      status:
        o.status === 'UNDER_REVIEW'
          ? 'Under Review'
          : o.status.charAt(0) + o.status.slice(1).toLowerCase(),
      date: formatDate(o.createdAt),
      createdAt: o.createdAt,
    }));
  },

  async getActivity(userId, query = {}) {
    const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20));
    const productScope = ownershipWhere(userId);

    const [products, orders, movements, customers] = await Promise.all([
      prisma.product.findMany({
        where: productScope,
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: { id: true, name: true, userId: true, createdAt: true, updatedAt: true },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          customer: { select: { fullName: true } },
        },
      }),
      prisma.stockMovement.findMany({
        where: { product: productScope },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { product: { select: { name: true, userId: true } } },
      }),
      prisma.customer.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, fullName: true, createdAt: true },
      }),
    ]);

    const ownedProducts = products.filter((p) => !p.userId || p.userId === userId);
    const ownedMovements = movements.filter(
      (m) => !m.product?.userId || m.product.userId === userId
    );

    const items = [];

    for (const p of ownedProducts) {
      const isNew = Math.abs(p.updatedAt - p.createdAt) < 2000;
      items.push({
        type: isNew ? 'product_created' : 'product_updated',
        title: isNew ? 'Product created' : 'Product updated',
        description: p.name,
        icon: isNew ? 'add_box' : 'edit',
        at: p.updatedAt,
      });
    }

    for (const o of orders) {
      items.push({
        type: o.status === DELIVERED ? 'order_completed' : 'order_placed',
        title: o.status === DELIVERED ? 'Order completed' : 'Order placed',
        description: `${o.orderNumber} · ${o.customer?.fullName || 'Customer'}`,
        icon: o.status === DELIVERED ? 'task_alt' : 'shopping_bag',
        at: o.status === DELIVERED ? o.updatedAt : o.createdAt,
      });
    }

    for (const m of ownedMovements) {
      items.push({
        type: 'inventory_updated',
        title: 'Inventory updated',
        description: `${m.product?.name || 'Product'}: ${m.previousQty} → ${m.newQty}`,
        icon: 'inventory_2',
        at: m.createdAt,
      });
    }

    for (const c of customers) {
      items.push({
        type: 'customer_registered',
        title: 'Customer registered',
        description: c.fullName,
        icon: 'person_add',
        at: c.createdAt,
      });
    }

    return items
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, limit)
      .map((item) => ({
        ...item,
        time: formatDate(item.at),
        relative: relativeTime(item.at),
      }));
  },

  async getStoreHealth(userId) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const productScope = ownershipWhere(userId);
    const [activeProducts, productCount, inventory, orderTotal, fulfillable] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE', ...productScope } }),
      prisma.product.count({ where: productScope }),
      prisma.inventory.findMany({
        where: { product: productScope },
        select: { currentStock: true, reorderLevel: true, product: { select: { userId: true } } },
      }),
      prisma.order.count({ where: { userId, createdAt: { gte: since } } }),
      prisma.order.count({
        where: {
          userId,
          createdAt: { gte: since },
          status: { in: ['DELIVERED', 'PROCESSING'] },
        },
      }),
    ]);

    const ownedInventory = inventory.filter(
      (i) => !i.product?.userId || i.product.userId === userId
    );

    const totalSkus = ownedInventory.length || productCount;
    const outOfStock = ownedInventory.filter((i) => i.currentStock <= 0).length;
    const lowStock = ownedInventory.filter(
      (i) => i.currentStock > 0 && i.currentStock <= i.reorderLevel
    ).length;
    const healthy = ownedInventory.filter((i) => i.currentStock > i.reorderLevel).length;

    const inventoryHealth =
      totalSkus === 0 ? 100 : Math.round((healthy / totalSkus) * 100);

    const fulfillmentRate =
      orderTotal === 0 ? 100 : Math.round((fulfillable / orderTotal) * 100);

    const outOfStockPct =
      totalSkus === 0 ? 0 : Math.round((outOfStock / totalSkus) * 100);

    return {
      inventoryHealth,
      inventoryHealthLabel: `${inventoryHealth}%`,
      orderFulfillmentRate: fulfillmentRate,
      orderFulfillmentRateLabel: `${fulfillmentRate}%`,
      activeProducts,
      outOfStockCount: outOfStock,
      outOfStockPercentage: outOfStockPct,
      lowStockCount: lowStock,
      totalSkus,
    };
  },

  async getOverview(userId, query = {}) {
    const [kpis, revenue, sales, productInsights, customerInsights, recentOrders, activity, storeHealth] =
      await Promise.all([
        this.getKpis(userId, query),
        this.getRevenue(userId, query),
        this.getSales(userId, query),
        this.getProductInsights(userId),
        this.getCustomerInsights(userId, query),
        this.getRecentOrders(userId, { ...query, limit: query.limit || 10 }),
        this.getActivity(userId, { limit: 15 }),
        this.getStoreHealth(userId),
      ]);

    return {
      kpis,
      revenue,
      sales,
      productInsights,
      customerInsights,
      recentOrders,
      activity,
      storeHealth,
      lowStockItems: productInsights.lowStockProducts,
    };
  },
};

const relativeTime = (date) => {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};
