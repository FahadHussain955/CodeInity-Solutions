import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateItems } from '../src/utils/productPerformance.js';
import {
  allocateOrderRefundToItems,
  orderNetRevenue,
  resolveRefundStatus,
  sumRefundAmounts,
} from '../src/utils/refundMath.js';

test('partial refund: net revenue reduced, COGS retained', () => {
  const items = [
    {
      orderId: 'o1',
      quantity: 1,
      unitPrice: 100,
      unitCost: 60,
      lineTotal: 100,
      order: { status: 'DELIVERED' },
    },
  ];
  const result = aggregateItems(items, {
    refundsByOrderId: new Map([['o1', 40]]),
  });
  assert.equal(result.grossSales, 100);
  assert.equal(result.netSales, 60);
  assert.equal(result.cogs, 60);
  assert.equal(result.grossProfit, 0);
  assert.equal(result.profitMargin, 0);
  assert.equal(result.unitsSold, 1);
});

test('full refund: order excluded from sales', () => {
  const items = [
    {
      orderId: 'o1',
      quantity: 1,
      unitPrice: 100,
      unitCost: 60,
      lineTotal: 100,
      order: { status: 'DELIVERED' },
    },
  ];
  const result = aggregateItems(items, {
    refundsByOrderId: new Map([['o1', 100]]),
  });
  assert.equal(result.unitsSold, 0);
  assert.equal(result.netSales, 0);
  assert.equal(result.cogs, 0);
  assert.equal(result.grossProfit, 0);
});

test('status REFUNDED excluded like cancelled', () => {
  const result = aggregateItems([
    {
      orderId: 'o1',
      quantity: 2,
      unitPrice: 50,
      unitCost: 20,
      lineTotal: 100,
      order: { status: 'REFUNDED' },
    },
  ]);
  assert.equal(result.unitsSold, 0);
  assert.equal(result.netSales, 0);
});

test('multiple refunds sum correctly', () => {
  assert.equal(sumRefundAmounts([{ amount: 20 }, { amount: 30 }]), 50);
  assert.equal(orderNetRevenue(100, 50, 'DELIVERED'), 50);
  assert.equal(resolveRefundStatus(100, 50, 'DELIVERED'), 'partial');
  assert.equal(resolveRefundStatus(100, 100, 'DELIVERED'), 'full');
});

test('allocateOrderRefundToItems proportional', () => {
  const allocated = allocateOrderRefundToItems(
    [
      { lineTotal: 60, quantity: 1, unitPrice: 60 },
      { lineTotal: 40, quantity: 1, unitPrice: 40 },
    ],
    50
  );
  assert.equal(allocated[0].allocatedRefund + allocated[1].allocatedRefund, 50);
});

test('over-refund remaining math', () => {
  const remaining = orderNetRevenue(100, 80, 'DELIVERED');
  assert.equal(remaining, 20);
  assert.ok(30 > remaining);
});
