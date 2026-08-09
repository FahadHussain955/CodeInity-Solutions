import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/utils/ApiError.js';
import { formatMoney, parsePagination, toNumber } from '../src/utils/queryHelpers.js';
import { stripXss, stripXssDeep } from '../src/utils/sanitize.js';

test('ApiError.conflict returns 409', () => {
  const err = ApiError.conflict('Duplicate');
  assert.equal(err.statusCode, 409);
  assert.equal(err.code, 'CONFLICT');
  assert.equal(err.message, 'Duplicate');
});

test('ApiError.unauthorized returns 401', () => {
  const err = ApiError.unauthorized();
  assert.equal(err.statusCode, 401);
  assert.equal(err.code, 'UNAUTHORIZED');
});

test('formatMoney formats USD currency strings', () => {
  assert.equal(formatMoney(12.5), '$12.50');
  assert.equal(formatMoney('1000'), '$1,000.00');
  assert.equal(formatMoney(null), '$0.00');
});

test('parsePagination clamps page and limit', () => {
  assert.deepEqual(parsePagination({ page: '2', limit: '25' }), {
    page: 2,
    limit: 25,
    skip: 25,
  });
  assert.equal(parsePagination({ limit: '999' }).limit, 100);
  assert.equal(parsePagination({ page: '0' }).page, 1);
});

test('toNumber falls back safely', () => {
  assert.equal(toNumber('42.5'), 42.5);
  assert.equal(toNumber('nope', 7), 7);
});

test('stripXss removes script tags and event handlers', () => {
  const dirty = '<script>alert(1)</script>Hello onclick=evil';
  const clean = stripXss(dirty);
  assert.ok(!clean.includes('<script>'));
  assert.ok(!clean.toLowerCase().includes('onclick='));
  assert.ok(clean.includes('Hello'));
});

test('stripXssDeep sanitizes nested objects', () => {
  const result = stripXssDeep({
    name: '<script>x</script>Nexora',
    nested: { note: 'javascript:alert(1)' },
  });
  assert.equal(result.name, 'Nexora');
  assert.ok(!result.nested.note.includes('javascript:'));
});
