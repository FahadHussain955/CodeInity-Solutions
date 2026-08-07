import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      typ: 'access',
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      typ: 'refresh',
    },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.jwt.accessSecret);
  if (payload.typ && payload.typ !== 'access') {
    throw new Error('Invalid access token type');
  }
  return payload;
};

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.jwt.refreshSecret);
  if (payload.typ && payload.typ !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }
  return payload;
};

/** Issue both tokens for a signed-in session. */
export const issueAuthTokens = (user) => ({
  token: signAccessToken(user),
  refreshToken: signRefreshToken(user),
});

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.fullName,
  fullName: user.fullName,
  email: user.email,
  avatar: user.avatar,
  provider: user.provider,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
