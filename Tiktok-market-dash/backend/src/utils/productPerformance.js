import { toNumber, formatMoney } from './queryHelpers.js';
import {
  SALE_ORDER_STATUSES,
  moneyRound,
  allocateOrderRefundToItems,
  resolveRefundStatus,
} from './refundMath.js';

export { SALE_ORDER_STATUSES } from './refundMath.js';

export const parsePerformanceRange = (query = {}) => {
  const today = new Date();
  const endOf = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };
  const startOf = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const raw = String(query.range || query.preset || 'all').toLowerCase();
  let start = null;
  let end = endOf(today);
  let rangeKey = raw;

  if (raw === 'today' || raw === '1d') {
    start = startOf(today);
    rangeKey = 'today';
  } else if (raw === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    start = startOf(y);
    end = endOf(y);
    rangeKey = 'yesterday';
  } else if (raw === '7d' || raw === 'last7') {
    start = startOf(today);
    start.setDate(start.getDate() - 6);
    rangeKey = '7d';
  } else if (raw === '14d' || raw === 'last14') {
    start = startOf(today);
    start.setDate(start.getDate() - 13);
    rangeKey = '14d';
  } else if (raw === 'custom' || (query.startDate && query.endDate) || (query.start && query.end)) {
    const s = query.startDate || query.start;
    const e = query.endDate || query.end;
    start = startOf(s);
    end = endOf(e);
    rangeKey = 'custom';
  } else {
    start = null;
    end = null;
    rangeKey = 'all';
  }

  if (start && end && start > end) {
    const tmp = start;
    start = startOf(end);
    end = endOf(tmp);
  }

  return { start, end, rangeKey };
};

export const orderDateWhere = (start, end) => {
  if (!start && !end) return {};
  const createdAt = {};
  if (start) createdAt.gte = start;
  if (end) createdAt.lte = end;
  return { createdAt };
};

export const safeMargin = (grossProfit, grossSales) => {
  const sales = toNumber(grossSales);
  if (sales <= 0) return null;
  return Math.round((toNumber(grossProfit) / sales) * 1000) / 10;
};

export const safeAsp = (grossSales, unitsSold) => {
  const units = toNumber(unitsSold);
  if (units <= 0) return null;
  return Math.round((toNumber(grossSales) / units) * 100) / 100;
};

/**
 * Aggregate order-item rows into performance metrics with optional refunds.
 *
 * @param {Array} items - order line items (may include order.status, orderId, allocatedRefund)
 * @param {object} options
 * @param {number} options.fallbackUnitCost
 * @param {Map<string, number>|Record<string, number>} options.refundsByOrderId
 */
export const aggregateItems = (items, { fallbackUnitCost = 0, refundsByOrderId = null } = {}) => {
  const refundMap =
    refundsByOrderId instanceof Map
      ? refundsByOrderId
      : refundsByOrderId
        ? new Map(Object.entries(refundsByOrderId).map(([k, v]) => [k, toNumber(v)]))
        : null;

  // Group by order for proportional refund allocation when map provided
  const byOrder = new Map();
  for (const item of items) {
    const orderId = item.orderId || '_none';
    if (!byOrder.has(orderId)) byOrder.set(orderId, []);
    byOrder.get(orderId).push(item);
  }

  const adjusted = [];
  for (const [orderId, orderItems] of byOrder.entries()) {
    const status = orderItems[0]?.order?.status || orderItems[0]?.status;
    if (status === 'CANCELLED' || status === 'REFUNDED') {
      continue;
    }

    const orderRefund = refundMap ? toNumber(refundMap.get(orderId) || 0) : 0;
    const refundStatus = resolveRefundStatus(
      orderItems.reduce((s, i) => {
        const qty = toNumber(i.quantity);
        return s + (i.lineTotal != null ? toNumber(i.lineTotal) : toNumber(i.unitPrice) * qty);
      }, 0),
      orderRefund,
      status
    );

    if (refundStatus === 'full') {
      continue;
    }

    const withAlloc =
      orderRefund > 0
        ? allocateOrderRefundToItems(orderItems, orderRefund)
        : orderItems.map((i) => ({ ...i, allocatedRefund: toNumber(i.allocatedRefund) || 0 }));

    adjusted.push(...withAlloc);
  }

  // If no refund map and items already have allocatedRefund / simple path
  const rows = refundMap || items.some((i) => i.allocatedRefund != null) ? adjusted : items.filter((i) => {
    const status = i.order?.status || i.status;
    return status !== 'CANCELLED' && status !== 'REFUNDED';
  });

  let unitsSold = 0;
  let grossSales = 0;
  let netSales = 0;
  let cogs = 0;
  const orderIds = new Set();

  for (const item of rows) {
    const qty = toNumber(item.quantity);
    const line = item.lineTotal != null ? toNumber(item.lineTotal) : toNumber(item.unitPrice) * qty;
    const unitCost =
      item.unitCost != null && item.unitCost !== undefined
        ? toNumber(item.unitCost)
        : toNumber(fallbackUnitCost);
    const refundAlloc = toNumber(item.allocatedRefund) || 0;
    const netLine = Math.max(0, line - refundAlloc);

    unitsSold += qty;
    grossSales += line;
    netSales += netLine;
    // Partial refund (no inventory return): retain full COGS for remaining sold units
    cogs += unitCost * qty;
    if (item.orderId) orderIds.add(item.orderId);
  }

  const grossProfit = netSales - cogs;
  const profitMargin = safeMargin(grossProfit, netSales);
  const averageSellingPrice = safeAsp(netSales, unitsSold);

  return {
    unitsSold,
    ordersCount: orderIds.size,
    grossSales: moneyRound(grossSales),
    netSales: moneyRound(netSales),
    cogs: moneyRound(cogs),
    grossProfit: moneyRound(grossProfit),
    profitMargin,
    averageSellingPrice,
    grossSalesFormatted: formatMoney(grossSales),
    netSalesFormatted: formatMoney(netSales),
    cogsFormatted: formatMoney(cogs),
    grossProfitFormatted: formatMoney(grossProfit),
    averageSellingPriceFormatted:
      averageSellingPrice == null ? '—' : formatMoney(averageSellingPrice),
    profitMarginLabel: profitMargin == null ? '—' : `${profitMargin.toFixed(1)}%`,
  };
};

