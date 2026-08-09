import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateItems,
  parsePerformanceRange,
  safeAsp,
  safeMargin,
} from '../src/utils/productPerformance.js';

test('aggregateItems computes revenue, cogs, profit, margin', () => {
  const result = aggregateItems([
    { orderId: 'o1', quantity: 2, unitPrice: 50, unitCost: 30, lineTotal: 100 },
    { orderId: 'o2', quantity: 1, unitPrice: 50, unitCost: 30, lineTotal: 50 },
  ]);
  assert.equal(result.unitsSold, 3);
  assert.equal(result.ordersCount, 2);
  assert.equal(result.grossSales, 150);
  assert.equal(result.netSales, 150);
  assert.equal(result.cogs, 90);
  assert.equal(result.grossProfit, 60);
  assert.equal(result.profitMargin, 40);
  assert.equal(result.averageSellingPrice, 50);
});

test('aggregateItems handles zero sales safely', () => {
  const result = aggregateItems([]);
  assert.equal(result.unitsSold, 0);
  assert.equal(result.grossSales, 0);
  assert.equal(result.grossProfit, 0);
  assert.equal(result.profitMargin, null);
  assert.equal(result.averageSellingPrice, null);
  assert.equal(result.profitMarginLabel, '—');
});

test('aggregateItems prefers historical unitCost over fallback', () => {
  const result = aggregateItems(
    [{ orderId: 'o1', quantity: 10, unitPrice: 25, unitCost: 20, lineTotal: 250 }],
    { fallbackUnitCost: 99 }
  );
  assert.equal(result.cogs, 200);
});

test('cancelled-style empty aggregation and safe helpers', () => {
  assert.equal(safeMargin(0, 0), null);
  assert.equal(safeAsp(100, 0), null);
  assert.equal(safeAsp(100, 4), 25);
});

test('parsePerformanceRange supports 7d and all', () => {
  const week = parsePerformanceRange({ range: '7d' });
  assert.equal(week.rangeKey, '7d');
  assert.ok(week.start);
  assert.ok(week.end);

  const all = parsePerformanceRange({ range: 'all' });
  assert.equal(all.rangeKey, 'all');
  assert.equal(all.start, null);
});
