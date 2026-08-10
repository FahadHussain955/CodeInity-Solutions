import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  formatDate,
  formatMoney,
  paginatedResult,
  parsePagination,
  toNumber,
} from '../../utils/queryHelpers.js';
import { logActivity } from '../../utils/activity.js';
import {
  orderNetRevenue,
  resolveRefundStatus,
  sumRefundAmounts,
} from '../../utils/refundMath.js';
import { resolveShopFilter, shopWhere } from '../../utils/shopScope.js';

const STATUS_LABEL = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  UNDER_REVIEW: 'Under Review',
  REFUNDED: 'Refunded',
};

const mapStatus = (status, refundStatus) => {
  if (status === 'REFUNDED' || refundStatus === 'full') return 'Refunded';
  if (refundStatus === 'partial') return 'Partially Refunded';
  return STATUS_LABEL[status] || status;
};

const mapOrderListItem = (o) => {
  const itemCount = o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
  const first = o.items?.[0];
  const refundedAmount = sumRefundAmounts(o.refunds || []);
  const refundStatus = resolveRefundStatus(o.totalAmount, refundedAmount, o.status);
  const netAmount = orderNetRevenue(o.totalAmount, refundedAmount, o.status);
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customer?.fullName || '—',
    customerId: o.customerId,
    email: o.customer?.email || '—',
    product: first?.productName || '—',
    items: itemCount,
    amount: formatMoney(netAmount),
    amountRaw: netAmount,
    grossAmount: formatMoney(o.totalAmount),
    grossAmountRaw: toNumber(o.totalAmount),
    refundedAmount,
    refundStatus,
    payment: o.paymentMethod || '—',
    date: formatDate(o.createdAt),
    status: mapStatus(o.status, refundStatus),
    statusRaw: o.status,
    storeIntegrationId: o.storeIntegrationId || null,
    shopId: o.storeIntegrationId || null,
    createdAt: o.createdAt,
  };
};

