import { toNumber, formatMoney } from './queryHelpers.js';

/**
 * Refund / profitability helpers.
 *
 * Accounting policy (MVP):
 * - CANCELLED / REFUNDED orders are excluded from sales aggregates.
 * - Partial refunds reduce Net Revenue only; COGS and Units Sold remain
 *   (financial refund without modeled physical inventory return).
 * - Full refund (sum(refunds) >= order total OR status REFUNDED) zeros the
 *   order's contribution (treated like a reversed sale financially).
 * - Physical stock restoration is NOT automatic — future enhancement.
 */

export const SALE_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'DELIVERED', 'UNDER_REVIEW'];

export const EXCLUDED_SALE_STATUSES = ['CANCELLED', 'REFUNDED'];

export const moneyRound = (n) => Math.round(toNumber(n) * 100) / 100;

export const sumRefundAmounts = (refunds = []) =>
  moneyRound(refunds.reduce((s, r) => s + toNumber(r.amount ?? r), 0));

/**
 * @returns {'none'|'partial'|'full'}
 */
export const resolveRefundStatus = (orderTotal, refundedAmount, orderStatus) => {
  if (orderStatus === 'REFUNDED') return 'full';
  if (orderStatus === 'CANCELLED') return 'none';
  const total = toNumber(orderTotal);
  const refunded = toNumber(refundedAmount);
  if (refunded <= 0) return 'none';
  if (total > 0 && refunded + 0.0001 >= total) return 'full';
  return 'partial';
};

export const orderNetRevenue = (orderTotal, refundedAmount, orderStatus) => {
  if (orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED') return 0;
  const net = toNumber(orderTotal) - toNumber(refundedAmount);
  return moneyRound(Math.max(0, net));
};

/**
 * Build map orderId → total refunded from refund rows.
 */
export const refundTotalsByOrderId = (refunds = []) => {
  const map = new Map();
  for (const r of refunds) {
    const id = r.orderId;
    if (!id) continue;
    map.set(id, moneyRound(toNumber(map.get(id) || 0) + toNumber(r.amount)));
  }
  return map;
};

/**
 * Allocate an order-level refund across line items by lineTotal share.
 * Fully refunded / cancelled orders allocate 100% (items excluded later).
 */
export const allocateOrderRefundToItems = (items, orderRefunded) => {
  const refunded = toNumber(orderRefunded);
  if (refunded <= 0 || !items.length) {
    return items.map((item) => ({ ...item, allocatedRefund: 0 }));
  }

  const gross = items.reduce((s, i) => {
    const qty = toNumber(i.quantity);
    const line = i.lineTotal != null ? toNumber(i.lineTotal) : toNumber(i.unitPrice) * qty;
    return s + line;
  }, 0);

  if (gross <= 0) {
    return items.map((item) => ({ ...item, allocatedRefund: 0 }));
  }

  let allocated = 0;
  const result = items.map((item, idx) => {
    const qty = toNumber(item.quantity);
    const line = item.lineTotal != null ? toNumber(item.lineTotal) : toNumber(item.unitPrice) * qty;
    const share = line / gross;
    let part = moneyRound(refunded * share);
    if (idx === items.length - 1) {
      part = moneyRound(refunded - allocated);
    }
    allocated = moneyRound(allocated + part);
    return { ...item, allocatedRefund: Math.min(part, line) };
  });

  return result;
};
