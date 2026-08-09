import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller.js';
import {
  changePasswordValidators,
  loginValidators,
  refreshValidators,
  registerValidators,
  updateMeValidators,
} from './auth.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { env } from '../../config/env.js';
import { configurePassport, resolveIntent } from '../../config/passport.js';
import { logger } from '../../utils/logger.js';

configurePassport();

const router = Router();

const googleErrorRedirect = (req, err) => {
  const intent = resolveIntent(req);
  const path = intent === 'register' ? '/register' : '/login';
  let error = 'google_failed';
  if (err?.code === 'NOT_REGISTERED') error = 'not_registered';
  else if (err?.code === 'ALREADY_REGISTERED') error = 'already_registered';
  else if (err?.code === 'BAD_REQUEST') error = 'google_failed';

  if (!env.isProd) {
    logger.warn('[google-oauth] redirecting with error', {
      error,
      intent,
      errCode: err?.code || null,
      errName: err?.name || null,
      errMessage: err?.message || 'no session token',
    });
  }

  return `${env.clientUrl}${path}?error=${error}`;
};

router.post('/register', registerValidators, validateRequest, authController.register);
router.post('/login', loginValidators, validateRequest, authController.login);
router.post('/refresh', refreshValidators, validateRequest, authController.refresh);
router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, updateMeValidators, validateRequest, authController.updateMe);
router.delete('/me', authenticate, authController.deleteMe);
router.post(
  '/change-password',
  authenticate,
  changePasswordValidators,
  validateRequest,
  authController.changePassword
);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

router.get(
  '/google',
  authController.googleStart,
  (req, res, next) => {
    if (!env.google.isConfigured) return next();
    const intent = resolveIntent(req);
    if (!env.isProd) {
      logger.info('[google-oauth] start', { intent });
    }
    return passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
      prompt: 'select_account',
      state: intent,
    })(req, res, next);
  }
);

router.get('/google/callback', (req, res, next) => {
  if (!env.google.isConfigured) {
    return res.redirect(`${env.clientUrl}/login?error=google_not_configured`);
  }

  if (!env.isProd) {
    logger.info('[google-oauth] callback reached', {
      hasCode: Boolean(req.query.code),
      hasError: Boolean(req.query.error),
      state: req.query.state || null,
    });
  }

  // User dismissed Google consent — return to auth screen without a hard error.
  if (String(req.query.error || '') === 'access_denied') {
    const intent = resolveIntent(req);
    const path = intent === 'register' ? '/register' : '/login';
    return res.redirect(`${env.clientUrl}${path}`);
  }

  passport.authenticate('google', { session: false }, (err, session) => {
    if (err) {
      return res.redirect(googleErrorRedirect(req, err));
    }
    if (!session?.token) {
      return res.redirect(googleErrorRedirect(req, err));
    }
    req.user = session;
    return next();
  })(req, res, next);
}, authController.googleCallbackSuccess);

export default router;
