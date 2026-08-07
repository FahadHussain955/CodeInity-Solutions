import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';
import { storage } from '@/utils/storage';
import { AUTH_STORAGE_KEY } from '@/features/auth/authSlice';

export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => Promise.reject(error)
);
