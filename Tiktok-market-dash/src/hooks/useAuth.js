import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  fetchCurrentUser,
  loginUser,
  logout,
  logoutUser,
  registerUser,
  restoreSession,
  setCredentials,
} from '@/features/auth/authSlice';
import { authService } from '@/services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, status, error, initializing } = useSelector(
    (state) => state.auth
  );

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

  const applyCredentials = useCallback(
    (credentials) => {
      dispatch(setCredentials(credentials));
    },
    [dispatch]
  );

  const refreshUser = useCallback(async () => {
    const result = await dispatch(fetchCurrentUser());
    return fetchCurrentUser.fulfilled.match(result);
  }, [dispatch]);

  const restore = useCallback(async () => {
    const result = await dispatch(restoreSession());
    return restoreSession.fulfilled.match(result);
  }, [dispatch]);

  const loginWithGoogle = useCallback(() => {
    authService.startGoogleLogin();
  }, []);

  const registerWithGoogle = useCallback(() => {
    authService.startGoogleRegister();
  }, []);

  return {
    user,
    isAuthenticated,
    token,
    status,
    error,
    isSubmitting,
    initializing,
    login,
    register,
    logout: logoutUserAction,
    clearError,
    setCredentials: applyCredentials,
    refreshUser,
    restoreSession: restore,
    loginWithGoogle,
    registerWithGoogle,
    logoutSync: () => dispatch(logout()),
  };
};
