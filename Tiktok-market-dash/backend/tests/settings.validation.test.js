import test from 'node:test';
import assert from 'node:assert/strict';
import {
  updateNotificationValidators,
  updateStoreValidators,
} from '../src/modules/settings/settings.validators.js';

const runValidators = async (validators, body) => {
  const req = { body, query: {}, params: {}, headers: {} };
  for (const validator of validators) {
    // eslint-disable-next-line no-await-in-loop
    await validator.run(req);
  }
  const { validationResult } = await import('express-validator');
  return validationResult(req);
};

test('updateStoreValidators accepts store payload', async () => {
  const result = await runValidators(updateStoreValidators, {
    storeName: 'Nexora Shop',
    currency: 'USD',
    timezone: 'Asia/Karachi',
    contactEmail: 'ops@nexora.test',
  });
  assert.equal(result.isEmpty(), true);
});

test('updateStoreValidators rejects invalid email', async () => {
  const result = await runValidators(updateStoreValidators, {
    contactEmail: 'not-an-email',
  });
  assert.equal(result.isEmpty(), false);
});

test('updateNotificationValidators accepts preference booleans', async () => {
  const result = await runValidators(updateNotificationValidators, {
    email: true,
    orders: false,
    inventory: true,
    campaign: true,
    ai: false,
  });
  assert.equal(result.isEmpty(), true);
});
