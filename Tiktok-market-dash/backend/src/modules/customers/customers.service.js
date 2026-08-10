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
import {
  resolveShopFilter,
  resolveWritableShopId,
  shopWhere,
} from '../../utils/shopScope.js';

const mapCustomer = (c) => ({
  id: c.id,
  name: c.fullName,
  fullName: c.fullName,
  email: c.email,
  phone: c.phone,
  profileImage: c.profileImage,
  avatar: c.profileImage,
  address: c.address,
  city: c.city,
  state: c.state,
  postalCode: c.postalCode,
  country: c.country,
  location: [c.city, c.country].filter(Boolean).join(', ') || null,
  orders: c.totalOrders,
  totalOrders: c.totalOrders,
  spent: formatMoney(c.totalSpent),
  totalSpent: toNumber(c.totalSpent),
  averageOrderValue: toNumber(c.averageOrderValue),
  averageOrderValueFormatted: formatMoney(c.averageOrderValue),
  lastOrderDate: c.lastOrderDate,
  lastOrderLabel: relativeDaysAgo(c.lastOrderDate),
  joined: formatDate(c.createdAt),
  status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
  statusRaw: c.status,
  tags: c.tags || [],
  storeIntegrationId: c.storeIntegrationId || null,
  shopId: c.storeIntegrationId || null,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

const recomputeCustomerStats = async (tx, customerId) => {
  const orders = await tx.order.findMany({
    where: { customerId, status: { not: 'CANCELLED' } },
    include: { refunds: { select: { amount: true } } },
  });

  let totalOrders = 0;
  let totalSpent = 0;
  let lastOrderDate = null;

  for (const o of orders) {
    if (o.status === 'REFUNDED') continue;
    const refunded = o.refunds.reduce((s, r) => s + toNumber(r.amount), 0);
    const net = Math.max(0, toNumber(o.totalAmount) - refunded);
    if (net <= 0 && refunded > 0) continue;
    totalOrders += 1;
    totalSpent += net;
    if (!lastOrderDate || o.createdAt > lastOrderDate) lastOrderDate = o.createdAt;
  }

  const averageOrderValue = totalOrders ? totalSpent / totalOrders : 0;

  return tx.customer.update({
    where: { id: customerId },
    data: {
      totalOrders,
      totalSpent: totalSpent.toFixed(2),
      averageOrderValue: averageOrderValue.toFixed(2),
      lastOrderDate,
    },
  });
};

const buildWhere = (userId, query = {}, shopId = null) => {
  const where = { userId, ...shopWhere(shopId) };
  const search = String(query.search || '').trim();
  const filter = String(query.filter || query.status || 'all').toLowerCase();

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (filter === 'active') where.status = 'ACTIVE';
  if (filter === 'inactive') where.status = 'INACTIVE';
  if (filter === 'high_value') where.totalSpent = { gte: 1000 };
  if (filter === 'recent') {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    where.createdAt = { gte: since };
  }

  return where;
};

const buildOrderBy = (sort) => {
  switch (String(sort || '').toLowerCase()) {
    case 'name':
      return { fullName: 'asc' };
    case 'orders':
    case 'total_orders':
    case 'totalorders':
      return { totalOrders: 'desc' };
    case 'spend':
    case 'total_spent':
    case 'totalspent':
      return { totalSpent: 'desc' };
    case 'recent':
    case 'activity':
    default:
      // Null lastOrderDate (never ordered) should not float above active buyers.
      return { lastOrderDate: { sort: 'desc', nulls: 'last' } };
  }
};

export const customersService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const shopId = await resolveShopFilter(userId, query.shopId);
    const where = buildWhere(userId, query, shopId);
    const orderBy = buildOrderBy(query.sort);

    const [total, rows] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return paginatedResult({
      items: rows.map(mapCustomer),
      total,
      page,
      limit,
    });
  },

  async getById(userId, id) {
    const customer = await prisma.customer.findFirst({ where: { id, userId } });
    if (!customer) throw ApiError.notFound('Customer not found.');
    return mapCustomer(customer);
  },

  async create(userId, payload) {
    const email = String(payload.email || '').trim().toLowerCase();
    if (!email) throw ApiError.badRequest('Email is required.');
    const storeIntegrationId = await resolveWritableShopId(
      userId,
      payload.shopId || payload.storeIntegrationId
    );
    const existing = await prisma.customer.findFirst({
      where: { userId, email, storeIntegrationId },
    });
    if (existing) throw ApiError.conflict('A customer with this email already exists.');

    const customer = await prisma.customer.create({
      data: {
        userId,
        storeIntegrationId,
        fullName: String(payload.fullName || payload.name || '').trim(),
        email,
        phone: payload.phone || null,
        profileImage: payload.profileImage || null,
        address: payload.address || null,
        city: payload.city || null,
        state: payload.state || null,
        postalCode: payload.postalCode || null,
        country: payload.country || 'Pakistan',
        status: payload.status === 'INACTIVE' || payload.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
        tags: Array.isArray(payload.tags) ? payload.tags : [],
      },
    });

    return mapCustomer(customer);
  },

  async update(userId, id, payload) {
    const existing = await prisma.customer.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Customer not found.');

    if (payload.email && payload.email.toLowerCase() !== existing.email) {
      const email = String(payload.email).trim().toLowerCase();
      const clash = await prisma.customer.findFirst({
        where: {
          userId,
          email,
          storeIntegrationId: existing.storeIntegrationId,
        },
      });
      if (clash) throw ApiError.conflict('A customer with this email already exists.');
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(payload.fullName || payload.name
          ? { fullName: String(payload.fullName || payload.name).trim() }
          : {}),
        ...(payload.email ? { email: String(payload.email).trim().toLowerCase() } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
        ...(payload.profileImage !== undefined ? { profileImage: payload.profileImage || null } : {}),
        ...(payload.address !== undefined ? { address: payload.address || null } : {}),
        ...(payload.city !== undefined ? { city: payload.city || null } : {}),
        ...(payload.state !== undefined ? { state: payload.state || null } : {}),
        ...(payload.postalCode !== undefined ? { postalCode: payload.postalCode || null } : {}),
        ...(payload.country !== undefined ? { country: payload.country || null } : {}),
        ...(payload.status
          ? {
              status:
                payload.status === 'INACTIVE' || payload.status === 'Inactive'
                  ? 'INACTIVE'
                  : 'ACTIVE',
            }
          : {}),
        ...(payload.tags ? { tags: Array.isArray(payload.tags) ? payload.tags : [] } : {}),
      },
    });

    return mapCustomer(customer);
  },

  async remove(userId, id) {
    const existing = await prisma.customer.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Customer not found.');

    const orderCount = await prisma.order.count({ where: { customerId: id } });
    if (orderCount > 0) {
      // Soft-deactivate instead of hard delete when orders exist
      const customer = await prisma.customer.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return { customer: mapCustomer(customer), softDeleted: true };
    }

    await prisma.customer.delete({ where: { id } });
    return { deleted: true, id };
  },

  async purchaseHistory(userId, id, query = {}) {
    const customer = await prisma.customer.findFirst({ where: { id, userId } });
    if (!customer) throw ApiError.notFound('Customer not found.');

    const { page, limit, skip } = parsePagination(query);

    const where = { customerId: id };
    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      product: o.items[0]?.productName || '—',
      products: o.items.map((i) => ({
        name: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: toNumber(i.unitPrice),
        lineTotal: toNumber(i.lineTotal),
      })),
      amount: formatMoney(o.totalAmount),
      totalAmount: toNumber(o.totalAmount),
      date: formatDate(o.createdAt),
      status:
        o.status === 'UNDER_REVIEW'
          ? 'Under Review'
          : o.status.charAt(0) + o.status.slice(1).toLowerCase(),
      payment: o.paymentMethod,
      createdAt: o.createdAt,
    }));

    const allOrders = await prisma.order.findMany({
      where: { customerId: id, status: { not: 'CANCELLED' } },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const productsPurchased = [];
    const seen = new Set();
    for (const o of allOrders) {
      for (const item of o.items) {
        const key = item.sku || item.productName;
        if (!seen.has(key)) {
          seen.add(key);
          productsPurchased.push({
            name: item.productName,
            sku: item.sku,
            quantity: item.quantity,
          });
        }
      }
    }

    return {
      customer: mapCustomer(customer),
      ...paginatedResult({ items, total, page, limit }),
      summary: {
        totalOrders: customer.totalOrders,
        totalSpend: toNumber(customer.totalSpent),
        totalSpendFormatted: formatMoney(customer.totalSpent),
        averageOrderValue: toNumber(customer.averageOrderValue),
        averageOrderValueFormatted: formatMoney(customer.averageOrderValue),
        lastPurchase: formatDate(customer.lastOrderDate),
        lastPurchaseRelative: relativeDaysAgo(customer.lastOrderDate),
        productsPurchased,
        timeline: allOrders.slice(0, 10).map((o) => ({
          orderNumber: o.orderNumber,
          date: formatDate(o.createdAt),
          amount: formatMoney(o.totalAmount),
          status: o.status,
        })),
      },
    };
  },

  async analytics(userId, query = {}) {
    const shopId = await resolveShopFilter(userId, query.shopId);
    const baseWhere = { userId, ...shopWhere(shopId) };
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      totalCustomers,
      newThisMonth,
      activeCustomers,
      previousPeriodNew,
      customers,
    ] = await Promise.all([
      prisma.customer.count({ where: baseWhere }),
      prisma.customer.count({ where: { ...baseWhere, createdAt: { gte: startOfMonth } } }),
      prisma.customer.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
      prisma.customer.count({
        where: { ...baseWhere, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      prisma.customer.findMany({
        where: baseWhere,
        orderBy: { totalSpent: 'desc' },
      }),
    ]);

    const returning = customers.filter((c) => c.totalOrders >= 2).length;
    const retentionRate = totalCustomers ? Math.round((returning / totalCustomers) * 100) : 0;
    const avgLtv =
      totalCustomers === 0
        ? 0
        : customers.reduce((s, c) => s + toNumber(c.totalSpent), 0) / totalCustomers;

    const growth =
      previousPeriodNew === 0
        ? newThisMonth > 0
          ? 100
          : 0
        : Math.round(((newThisMonth - previousPeriodNew) / previousPeriodNew) * 100);

    const topCustomers = customers.slice(0, 5).map(mapCustomer);
    const revenueByCustomer = customers.slice(0, 10).map((c) => ({
      id: c.id,
      name: c.fullName,
      revenue: toNumber(c.totalSpent),
      revenueFormatted: formatMoney(c.totalSpent),
      orders: c.totalOrders,
    }));

    const avgOrderValue =
      customers.length === 0
        ? 0
        : customers.reduce((s, c) => s + toNumber(c.averageOrderValue), 0) / customers.length;

    return {
      totalCustomers,
      newCustomers: newThisMonth,
      returningCustomers: returning,
      activeCustomers,
      customerGrowth: growth,
      retentionRate,
      averageLifetimeValue: avgLtv,
      averageLifetimeValueFormatted: formatMoney(avgLtv),
      averageOrderValue: avgOrderValue,
      averageOrderValueFormatted: formatMoney(avgOrderValue),
      topCustomers,
      revenueByCustomer,
      cards: [
        {
          label: 'Total Customers',
          value: totalCustomers.toLocaleString(),
          icon: 'group',
          change: `${growth >= 0 ? '+' : ''}${growth}% this month`,
        },
        {
          label: 'New This Month',
          value: String(newThisMonth),
          icon: 'person_add',
          change: `${activeCustomers} active`,
        },
        {
          label: 'Returning Rate',
          value: `${retentionRate}%`,
          icon: 'autorenew',
          change: `${returning} returning`,
        },
        {
          label: 'Avg. Order Value',
          value: formatMoney(avgOrderValue).replace('.00', ''),
          icon: 'payments',
          change: `LTV ${formatMoney(avgLtv)}`,
        },
      ],
    };
  },

  async dashboardSummary(userId, query = {}) {
    const analytics = await this.analytics(userId, query);
    return {
      totalCustomers: analytics.totalCustomers,
      customerGrowth: analytics.customerGrowth,
      returningCustomers: analytics.returningCustomers,
      retentionRate: analytics.retentionRate,
      averageLifetimeValue: analytics.averageLifetimeValueFormatted,
      averageLifetimeValueRaw: analytics.averageLifetimeValue,
    };
  },

  /** Used internally / by future orders module */
  async syncStatsFromOrders(customerId) {
    return prisma.$transaction((tx) => recomputeCustomerStats(tx, customerId));
  },
};
