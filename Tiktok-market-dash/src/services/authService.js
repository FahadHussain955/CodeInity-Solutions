import { storage } from '@/utils/storage';

const MOCK_DELAY_MS = 900;
const USERS_KEY = 'nexora_mock_users';

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const createToken = () =>
  `nexora_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;

const createId = () =>
  `usr_${Math.random().toString(36).slice(2, 10)}`;

const seedUsers = () => {
  const existing = storage.get(USERS_KEY);
  if (Array.isArray(existing) && existing.length > 0) return existing;

  const seeded = [
    {
      id: 'usr_demo',
      name: 'Enterprise User',
      email: 'demo@nexora.com',
      password: 'Demo1234!',
      createdAt: new Date().toISOString(),
    },
  ];
  storage.set(USERS_KEY, seeded);
  return seeded;
};

const getUsers = () => seedUsers();

const saveUsers = (users) => storage.set(USERS_KEY, users);

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export class AuthApiError extends Error {
  constructor(message, { code = 'AUTH_ERROR', status = 400 } = {}) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Auth service — mock today, swap internals for real HTTP later.
 * Keep method signatures stable so pages/hooks stay unchanged.
 */
export const authService = {
  async login({ email, password }) {
    await delay();

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = getUsers().find((entry) => entry.email.toLowerCase() === normalizedEmail);

    if (!user || user.password !== password) {
      throw new AuthApiError('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
        status: 401,
      });
    }

    return {
      user: toPublicUser(user),
      token: createToken(),
    };
  },

  async register({ name, email, password }) {
    await delay();

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const users = getUsers();

    if (users.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
      throw new AuthApiError('An account with this email already exists.', {
        code: 'EMAIL_TAKEN',
        status: 409,
      });
    }

    const user = {
      id: createId(),
      name: String(name || '').trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, user]);

    return {
      user: toPublicUser(user),
      token: createToken(),
    };
  },

  async logout() {
    await delay(200);
    return { success: true };
  },
};
