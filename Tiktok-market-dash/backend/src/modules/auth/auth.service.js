import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { issueAuthTokens, toPublicUser, verifyRefreshToken } from '../../utils/jwt.js';

const SALT_ROUNDS = 12;

const sessionPayload = (user) => ({
  user: toPublicUser(user),
  ...issueAuthTokens(user),
});

export const authService = {
  async register({ fullName, email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: String(fullName).trim(),
        email: normalizedEmail,
        password: hashed,
        provider: 'local',
        isEmailVerified: false,
      },
    });

    // Account created — caller must sign in separately (no auto-login token)
    return { user: toPublicUser(user) };
  },

  async login({ email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.password) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    return sessionPayload(user);
  },

  async refreshSession(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required.');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw ApiError.unauthorized('User not found.');
    }

    return sessionPayload(user);
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.unauthorized('User not found.');
    }
    return toPublicUser(user);
  },

  /**
   * Google OAuth — intent controls create vs sign-in only.
   * - register: create Google user in DB (reject if email already exists)
   * - login: require existing DB user; never auto-create
   */
  async handleGoogleAuth(profile, intent = 'login') {
    const providerId = profile.id;
    const email = (profile.emails?.[0]?.value || '').toLowerCase().trim();
    const fullName = profile.displayName || email.split('@')[0] || 'Google User';
    const avatar = profile.photos?.[0]?.value || null;
    const mode = intent === 'register' ? 'register' : 'login';

    if (!email) {
      throw ApiError.badRequest('Google account did not provide an email address.');
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'google', providerId },
          { email },
        ],
      },
    });

    if (mode === 'register') {
      if (user) {
        throw new ApiError(
          409,
          'An account with this email already exists. Please sign in instead.',
          [],
          'ALREADY_REGISTERED'
        );
      }

      user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: null,
          avatar,
          provider: 'google',
          providerId,
          isEmailVerified: true,
        },
      });

      return { user: toPublicUser(user), token: null, refreshToken: null, registered: true };
    }

    if (!user) {
      throw new ApiError(
        401,
        'No account found for this Google email. Please sign up first.',
        [],
        'NOT_REGISTERED'
      );
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: user.fullName || fullName,
        avatar: avatar || user.avatar,
        provider: user.provider === 'local' ? 'local' : 'google',
        providerId: user.providerId || providerId,
        isEmailVerified: true,
      },
    });

    return sessionPayload(user);
  },

  async loginWithGoogleProfile(profile) {
    return this.handleGoogleAuth(profile, 'login');
  },
};
