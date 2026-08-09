import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { isStrongPassword, PASSWORD_POLICY_MESSAGES } from '../../utils/passwordPolicy.js';
import { issueAuthTokens, toPublicUser, verifyRefreshToken } from '../../utils/jwt.js';
import { logActivity } from '../../utils/activity.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 12;

const hashToken = (token) => createHash('sha256').update(String(token)).digest('hex');

const parseDurationMs = (value, fallbackMs) => {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackMs;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] || 1000;
  return n * mult;
};

const assertActiveUser = (user) => {
  if (!user || user.deletedAt) {
    throw ApiError.unauthorized('User not found.');
  }
  return user;
};

const createRefreshSession = async (userId, refreshToken, meta = {}) => {
  const expiresAt = new Date(
    Date.now() + parseDurationMs(env.jwt.refreshExpiresIn, 7 * 24 * 60 * 60 * 1000)
  );
  return prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      userAgent: meta.userAgent || null,
      ip: meta.ip || null,
      expiresAt,
      lastSeenAt: new Date(),
    },
  });
};

const sessionPayload = async (user, meta = {}) => {
  const tokens = issueAuthTokens(user);
  try {
    await createRefreshSession(user.id, tokens.refreshToken, meta);
  } catch {
    // Non-fatal if session table unavailable mid-deploy
  }
  return {
    user: toPublicUser(user),
    ...tokens,
  };
};

const writeLoginHistory = async (userId, meta = {}, success = true) => {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ip: meta.ip || null,
        userAgent: meta.userAgent || null,
        success,
      },
    });
  } catch {
    // ignore
  }
};

export const authService = {
  async register({ fullName, email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing && !existing.deletedAt) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = existing?.deletedAt
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            fullName: String(fullName).trim(),
            password: hashed,
            provider: 'local',
            deletedAt: null,
            isEmailVerified: false,
          },
        })
      : await prisma.user.create({
          data: {
            fullName: String(fullName).trim(),
            email: normalizedEmail,
            password: hashed,
            provider: 'local',
            isEmailVerified: false,
          },
        });

    await logActivity({
      userId: user.id,
      action: 'auth.register',
      entity: 'User',
      entityId: user.id,
      message: 'Account created',
      icon: 'person_add',
    });

    return { user: toPublicUser(user) };
  },

  async login({ email, password }, meta = {}) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || user.deletedAt || !user.password) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      await writeLoginHistory(user.id, meta, false);
      throw ApiError.unauthorized('Invalid email or password.');
    }

    await writeLoginHistory(user.id, meta, true);
    await logActivity({
      userId: user.id,
      action: 'auth.login',
      entity: 'User',
      entityId: user.id,
      message: 'Signed in',
      icon: 'login',
    });

    return sessionPayload(user, meta);
  },

  async refreshSession(refreshToken, meta = {}) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required.');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token.');
    }

    const tokenHash = hashToken(refreshToken);
    const session = await prisma.refreshSession.findUnique({ where: { tokenHash } });
    if (session) {
      if (session.revokedAt || session.expiresAt < new Date()) {
        throw ApiError.unauthorized('Refresh session revoked or expired.');
      }
      await prisma.refreshSession.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
          lastSeenAt: new Date(),
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    assertActiveUser(user);

    return sessionPayload(user, meta);
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    assertActiveUser(user);
    return toPublicUser(user);
  },

  async updateMe(userId, payload = {}) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    assertActiveUser(user);

    const data = {};
    if (payload.fullName !== undefined || payload.name !== undefined) {
      data.fullName = String(payload.fullName || payload.name || '').trim();
      if (!data.fullName) throw ApiError.badRequest('fullName is required.');
    }
    if (payload.phone !== undefined) {
      data.phone = payload.phone ? String(payload.phone).trim() : null;
    }
    if (payload.email !== undefined) {
      const email = String(payload.email).trim().toLowerCase();
      if (!email) throw ApiError.badRequest('email is required.');
      if (email !== user.email) {
        const clash = await prisma.user.findUnique({ where: { email } });
        if (clash && clash.id !== userId && !clash.deletedAt) {
          throw ApiError.conflict('An account with this email already exists.');
        }
        data.email = email;
        data.isEmailVerified = false;
      }
    }

    if (Object.keys(data).length === 0) {
      throw ApiError.badRequest('No profile fields to update.');
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });
    await logActivity({
      userId,
      action: 'user.profile_updated',
      entity: 'User',
      entityId: userId,
      message: 'Profile updated',
      icon: 'manage_accounts',
    });
    return toPublicUser(updated);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    assertActiveUser(user);

    if (!user.password) {
      throw ApiError.badRequest('Password change is not available for social login accounts.');
    }
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('currentPassword and newPassword are required.');
    }
    if (!isStrongPassword(newPassword)) {
      throw ApiError.badRequest(
        `${PASSWORD_POLICY_MESSAGES.min}. ${PASSWORD_POLICY_MESSAGES.upper}, ${PASSWORD_POLICY_MESSAGES.lower}, ${PASSWORD_POLICY_MESSAGES.number}, and ${PASSWORD_POLICY_MESSAGES.special}.`
      );
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      throw ApiError.unauthorized('Current password is incorrect.');
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    await prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await logActivity({
      userId,
      action: 'auth.password_changed',
      entity: 'User',
      entityId: userId,
      message: 'Password changed',
      icon: 'lock',
    });

    return { changed: true };
  },

  async logoutAll(userId) {
    const result = await prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await logActivity({
      userId,
      action: 'auth.logout_all',
      entity: 'User',
      entityId: userId,
      message: 'Signed out of all sessions',
      icon: 'logout',
    });

    return { revoked: result.count };
  },

  async softDeleteMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    assertActiveUser(user);

    await prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await logActivity({
      userId,
      action: 'user.deleted',
      entity: 'User',
      entityId: userId,
      message: 'Account deleted',
      icon: 'person_off',
    });

    return { deleted: true, deletedAt: updated.deletedAt };
  },

  /**
   * Google OAuth — intent controls create vs sign-in only.
   * - register: create Google user (reject if email already exists), then issue JWT
   * - login: require existing DB user; never auto-create
   * Both successful paths return access + refresh tokens (same as password login).
   */
  async handleGoogleAuth(profile, intent = 'login', meta = {}) {
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

    if (user?.deletedAt) {
      if (mode === 'register') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            fullName,
            avatar,
            provider: 'google',
            providerId,
            deletedAt: null,
            isEmailVerified: true,
            password: null,
          },
        });
        await writeLoginHistory(user.id, meta, true);
        return sessionPayload(user, meta);
      }
      throw new ApiError(401, 'No account found for this Google email. Please sign up first.', [], 'NOT_REGISTERED');
    }

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

      await writeLoginHistory(user.id, meta, true);
      await logActivity({
        userId: user.id,
        action: 'user.registered',
        entity: 'User',
        entityId: user.id,
        message: 'Registered with Google',
        icon: 'person_add',
      });
      return sessionPayload(user, meta);
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

    await writeLoginHistory(user.id, meta, true);
    return sessionPayload(user, meta);
  },

  async loginWithGoogleProfile(profile, meta = {}) {
    return this.handleGoogleAuth(profile, 'login', meta);
  },
};
