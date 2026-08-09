import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDescriptionWithExtras,
  normalizeProductAiPayload,
  suggestSkuFromTitle,
} from '../src/modules/ai/productAi.js';

test('normalizeProductAiPayload maps title and arrays', () => {
  const product = normalizeProductAiPayload({
    title: 'Wireless Earbuds',
    description: 'Compact earbuds',
    highlights: ['ANC', 'USB-C'],
    keywords: 'audio, earbuds',
    category: 'Electronics > Audio',
    productType: 'Earbuds',
    attributes: { Color: 'Black' },
  });
  assert.equal(product.title, 'Wireless Earbuds');
  assert.deepEqual(product.highlights, ['ANC', 'USB-C']);
  assert.ok(product.keywords.includes('audio'));
  assert.equal(product.attributes.Color, 'Black');
});

test('normalizeProductAiPayload rejects empty payload', () => {
  assert.throws(() => normalizeProductAiPayload({}), /missing title/);
});

test('buildDescriptionWithExtras appends highlights', () => {
  const text = buildDescriptionWithExtras({
    description: 'Nice product',
    highlights: ['Light'],
    keywords: ['desk'],
    attributes: { Material: 'Wood' },
  });
  assert.match(text, /Nice product/);
  assert.match(text, /Highlights/);
  assert.match(text, /Keywords: desk/);
  assert.match(text, /Material: Wood/);
});

test('suggestSkuFromTitle produces uppercase sku-ish string', () => {
  const sku = suggestSkuFromTitle('Aura Pro Headphones');
  assert.match(sku, /^AURA-PRO-HEADPHONES-/);
});
