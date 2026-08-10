import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeShopIdParam,
  shopWhere,
} from '../src/utils/shopScope.js';

test('normalizeShopIdParam("all") → null', () => {
  assert.equal(normalizeShopIdParam('all'), null);
  assert.equal(normalizeShopIdParam('ALL'), null);
});

test('normalizeShopIdParam("xyz") → "xyz"', () => {
  assert.equal(normalizeShopIdParam('xyz'), 'xyz');
});

test('shopWhere(null) → {}', () => {
  assert.deepEqual(shopWhere(null), {});
});

test('shopWhere("abc") → { storeIntegrationId: "abc" }', () => {
  assert.deepEqual(shopWhere('abc'), { storeIntegrationId: 'abc' });
});
