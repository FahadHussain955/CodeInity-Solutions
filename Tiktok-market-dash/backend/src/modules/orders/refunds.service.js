import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { formatDate, formatMoney, toNumber } from '../../utils/queryHelpers.js';
import { logActivity } from '../../utils/activity.js';
import {
  moneyRound,
  orderNetRevenue,
  resolveRefundStatus,
  sumRefundAmounts,
} from '../../utils/refundMath.js';

const findOwnedOrder = async (tx, userId, idOrNumber) => {
  const db = tx || prisma;
  let order = await db.order.findFirst({
    where: { id: idOrNumber, userId },
    include: {
      items: true,
      refunds: { orderBy: { createdAt: 'asc' } },
      customer: true,
    },
  });
  if (!order) {
    order = await db.order.findFirst({
      where: { orderNumber: idOrNumber, userId },
      include: {
        items: true,
        refunds: { orderBy: { createdAt: 'asc' } },
        customer: true,
      },
    });
  }
  return order;
};

const recomputeCustomerStats = async (tx, customerId) => {
  const orders = await tx.order.findMany({
    where: {
      customerId,
      status: { notIn: ['CANCELLED'] },
    },
    include: { refunds: { select: { amount: true } } },
  });

  let totalOrders = 0;
  let totalSpent = 0;
  let lastOrderDate = null;

  for (const o of orders) {
    if (o.status === 'REFUNDED') continue;
    const refunded = sumRefundAmounts(o.refunds);
    const net = orderNetRevenue(o.totalAmount, refunded, o.status);
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
      totalSpent: moneyRound(totalSpent).toFixed(2),
      averageOrderValue: moneyRound(averageOrderValue).toFixed(2),
      lastOrderDate,
    },
  });
};

const mapRefund = (r) => ({
  id: r.id,
  orderId: r.orderId,
  amount: toNumber(r.amount),
  amountFormatted: formatMoney(r.amount),
  reason: r.reason || null,
  createdAt: r.createdAt,
  date: formatDate(r.createdAt),
});

export const refundsService = {
  async listForOrder(userId, orderIdOrNumber) {
    const order = await findOwnedOrder(null, userId, orderIdOrNumber);
    if (!order) throw ApiError.notFound('Order not found.');

    const refundedAmount = sumRefundAmounts(order.refunds);
    const refundStatus = resolveRefundStatus(order.totalAmount, refundedAmount, order.status);
    const netAmount = orderNetRevenue(order.totalAmount, refundedAmount, order.status);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderTotal: toNumber(order.totalAmount),
      orderTotalFormatted: formatMoney(order.totalAmount),
      refundedAmount,
      refundedAmountFormatted: formatMoney(refundedAmount),
      remainingRefundable: moneyRound(Math.max(0, toNumber(order.totalAmount) - refundedAmount)),
      remainingRefundableFormatted: formatMoney(
        Math.max(0, toNumber(order.totalAmount) - refundedAmount)
      ),
      netAmount,
      netAmountFormatted: formatMoney(netAmount),
      refundStatus,
      refunds: order.refunds.map(mapRefund),
    };
  },

  async create(userId, orderIdOrNumber, { amount, reason } = {}) {
    const numericAmount = toNumber(amount);
    if (!Number.isFinite(numericAmount) || Number.isNaN(numericAmount)) {
      throw ApiError.badRequest('Refund amount must be a valid number.');
    }
    if (numericAmount <= 0) {
      throw ApiError.badRequest('Refund amount must be greater than zero.');
    }

    try {
      return await prisma.$transaction(
        async (tx) => {
          const order = await findOwnedOrder(tx, userId, orderIdOrNumber);
          if (!order) throw ApiError.notFound('Order not found.');

          if (order.status === 'CANCELLED') {
            throw ApiError.badRequest('Cannot refund a cancelled order.');
          }
          if (order.status === 'REFUNDED') {
            throw ApiError.badRequest('Order is already fully refunded.');
          }

          const alreadyRefunded = sumRefundAmounts(order.refunds);
          const orderTotal = toNumber(order.totalAmount);
          const remaining = moneyRound(orderTotal - alreadyRefunded);

          if (numericAmount > remaining + 0.0001) {
            throw ApiError.badRequest(
              `Refund exceeds remaining refundable amount (${formatMoney(remaining)}).`
            );
          }

          const refund = await tx.refund.create({
            data: {
              userId,
              orderId: order.id,
              amount: moneyRound(numericAmount).toFixed(2),
              reason: reason ? String(reason).slice(0, 500) : null,
            },
          });

          const newTotalRefunded = moneyRound(alreadyRefunded + numericAmount);
          const isFull = newTotalRefunded + 0.0001 >= orderTotal;

          if (isFull) {
            await tx.order.update({
              where: { id: order.id },
              data: { status: 'REFUNDED' },
            });
          }

          await recomputeCustomerStats(tx, order.customerId);

          await logActivity({
            userId,
            action: 'order.refunded',
            entity: 'Order',
            entityId: order.id,
            message: `Refund ${formatMoney(numericAmount)} on ${order.orderNumber}${
              isFull ? ' (full)' : ' (partial)'
            }`,
            icon: 'currency_exchange',
          });

          const refundStatus = resolveRefundStatus(
            orderTotal,
            newTotalRefunded,
            isFull ? 'REFUNDED' : order.status
          );

          return {
            refund: mapRefund(refund),
            orderId: order.id,
            orderNumber: order.orderNumber,
            refundedAmount: newTotalRefunded,
            refundedAmountFormatted: formatMoney(newTotalRefunded),
            remainingRefundable: moneyRound(Math.max(0, orderTotal - newTotalRefunded)),
            netAmount: orderNetRevenue(
              orderTotal,
              newTotalRefunded,
              isFull ? 'REFUNDED' : order.status
            ),
            refundStatus,
            orderStatus: isFull ? 'REFUNDED' : order.status,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        }
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err?.code === 'P2034') {
        throw ApiError.conflict('Refund could not be completed due to a concurrent update. Retry.');
      }
      throw err;
    }
  },

  async getById(userId, refundId) {
    const refund = await prisma.refund.findFirst({
      where: { id: refundId, userId },
    });
    if (!refund) throw ApiError.notFound('Refund not found.');
    return mapRefund(refund);
  },
};

export { recomputeCustomerStats, findOwnedOrder, mapRefund };
