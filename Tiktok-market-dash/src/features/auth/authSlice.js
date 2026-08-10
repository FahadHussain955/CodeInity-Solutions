import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';
import { AUTH_ACTIVITY_KEY, AUTH_STORAGE_KEY } from '@/constants/auth';
import { beginIntentionalLogout } from '@/lib/sessionBridge';

export { AUTH_STORAGE_KEY };

const loadPersistedAuth = () => {
  const persisted = storage.get(AUTH_STORAGE_KEY);
  if (!persisted?.token) {
    return { user: null, token: null, refreshToken: null, isAuthenticated: false };
  }
  return {
    user: persisted.user || null,
    token: persisted.token,
    refreshToken: persisted.refreshToken || null,
    isAuthenticated: Boolean(persisted.token),
  };
};

const persistAuth = (user, token, refreshToken) => {
  storage.set(AUTH_STORAGE_KEY, { user, token, refreshToken: refreshToken || null });
};

const clearPersistedAuth = () => {
  storage.remove(AUTH_STORAGE_KEY);
  try {
    sessionStorage.removeItem(AUTH_ACTIVITY_KEY);
  } catch {
    /* ignore */
  }
};

const touchActivity = () => {
  try {
    sessionStorage.setItem(AUTH_ACTIVITY_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
};

const persisted = loadPersistedAuth();

const initialState = {
  user: persisted.user,
  token: persisted.token,
  refreshToken: persisted.refreshToken,
  isAuthenticated: persisted.isAuthenticated,
  status: 'idle',
  error: null,
  initializing: Boolean(persisted.token),
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to sign in. Please try again.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.register(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create account. Please try again.');
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    const { refreshToken } = getState().auth;
    if (!refreshToken) {
      return rejectWithValue('No refresh token.');
    }
    try {
      return await authService.refresh(refreshToken);
    } catch (error) {
      return rejectWithValue(error.message || 'Session expired.');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getMe();
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Session expired.');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { getState, rejectWithValue }) => {
    const { token, refreshToken } = getState().auth;
    if (!token && !refreshToken) return null;

    try {
      if (token) {
        const user = await authService.getMe();
        return { user, token, refreshToken };
      }
    } catch {
      /* try refresh below */
    }

    if (!refreshToken) {
      clearPersistedAuth();
      return rejectWithValue('Session expired.');
    }

    try {
      const session = await authService.refresh(refreshToken);
      return session;
    } catch (error) {
      clearPersistedAuth();
      return rejectWithValue(error.message || 'Session expired.');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  beginIntentionalLogout();
  try {
    // Call while tokens are still present so the server can revoke the session.
    await authService.logout();
  } catch {
    /* still clear local session in fulfilled */
  }
  return true;
});

const applyCredentials = (state, { user, token, refreshToken }) => {
  state.user = user;
  state.token = token;
  state.refreshToken = refreshToken || state.refreshToken || null;
  state.isAuthenticated = true;
  state.status = 'succeeded';
  state.error = null;
  state.initializing = false;
  persistAuth(user, token, state.refreshToken);
  touchActivity();
};

const clearSessionState = (state) => {
  state.user = null;
  state.token = null;
  state.refreshToken = null;
  state.isAuthenticated = false;
  state.initializing = false;
  clearPersistedAuth();
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      applyCredentials(state, action.payload);
    },
    clearAuthError: (state) => {
      state.error = null;
      if (state.status === 'failed') state.status = 'idle';
    },
    logout: (state) => {
      // Used by session-expiry / idle handlers — do NOT mark intentional Sign Out.
      state.status = 'idle';
      state.error = null;
      clearSessionState(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        applyCredentials(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to sign in. Please try again.';
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
        clearSessionState(state);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to create account. Please try again.';
        state.isAuthenticated = false;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        applyCredentials(state, action.payload);
      })
      .addCase(refreshSession.rejected, (state) => {
        state.status = 'idle';
        state.error = null;
        clearSessionState(state);
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
        if (state.token) persistAuth(action.payload, state.token, state.refreshToken);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        clearSessionState(state);
      })
      .addCase(restoreSession.pending, (state) => {
        state.initializing = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload?.user && action.payload?.token) {
          applyCredentials(state, action.payload);
        } else if (!state.token) {
          state.isAuthenticated = false;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'idle';
        clearSessionState(state);
      })
      .addCase(logoutUser.pending, (state) => {
        beginIntentionalLogout();
        state.status = 'idle';
        state.error = null;
        // Keep tokens until the logout request completes (see thunk body).
      })
      .addCase(logoutUser.fulfilled, (state) => {
        clearSessionState(state);
      })
      .addCase(logoutUser.rejected, (state) => {
        clearSessionState(state);
      });
  },
});

export const { setCredentials, clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
