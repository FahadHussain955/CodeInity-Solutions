import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * JWT auth middleware — requires Authorization: Bearer <access token>.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required');
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub || payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

/** Optional auth — attaches user when token is valid; otherwise continues. */
export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice(7).trim();
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub || payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // Ignore invalid optional tokens
  }

  next();
});
