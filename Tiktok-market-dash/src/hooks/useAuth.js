import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  loginUser,
  logout,
  logoutUser,
  registerUser,
  setCredentials,
} from '@/features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, status, error } = useSelector((state) => state.auth);

  const isSubmitting = status === 'loading';

  const login = useCallback(
    async (credentials) => {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        return { ok: true, data: result.payload };
      }
      return { ok: false, error: result.payload || 'Unable to sign in.' };
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload) => {
      const result = await dispatch(registerUser(payload));
      if (registerUser.fulfilled.match(result)) {
        return { ok: true, data: result.payload };
      }
      return { ok: false, error: result.payload || 'Unable to create account.' };
    },
    [dispatch]
  );

  const logoutUserAction = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  /** Direct credential set (e.g. future OAuth callbacks). */
  const applyCredentials = useCallback(
    (credentials) => {
      dispatch(setCredentials(credentials));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    token,
    status,
    error,
    isSubmitting,
    login,
    register,
    logout: logoutUserAction,
    clearError,
    setCredentials: applyCredentials,
    // sync logout without mock delay (navbar / profile)
    logoutSync: () => dispatch(logout()),
  };
};
