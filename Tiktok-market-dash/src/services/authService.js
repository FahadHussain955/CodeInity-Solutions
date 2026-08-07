import { axiosPublic, axiosPrivate } from '@/lib/axios';
import { API_BASE_URL } from '@/constants/config';

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.code === 'DB_UNAVAILABLE') {
    return 'Database is offline. Start PostgreSQL, run migrations, then try again.';
  }
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) return data.errors[0].message;
  if (!error?.response) {
    return 'Cannot reach the API. Make sure the backend is running on port 5000.';
  }
  return error?.message || fallback;
};

export class AuthApiError extends Error {
  constructor(message, { code = 'AUTH_ERROR', status = 400, errors = [] } = {}) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

const unwrapAuthPayload = (response) => {
  const payload = response?.data?.data;
  if (!payload?.token || !payload?.user) {
    throw new AuthApiError('Unexpected auth response from server.', { status: 500 });
  }
  return {
    user: payload.user,
    token: payload.token,
    refreshToken: payload.refreshToken || null,
  };
};

/**
 * Real HTTP auth service — talks to Nexora backend `/api/v1/auth/*`.
 */
export const authService = {
  async login({ email, password }) {
    try {
      const response = await axiosPublic.post('/auth/login', { email, password });
      return unwrapAuthPayload(response);
    } catch (error) {
      throw new AuthApiError(getErrorMessage(error, 'Unable to sign in.'), {
        code: error?.response?.data?.code || 'LOGIN_FAILED',
        status: error?.response?.status || 400,
        errors: error?.response?.data?.errors || [],
      });
    }
  },

  async register({ name, fullName, email, password }) {
    try {
      const response = await axiosPublic.post('/auth/register', {
        fullName: fullName || name,
        email,
        password,
      });
      const user = response?.data?.data?.user;
      if (!user) {
        throw new AuthApiError('Unexpected register response from server.', { status: 500 });
      }
      return { user };
    } catch (error) {
      throw new AuthApiError(getErrorMessage(error, 'Unable to create account.'), {
        code: error?.response?.data?.code || 'REGISTER_FAILED',
        status: error?.response?.status || 400,
        errors: error?.response?.data?.errors || [],
      });
    }
  },

  async refresh(refreshToken) {
    try {
      const response = await axiosPublic.post('/auth/refresh', { refreshToken });
      return unwrapAuthPayload(response);
    } catch (error) {
      throw new AuthApiError(getErrorMessage(error, 'Session expired. Please sign in again.'), {
        code: error?.response?.data?.code || 'REFRESH_FAILED',
        status: error?.response?.status || 401,
      });
    }
  },

  async getMe() {
    try {
      const response = await axiosPrivate.get('/auth/me');
      const user = response?.data?.data?.user;
      if (!user) {
        throw new AuthApiError('Unable to load current user.', { status: 401 });
      }
      return user;
    } catch (error) {
      throw new AuthApiError(getErrorMessage(error, 'Session expired. Please sign in again.'), {
        code: error?.response?.data?.code || 'SESSION_INVALID',
        status: error?.response?.status || 401,
      });
    }
  },

  async logout() {
    try {
      await axiosPrivate.post('/auth/logout');
    } catch {
      /* client still clears local session */
    }
    return { success: true };
  },

  getGoogleAuthUrl(intent = 'login') {
    const base = API_BASE_URL.replace(/\/$/, '');
    const mode = intent === 'register' ? 'register' : 'login';
    return `${base}/auth/google?redirect=1&intent=${mode}`;
  },

  startGoogleLogin() {
    window.location.assign(this.getGoogleAuthUrl('login'));
  },

  startGoogleRegister() {
    window.location.assign(this.getGoogleAuthUrl('register'));
  },
};
