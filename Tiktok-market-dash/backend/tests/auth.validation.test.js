import test from 'node:test';
import assert from 'node:assert/strict';
import {
  changePasswordValidators,
  loginValidators,
  registerValidators,
  updateMeValidators,
} from '../src/modules/auth/auth.validators.js';

const runValidators = async (validators, body) => {
  const req = { body, query: {}, params: {}, headers: {} };
  for (const validator of validators) {
    // express-validator chains are middleware-like
    // eslint-disable-next-line no-await-in-loop
    await validator.run(req);
  }
  const { validationResult } = await import('express-validator');
  return validationResult(req);
};

test('registerValidators rejects weak passwords', async () => {
  const result = await runValidators(registerValidators, {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'weak',
  });
  assert.equal(result.isEmpty(), false);
  const msgs = result.array().map((e) => e.msg);
  assert.ok(msgs.some((m) => /password/i.test(m)));
});

test('loginValidators requires email and password', async () => {
  const result = await runValidators(loginValidators, {});
  assert.equal(result.isEmpty(), false);
});

test('loginValidators accepts valid payload', async () => {
  const result = await runValidators(loginValidators, {
    email: 'user@example.com',
    password: 'Secret123',
  });
  assert.equal(result.isEmpty(), true);
});

test('updateMeValidators accepts phone', async () => {
  const result = await runValidators(updateMeValidators, {
    fullName: 'Ada Lovelace',
    phone: '+92 300 1234567',
  });
  assert.equal(result.isEmpty(), true);
});

test('changePasswordValidators enforces strength', async () => {
  const result = await runValidators(changePasswordValidators, {
    currentPassword: 'OldPass1',
    newPassword: 'short',
  });
  assert.equal(result.isEmpty(), false);
});
