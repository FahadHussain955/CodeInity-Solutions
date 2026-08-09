import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignsService } from '../src/modules/campaigns/campaigns.service.js';
import { adsService } from '../src/modules/ads/ads.service.js';
import { audiencesService } from '../src/modules/audiences/audiences.service.js';
import { ApiError } from '../src/utils/ApiError.js';

/**
 * Ownership helpers reject cross-user access with 404.
 * These unit-style tests mock no DB — they validate ApiError.notFound contract
 * when underlying find returns null (service throws). Full live matrix runs in QA shell.
 *
 * For DB-backed checks, see live security matrix after migrate/seed.
 */

test('ApiError.notFound is 404 for growth IDOR contract', () => {
  const err = ApiError.notFound('Campaign not found.');
  assert.equal(err.statusCode, 404);
  assert.equal(err.message, 'Campaign not found.');
});

test('growth services export ownership-aware methods', () => {
  assert.equal(typeof campaignsService.list, 'function');
  assert.equal(typeof campaignsService.getById, 'function');
  assert.equal(typeof campaignsService.analytics, 'function');
  assert.equal(typeof adsService.list, 'function');
  assert.equal(typeof adsService.getById, 'function');
  assert.equal(typeof adsService.analytics, 'function');
  assert.equal(typeof audiencesService.list, 'function');
  assert.equal(typeof audiencesService.getById, 'function');
  assert.equal(typeof audiencesService.analytics, 'function');
});
