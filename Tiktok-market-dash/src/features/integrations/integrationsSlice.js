import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { integrationsService } from '@/services/integrationsService';

const initialState = {
  stores: [],
  selected: null,
  statusPayload: null,
  syncStatus: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

export const fetchIntegrations = createAsyncThunk(
  'integrations/list',
  async (_, { rejectWithValue }) => {
    try {
      return await integrationsService.list();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load integrations.');
    }
  }
);

export const fetchIntegrationStatus = createAsyncThunk(
  'integrations/status',
  async (_, { rejectWithValue }) => {
    try {
      return await integrationsService.status();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load status.');
    }
  }
);

export const connectIntegration = createAsyncThunk(
  'integrations/connect',
  async (payload, { rejectWithValue }) => {
    try {
      return await integrationsService.connect(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to connect store.');
    }
  }
);

export const disconnectIntegration = createAsyncThunk(
  'integrations/disconnect',
  async (id, { rejectWithValue }) => {
    try {
      await integrationsService.disconnect(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to disconnect store.');
    }
  }
);

export const updateIntegration = createAsyncThunk(
  'integrations/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return await integrationsService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update store.');
    }
  }
);

export const syncIntegration = createAsyncThunk(
  'integrations/sync',
  async (id, { rejectWithValue }) => {
    try {
      return await integrationsService.sync(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to sync store.');
    }
  }
);

const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    setSelectedStore(state, action) {
      state.selected = action.payload;
    },
    clearIntegrationsNotice(state) {
      state.notice = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIntegrations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stores = action.payload?.items || [];
        state.selected = state.stores[0] || null;
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchIntegrationStatus.fulfilled, (state, action) => {
        state.statusPayload = action.payload;
        state.stores = action.payload?.stores || state.stores;
        state.selected = action.payload?.primary || state.stores[0] || null;
      })
      .addCase(connectIntegration.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(connectIntegration.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Store connected successfully.';
        const store = action.payload;
        state.stores = [store, ...state.stores.filter((s) => s.id !== store.id)];
        state.selected = store;
      })
      .addCase(connectIntegration.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(disconnectIntegration.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Store disconnected.';
        state.stores = state.stores.filter((s) => s.id !== action.payload);
        if (state.selected?.id === action.payload) {
          state.selected = state.stores[0] || null;
        }
      })
      .addCase(disconnectIntegration.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateIntegration.fulfilled, (state, action) => {
        const store = action.payload;
        state.stores = state.stores.map((s) => (s.id === store.id ? store : s));
        if (state.selected?.id === store.id) state.selected = store;
        state.notice = 'Store updated.';
      })
      .addCase(syncIntegration.pending, (state) => {
        state.actionStatus = 'loading';
        state.syncStatus = { syncing: true };
      })
      .addCase(syncIntegration.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Store synced successfully.';
        const store = action.payload?.integration;
        if (store) {
          state.stores = state.stores.map((s) => (s.id === store.id ? store : s));
          if (state.selected?.id === store.id) state.selected = store;
        }
        state.syncStatus = action.payload?.log || { syncing: false };
      })
      .addCase(syncIntegration.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
        state.syncStatus = { syncing: false };
      });
  },
});

export const { setSelectedStore, clearIntegrationsNotice } = integrationsSlice.actions;
export default integrationsSlice.reducer;