export const dayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const buildTrends = (items, { start, end, fallbackUnitCost = 0, refundsByOrderId = null } = {}) => {
  const buckets = new Map();

  const ensure = (key, labelDate) => {
    if (!buckets.has(key)) {
      buckets.set(key, {
        date: key,
        label: new Date(labelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        unitsSold: 0,
        profit: 0,
      });
    }
    return buckets.get(key);
  };

  if (start && end) {
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);
    while (cursor <= last) {
      ensure(dayKey(cursor), cursor);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const aggregatedLike = (() => {
    // Reuse allocation path via aggregateItems grouping logic for consistency
    const refundMap =
      refundsByOrderId instanceof Map
        ? refundsByOrderId
        : refundsByOrderId
          ? new Map(Object.entries(refundsByOrderId).map(([k, v]) => [k, toNumber(v)]))
          : new Map();

    const byOrder = new Map();
    for (const item of items) {
      const orderId = item.orderId || '_none';
      if (!byOrder.has(orderId)) byOrder.set(orderId, []);
      byOrder.get(orderId).push(item);
    }

    const out = [];
    for (const [orderId, orderItems] of byOrder.entries()) {
      const status = orderItems[0]?.order?.status || orderItems[0]?.status;
      if (status === 'CANCELLED' || status === 'REFUNDED') continue;
      const orderRefund = toNumber(refundMap.get(orderId) || 0);
      const orderGross = orderItems.reduce((s, i) => {
        const qty = toNumber(i.quantity);
        return s + (i.lineTotal != null ? toNumber(i.lineTotal) : toNumber(i.unitPrice) * qty);
      }, 0);
      if (resolveRefundStatus(orderGross, orderRefund, status) === 'full') continue;
      const withAlloc =
        orderRefund > 0 ? allocateOrderRefundToItems(orderItems, orderRefund) : orderItems;
      out.push(...withAlloc);
    }
    return out;
  })();

  for (const item of aggregatedLike) {
    const createdAt = item.order?.createdAt || item.createdAt;
    if (!createdAt) continue;
    const key = dayKey(createdAt);
    const bucket = ensure(key, createdAt);
    const qty = toNumber(item.quantity);
    const line = item.lineTotal != null ? toNumber(item.lineTotal) : toNumber(item.unitPrice) * qty;
    const refundAlloc = toNumber(item.allocatedRefund) || 0;
    const netLine = Math.max(0, line - refundAlloc);
    const unitCost =
      item.unitCost != null ? toNumber(item.unitCost) : toNumber(fallbackUnitCost);
    bucket.revenue += netLine;
    bucket.unitsSold += qty;
    bucket.profit += netLine - unitCost * qty;
  }

  const sorted = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
  return {
    salesTrend: sorted.map((b) => ({
      date: b.date,
      label: b.label,
      unitsSold: b.unitsSold,
      value: b.unitsSold,
    })),
    revenueTrend: sorted.map((b) => ({
      date: b.date,
      label: b.label,
      revenue: moneyRound(b.revenue),
      value: moneyRound(b.revenue),
      revenueFormatted: formatMoney(b.revenue),
    })),
    profitTrend: sorted.map((b) => ({
      date: b.date,
      label: b.label,
      profit: moneyRound(b.profit),
      value: moneyRound(b.profit),
      profitFormatted: formatMoney(b.profit),
    })),
  };
};

/** Snapshot unit cost when creating an order line. */
export const resolveUnitCost = (product) => {
  if (!product) return 0;
  if (product.costPrice != null) return toNumber(product.costPrice);
  return 0;
};
