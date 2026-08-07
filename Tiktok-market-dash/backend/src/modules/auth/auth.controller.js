import { authService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { fullName, name, email, password } = req.body;
    const result = await authService.register({
      fullName: fullName || name,
      email,
      password,
    });
    return ApiResponse.created(res, result, 'Account created successfully');
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result, 'Logged in successfully');
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return ApiResponse.success(res, { user }, 'Current user');
  }),

  logout: asyncHandler(async (_req, res) => {
    // JWT is client-held for MVP; client discards access + refresh tokens.
    return ApiResponse.success(res, null, 'Logged out successfully');
  }),

  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.body?.refreshToken;
    const result = await authService.refreshSession(refreshToken);
    return ApiResponse.success(res, result, 'Token refreshed');
  }),

  googleStart: asyncHandler(async (req, res, next) => {
    if (!env.google.isConfigured) {
      const acceptsHtml = String(req.headers.accept || '').includes('text/html');
      const intent = String(req.query.intent || req.query.state || 'login').toLowerCase();
      const path = intent === 'register' ? '/register' : '/login';
      if (acceptsHtml || req.query.redirect === '1') {
        return res.redirect(`${env.clientUrl}${path}?error=google_not_configured`);
      }
      throw ApiError.badRequest(
        'Google Sign-In is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the backend .env file.'
      );
    }
    next();
  }),

  googleCallbackSuccess: asyncHandler(async (req, res) => {
    const session = req.user; // { user, token?, registered? } from passport strategy
    if (session?.registered && !session?.token) {
      return res.redirect(`${env.clientUrl}/login?registered=1`);
    }
    if (!session?.token) {
      return res.redirect(`${env.clientUrl}/login?error=google_failed`);
    }
    const redirectUrl = new URL('/auth/callback', env.clientUrl);
    redirectUrl.searchParams.set('token', session.token);
    if (session.refreshToken) {
      redirectUrl.searchParams.set('refreshToken', session.refreshToken);
    }
    return res.redirect(redirectUrl.toString());
  }),

  googleCallbackFailure: (_req, res) => {
    res.redirect(`${env.clientUrl}/login?error=google_failed`);
  },
};