const mapOrderDetail = (o) => {
  const items = (o.items || []).map((i) => ({
    id: i.id,
    productId: i.productId,
    productName: i.productName,
    sku: i.sku,
    quantity: i.quantity,
    unitPrice: toNumber(i.unitPrice),
    unitPriceFormatted: formatMoney(i.unitPrice),
    unitCost: i.unitCost == null ? null : toNumber(i.unitCost),
    lineTotal: toNumber(i.lineTotal),
    lineTotalFormatted: formatMoney(i.lineTotal),
  }));
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const refundedAmount = sumRefundAmounts(o.refunds || []);
  const refundStatus = resolveRefundStatus(o.totalAmount, refundedAmount, o.status);
  const netAmount = orderNetRevenue(o.totalAmount, refundedAmount, o.status);
  const timeline = buildTimeline(o, refundStatus);

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customer
      ? {
          id: o.customer.id,
          name: o.customer.fullName,
          email: o.customer.email,
          phone: o.customer.phone,
          address: o.customer.address,
          city: o.customer.city,
          country: o.customer.country,
          postalCode: o.customer.postalCode,
          totalOrders: o.customer.totalOrders,
          totalSpent: formatMoney(o.customer.totalSpent),
          memberSince: formatDate(o.customer.createdAt),
        }
      : null,
    items,
    itemCount,
    amount: formatMoney(netAmount),
    amountRaw: netAmount,
    grossAmount: formatMoney(o.totalAmount),
    grossAmountRaw: toNumber(o.totalAmount),
    refundedAmount,
    refundedAmountFormatted: formatMoney(refundedAmount),
    refundStatus,
    refunds: (o.refunds || []).map((r) => ({
      id: r.id,
      amount: toNumber(r.amount),
      amountFormatted: formatMoney(r.amount),
      reason: r.reason,
      date: formatDate(r.createdAt),
      createdAt: r.createdAt,
    })),
    payment: o.paymentMethod || '—',
    paymentLabel:
      o.status === 'CANCELLED'
        ? 'Cancelled'
        : refundStatus === 'full'
          ? 'Fully refunded'
          : refundStatus === 'partial'
            ? 'Partially refunded'
            : 'Recorded',
    date: formatDate(o.createdAt),
    status: mapStatus(o.status, refundStatus),
    statusRaw: o.status,
    notes: o.notes,
    storeIntegrationId: o.storeIntegrationId || null,
    shopId: o.storeIntegrationId || null,
    timeline,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

const buildTimeline = (o, refundStatus) => {
  const placed = formatDate(o.createdAt);
  const steps = [
    { label: 'Order Placed', done: true, icon: 'receipt_long', time: placed },
    {
      label: 'Payment Confirmed',
      done: o.status !== 'PENDING' && o.status !== 'CANCELLED',
      icon: 'payments',
      time: o.status === 'PENDING' ? '—' : placed,
    },
    {
      label: 'Processing',
      done: ['PROCESSING', 'DELIVERED', 'UNDER_REVIEW', 'REFUNDED'].includes(o.status),
      icon: 'autorenew',
      time: ['PROCESSING', 'DELIVERED', 'UNDER_REVIEW', 'REFUNDED'].includes(o.status) ? placed : '—',
    },
    {
      label: 'Shipped',
      done: o.status === 'DELIVERED' || o.status === 'REFUNDED',
      icon: 'local_shipping',
      time: o.status === 'DELIVERED' || o.status === 'REFUNDED' ? formatDate(o.updatedAt) : '—',
    },
    {
      label: 'Delivered',
      done: o.status === 'DELIVERED' || o.status === 'REFUNDED',
      icon: 'check_circle',
      time: o.status === 'DELIVERED' || o.status === 'REFUNDED' ? formatDate(o.updatedAt) : '—',
    },
  ];
  if (o.status === 'CANCELLED') {
    return [steps[0], { label: 'Cancelled', done: true, icon: 'cancel', time: formatDate(o.updatedAt) }];
  }
  if (refundStatus === 'full' || o.status === 'REFUNDED') {
    return [...steps, { label: 'Refunded', done: true, icon: 'currency_exchange', time: formatDate(o.updatedAt) }];
  }
  if (refundStatus === 'partial') {
    return [...steps, { label: 'Partial Refund', done: true, icon: 'currency_exchange', time: formatDate(o.updatedAt) }];
  }
  return steps;
};

const findOrder = async (userId, idOrNumber) => {
  const include = {
    customer: true,
    items: { orderBy: { id: 'asc' } },
    refunds: { orderBy: { createdAt: 'asc' } },
  };
  let order = await prisma.order.findFirst({ where: { id: idOrNumber, userId }, include });
  if (!order) {
    order = await prisma.order.findFirst({ where: { orderNumber: idOrNumber, userId }, include });
  }
  return order;
};

export const ordersService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const search = String(query.search || '').trim();
    const statusFilter = String(query.status || query.filter || 'all').toUpperCase();
    const shopId = await resolveShopFilter(userId, query.shopId);

    const where = {
      AND: [
        { userId },
        shopWhere(shopId),
        statusFilter !== 'ALL' &&
        ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'UNDER_REVIEW', 'REFUNDED'].includes(statusFilter)
          ? { status: statusFilter }
          : {},
        search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customer: { fullName: { contains: search, mode: 'insensitive' } } },
                { customer: { email: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {},
      ],
    };

    const [total, rows, countsRaw] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { fullName: true, email: true } },
          items: { select: { productName: true, quantity: true } },
          refunds: { select: { amount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { userId, ...shopWhere(shopId) },
        _count: { _all: true },
      }),
    ]);

    const counts = { all: 0, processing: 0, pending: 0, delivered: 0, cancelled: 0, refunded: 0 };
    for (const row of countsRaw) {
      const n = row._count._all;
      counts.all += n;
      if (row.status === 'PROCESSING') counts.processing = n;
      if (row.status === 'PENDING') counts.pending = n;
      if (row.status === 'DELIVERED') counts.delivered = n;
      if (row.status === 'CANCELLED') counts.cancelled = n;
      if (row.status === 'REFUNDED') counts.refunded = n;
    }

    return {
      ...paginatedResult({ items: rows.map(mapOrderListItem), total, page, limit }),
      counts,
    };
  },

  async getById(userId, idOrNumber) {
    const order = await findOrder(userId, idOrNumber);
    if (!order) throw ApiError.notFound('Order not found.');
    return mapOrderDetail(order);
  },

  async updateStatus(userId, idOrNumber, status) {
    const order = await findOrder(userId, idOrNumber);
    if (!order) throw ApiError.notFound('Order not found.');

    const next = String(status || '').toUpperCase();
    if (!['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'UNDER_REVIEW', 'REFUNDED'].includes(next)) {
      throw ApiError.badRequest('Invalid order status.');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: next },
      include: { customer: true, items: true, refunds: true },
    });

    await logActivity({
      userId,
      action: 'order.status_updated',
      entity: 'Order',
      entityId: order.id,
      message: `Order ${order.orderNumber} → ${mapStatus(next)}`,
      icon: 'local_shipping',
    });

    return mapOrderDetail(updated);
  },
};
