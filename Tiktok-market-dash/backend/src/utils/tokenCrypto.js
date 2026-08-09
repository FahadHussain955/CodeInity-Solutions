import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGO = 'aes-256-gcm';

const getKey = () => {
  const secret = env.jwt.accessSecret || 'dev_jwt_secret_change_me_min_32_chars';
  return crypto.createHash('sha256').update(secret).digest();
};

/** Encrypt sensitive tokens at rest. Returns null for empty input. */
export const encryptSecret = (plain) => {
  if (!plain) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptSecret = (payload) => {
  if (!payload) return null;
  const [ivHex, tagHex, dataHex] = String(payload).split(':');
  if (!ivHex || !tagHex || !dataHex) return null;
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};
