import { authService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const requestMeta = (req) => ({
  ip: req.ip || req.headers['x-forwarded-for'] || null,
  userAgent: req.headers['user-agent'] || null,
});

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
    const result = await authService.login(req.body, requestMeta(req));
    return ApiResponse.success(res, result, 'Logged in successfully');
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return ApiResponse.success(res, { user }, 'Current user');
  }),

  updateMe: asyncHandler(async (req, res) => {
    const user = await authService.updateMe(req.user.id, req.body);
    return ApiResponse.success(res, { user }, 'Profile updated');
  }),

  changePassword: asyncHandler(async (req, res) => {
    const data = await authService.changePassword(req.user.id, req.body);
    return ApiResponse.success(res, data, 'Password changed');
  }),

  logout: asyncHandler(async (_req, res) => {
    // JWT is client-held for MVP; client discards access + refresh tokens.
    return ApiResponse.success(res, null, 'Logged out successfully');
  }),

  logoutAll: asyncHandler(async (req, res) => {
    const data = await authService.logoutAll(req.user.id);
    return ApiResponse.success(res, data, 'Logged out of all sessions');
  }),

  deleteMe: asyncHandler(async (req, res) => {
    const data = await authService.softDeleteMe(req.user.id);
    return ApiResponse.success(res, data, 'Account deleted');
  }),

  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.body?.refreshToken;
    const result = await authService.refreshSession(refreshToken, requestMeta(req));
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
    const session = req.user; // { user, token, refreshToken? } from passport strategy
    if (!session?.token) {
      return res.redirect(`${env.clientUrl}/login?error=google_failed`);
    }
    const redirectUrl = new URL('/auth/callback', env.clientUrl);
    // Prefer hash fragment so tokens are not sent as query params (Referer / server logs).
    const hash = new URLSearchParams({ token: session.token });
    if (session.refreshToken) hash.set('refreshToken', session.refreshToken);
    redirectUrl.hash = hash.toString();
    if (!env.isProd) {
      // Log destination path only — never tokens.
      console.log('[google-oauth] redirect to SPA callback', {
        path: '/auth/callback',
        hasToken: true,
        hasRefresh: Boolean(session.refreshToken),
      });
    }
    return res.redirect(redirectUrl.toString());
  }),

  googleCallbackFailure: (_req, res) => {
    res.redirect(`${env.clientUrl}/login?error=google_failed`);
  },
};
