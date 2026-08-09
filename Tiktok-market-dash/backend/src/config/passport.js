import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../config/env.js';
import { authService } from '../modules/auth/auth.service.js';
import { logger } from '../utils/logger.js';

let googleStrategyRegistered = false;

const resolveIntent = (req) => {
  const raw = String(req.query?.state || req.query?.intent || 'login').toLowerCase();
  return raw === 'register' ? 'register' : 'login';
};

const safeGoogleDebug = (message, details = {}) => {
  if (env.isProd) return;
  logger.info(`[google-oauth] ${message}`, details);
};

export const configurePassport = () => {
  if (googleStrategyRegistered) return passport;
  if (!env.google.isConfigured) {
    console.warn('⚠ Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
        passReqToCallback: true,
      },
      async (req, _accessToken, _refreshToken, profile, done) => {
        try {
          const intent = resolveIntent(req);
          const emailPresent = Boolean(profile?.emails?.[0]?.value);
          safeGoogleDebug('profile received', {
            intent,
            hasProfileId: Boolean(profile?.id),
            hasEmail: emailPresent,
            hasDisplayName: Boolean(profile?.displayName),
            hasPhoto: Boolean(profile?.photos?.[0]?.value),
          });

          const meta = {
            ip: req.ip || req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
          };
          const session = await authService.handleGoogleAuth(profile, intent, meta);
          safeGoogleDebug('handleGoogleAuth ok', {
            intent,
            hasToken: Boolean(session?.token),
            hasRefresh: Boolean(session?.refreshToken),
            userId: session?.user?.id ? 'present' : 'missing',
          });
          return done(null, session);
        } catch (error) {
          safeGoogleDebug('handleGoogleAuth failed', {
            code: error?.code || 'UNKNOWN',
            message: error?.message || 'unknown',
          });
          return done(error, null);
        }
      }
    )
  );

  googleStrategyRegistered = true;
  return passport;
};

export { passport, resolveIntent };
