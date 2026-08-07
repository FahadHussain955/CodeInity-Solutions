import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller.js';
import { loginValidators, registerValidators } from './auth.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { env } from '../../config/env.js';
import { configurePassport, resolveIntent } from '../../config/passport.js';

configurePassport();

const router = Router();

const googleErrorRedirect = (req, err) => {
  const intent = resolveIntent(req);
  const path = intent === 'register' ? '/register' : '/login';
  let error = 'google_failed';
  if (err?.code === 'NOT_REGISTERED') error = 'not_registered';
  else if (err?.code === 'ALREADY_REGISTERED') error = 'already_registered';
  else if (err?.code === 'BAD_REQUEST') error = 'google_failed';
  return `${env.clientUrl}${path}?error=${error}`;
};

router.post('/register', registerValidators, validateRequest, authController.register);
router.post('/login', loginValidators, validateRequest, authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

router.get(
  '/google',
  authController.googleStart,
  (req, res, next) => {
    if (!env.google.isConfigured) return next();
    const intent = resolveIntent(req);
    return passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
      prompt: 'select_account',
      // Echoed back on callback as ?state= so we know login vs register
      state: intent,
    })(req, res, next);
  }
);

router.get('/google/callback', (req, res, next) => {
  if (!env.google.isConfigured) {
    return res.redirect(`${env.clientUrl}/login?error=google_not_configured`);
  }

  passport.authenticate('google', { session: false }, (err, session) => {
    if (err) {
      return res.redirect(googleErrorRedirect(req, err));
    }
    // Google sign-up creates the account then sends user to login (no JWT yet)
    if (session?.registered && !session?.token) {
      req.user = session;
      return next();
    }
    if (!session?.token) {
      return res.redirect(googleErrorRedirect(req, err));
    }
    req.user = session;
    return next();
  })(req, res, next);
}, authController.googleCallbackSuccess);

export default router;
