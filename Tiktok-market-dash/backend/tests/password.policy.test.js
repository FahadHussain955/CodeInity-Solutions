import test from 'node:test';
import assert from 'node:assert/strict';
import {
  changePasswordValidators,
  registerValidators,
} from '../src/modules/auth/auth.validators.js';
import { isStrongPassword } from '../src/utils/passwordPolicy.js';

const runValidators = async (validators, body) => {
  const req = { body, query: {}, params: {}, headers: {} };
  for (const validator of validators) {
    // eslint-disable-next-line no-await-in-loop
    await validator.run(req);
  }
  const { validationResult } = await import('express-validator');
  return validationResult(req);
};

test('isStrongPassword requires special character', () => {
  assert.equal(isStrongPassword('password'), false);
  assert.equal(isStrongPassword('PASSWORD123'), false);
  assert.equal(isStrongPassword('Password'), false);
  assert.equal(isStrongPassword('Password123'), false);
  assert.equal(isStrongPassword('Password123!'), true);
});

test('registerValidators rejects Password123 without special char', async () => {
  const result = await runValidators(registerValidators, {
    fullName: 'Test User',
    email: 'strong-policy@example.com',
    password: 'Password123',
  });
  assert.equal(result.isEmpty(), false);
  const msgs = result.array().map((e) => e.msg);
  assert.ok(msgs.some((m) => /special/i.test(m)));
});

test('registerValidators accepts Password123!', async () => {
  const result = await runValidators(registerValidators, {
    fullName: 'Test User',
    email: 'strong-ok@example.com',
    password: 'Password123!',
  });
  assert.equal(result.isEmpty(), true);
});

test('changePasswordValidators rejects Password123', async () => {
  const result = await runValidators(changePasswordValidators, {
    currentPassword: 'OldPass1!',
    newPassword: 'Password123',
  });
  assert.equal(result.isEmpty(), false);
});

test('changePasswordValidators accepts Password123!', async () => {
  const result = await runValidators(changePasswordValidators, {
    currentPassword: 'OldPass1!',
    newPassword: 'Password123!',
  });
  assert.equal(result.isEmpty(), true);
});
