import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';
import { storage } from '@/utils/storage';
import { AUTH_STORAGE_KEY } from '@/constants/auth';
import { isIntentionalLogout, notifySessionInvalid } from '@/lib/sessionBridge';

export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const auth = storage.get(AUTH_STORAGE_KEY);
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

const isAuthLogoutRequest = (config) => {
  const url = String(config?.url || '');
  return url.includes('/auth/logout');
};

const clearSessionLocally = () => {
  // Intentional Sign Out clears auth itself — do not treat that as expiry.
  if (isIntentionalLogout()) {
    storage.remove(AUTH_STORAGE_KEY);
    return;
  }
  storage.remove(AUTH_STORAGE_KEY);
  notifySessionInvalid('expired');
};

const refreshAccessToken = async () => {
  const auth = storage.get(AUTH_STORAGE_KEY);
  if (!auth?.refreshToken) {
    throw new Error('No refresh token');
  }
  const response = await axiosPublic.post('/auth/refresh', {
    refreshToken: auth.refreshToken,
  });
  const payload = response?.data?.data;
  if (!payload?.token) {
    throw new Error('Invalid refresh response');
  }
  storage.set(AUTH_STORAGE_KEY, {
    user: payload.user || auth.user,
    token: payload.token,
    refreshToken: payload.refreshToken || auth.refreshToken,
  });
  return payload;
};

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status !== 401 || !original || original._retry) {
      if (status === 401) {
        // Logout endpoints often return 401 after local token wipe — ignore for session UX.
        if (!isAuthLogoutRequest(original) && !isIntentionalLogout()) {
          clearSessionLocally();
        }
      }
      return Promise.reject(error);
    }

    // Don't attempt refresh / expiry redirect during intentional logout.
    if (isIntentionalLogout() || isAuthLogoutRequest(original)) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const payload = await refreshPromise;
      original.headers.Authorization = `Bearer ${payload.token}`;
      return axiosPrivate(original);
    } catch {
      clearSessionLocally();
      return Promise.reject(error);
    }
  }
);

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
