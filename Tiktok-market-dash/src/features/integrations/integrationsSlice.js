import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { integrationsService } from '@/services/integrationsService';
import { ALL_SHOPS, persistShopId, readPersistedShopId } from '@/utils/shopQuery';

const initialState = {
  stores: [],
  selected: null,
  /** 'all' or a StoreIntegration id */
  selectedShopId: ALL_SHOPS,
  statusPayload: null,
  syncStatus: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

const pickSelectedStore = (stores, selectedShopId) => {
  if (!selectedShopId || selectedShopId === ALL_SHOPS) return null;
  return stores.find((s) => s.id === selectedShopId) || null;
};

const reconcileSelection = (state, userId) => {
  const persisted = readPersistedShopId(userId);
  if (persisted === ALL_SHOPS) {
    state.selectedShopId = ALL_SHOPS;
    state.selected = null;
    return;
  }
  if (state.stores.some((s) => s.id === persisted)) {
    state.selectedShopId = persisted;
    state.selected = pickSelectedStore(state.stores, persisted);
    return;
  }
  // Persisted shop disconnected — fall back to all shops
  state.selectedShopId = ALL_SHOPS;
  state.selected = null;
  persistShopId(userId, ALL_SHOPS);
};

export const fetchIntegrations = createAsyncThunk(
  'integrations/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const data = await integrationsService.list();
      return { ...(data || {}), _userId: getState().auth?.user?.id };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load integrations.');
    }
  }
);

export const fetchIntegrationStatus = createAsyncThunk(
  'integrations/status',
  async (_, { getState, rejectWithValue }) => {
    try {
      const data = await integrationsService.status();
      return { ...(data || {}), _userId: getState().auth?.user?.id };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load status.');
    }
  }
);

export const connectIntegration = createAsyncThunk(
  'integrations/connect',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const store = await integrationsService.connect(payload);
      return { store, _userId: getState().auth?.user?.id };
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
      if (action.payload?.id) {
        state.selectedShopId = action.payload.id;
      }
    },
    setSelectedShopId(state, action) {
      const payload = action.payload;
      const shopId =
        typeof payload === 'string' ? payload : payload?.shopId || ALL_SHOPS;
      const userId = typeof payload === 'object' ? payload?.userId : null;
      state.selectedShopId = shopId || ALL_SHOPS;
      state.selected = pickSelectedStore(state.stores, state.selectedShopId);
      persistShopId(userId, state.selectedShopId);
    },
    clearIntegrationsNotice(state) {
      state.notice = null;
      state.error = null;
    },
    resetIntegrations() {
      return { ...initialState };
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
        reconcileSelection(state, action.payload?._userId);
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchIntegrationStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIntegrationStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.statusPayload = action.payload;
        state.stores = action.payload?.stores || state.stores;
        reconcileSelection(state, action.payload?._userId);
      })
      .addCase(fetchIntegrationStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(connectIntegration.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(connectIntegration.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Store connected successfully.';
        const store = action.payload?.store || action.payload;
        state.stores = [store, ...state.stores.filter((s) => s.id !== store.id)];
        state.selectedShopId = store.id;
        state.selected = store;
        persistShopId(action.payload?._userId, store.id);
      })
      .addCase(connectIntegration.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(disconnectIntegration.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Store disconnected.';
        state.stores = state.stores.filter((s) => s.id !== action.payload);
        if (state.selectedShopId === action.payload) {
          state.selectedShopId = ALL_SHOPS;
          state.selected = null;
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

export const { setSelectedStore, setSelectedShopId, clearIntegrationsNotice, resetIntegrations } =
  integrationsSlice.actions;
export default integrationsSlice.reducer;
