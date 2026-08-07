import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../config/env.js';
import { authService } from '../modules/auth/auth.service.js';

let googleStrategyRegistered = false;

const resolveIntent = (req) => {
  const raw = String(req.query?.state || req.query?.intent || 'login').toLowerCase();
  return raw === 'register' ? 'register' : 'login';
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
          const session = await authService.handleGoogleAuth(profile, intent);
          return done(null, session);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  googleStrategyRegistered = true;
  return passport;
};

export { passport, resolveIntent };
