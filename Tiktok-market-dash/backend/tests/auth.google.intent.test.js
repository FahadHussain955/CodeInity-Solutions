import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveIntent } from '../src/config/passport.js';

test('resolveIntent defaults to login', () => {
  assert.equal(resolveIntent({ query: {} }), 'login');
  assert.equal(resolveIntent({ query: { intent: 'LOGIN' } }), 'login');
});

test('resolveIntent accepts register from state or intent', () => {
  assert.equal(resolveIntent({ query: { state: 'register' } }), 'register');
  assert.equal(resolveIntent({ query: { intent: 'register' } }), 'register');
  assert.equal(resolveIntent({ query: { state: 'login', intent: 'register' } }), 'login');
});
