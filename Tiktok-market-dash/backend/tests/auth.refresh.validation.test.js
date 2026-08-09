import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshValidators } from '../src/modules/auth/auth.validators.js';

const runValidators = async (validators, body) => {
  const req = { body, query: {}, params: {}, headers: {} };
  for (const validator of validators) {
    // eslint-disable-next-line no-await-in-loop
    await validator.run(req);
  }
  const { validationResult } = await import('express-validator');
  return validationResult(req);
};

test('refreshValidators requires refreshToken', async () => {
  const result = await runValidators(refreshValidators, {});
  assert.equal(result.isEmpty(), false);
});

test('refreshValidators accepts token string', async () => {
  const result = await runValidators(refreshValidators, {
    refreshToken: 'opaque-refresh-token',
  });
  assert.equal(result.isEmpty(), true);
});
