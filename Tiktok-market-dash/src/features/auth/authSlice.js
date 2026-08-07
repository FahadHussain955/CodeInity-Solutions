import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';

export const AUTH_STORAGE_KEY = 'nexora_auth';

const loadPersistedAuth = () => {
  const persisted = storage.get(AUTH_STORAGE_KEY);
  if (!persisted?.token || !persisted?.user) {
    return { user: null, token: null, isAuthenticated: false };
  }
  return {
    user: persisted.user,
    token: persisted.token,
    isAuthenticated: true,
  };
};

const persistAuth = (user, token) => {
  storage.set(AUTH_STORAGE_KEY, { user, token });
};

const clearPersistedAuth = () => {
  storage.remove(AUTH_STORAGE_KEY);
};

const persisted = loadPersistedAuth();

const initialState = {
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: persisted.isAuthenticated,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
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

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch {
    /* still clear local session */
  }
  return true;
});

const applyCredentials = (state, { user, token }) => {
  state.user = user;
  state.token = token;
  state.isAuthenticated = true;
  state.status = 'succeeded';
  state.error = null;
  persistAuth(user, token);
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
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      clearPersistedAuth();
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
      .addCase(registerUser.fulfilled, (state, action) => {
        applyCredentials(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to create account. Please try again.';
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        clearPersistedAuth();
      })
      .addCase(logoutUser.fulfilled, () => {
        /* session already cleared in pending */
      });
  },
});

export const { setCredentials, clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
