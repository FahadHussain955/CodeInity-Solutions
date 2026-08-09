import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { inventoryService } from '@/services/inventoryService';
import { PAGE_SIZE } from '@/components/ui/Pagination';

const initialFilters = {
  search: '',
  status: 'all',
  sort: 'updated',
};

const initialState = {
  items: [],
  selected: null,
  analytics: null,
  dashboard: null,
  history: [],
  historyPagination: null,
  filters: { ...initialFilters },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  analyticsStatus: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

export const fetchInventoryList = createAsyncThunk(
  'inventory/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().inventory;
      return await inventoryService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        sort: filters.sort,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load inventory.');
    }
  }
);

export const fetchInventoryAnalytics = createAsyncThunk(
  'inventory/analytics',
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.analytics();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load analytics.');
    }
  }
);

export const fetchInventoryDashboard = createAsyncThunk(
  'inventory/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.dashboard();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load inventory dashboard.');
    }
  }
);

export const fetchInventoryById = createAsyncThunk(
  'inventory/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await inventoryService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load inventory item.');
    }
  }
);

export const restockInventory = createAsyncThunk(
  'inventory/restock',
  async ({ id, quantity, reason }, { rejectWithValue }) => {
    try {
      return await inventoryService.restock(id, { quantity, reason });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to restock.');
    }
  }
);

export const updateInventoryStock = createAsyncThunk(
  'inventory/updateStock',
  async ({ id, currentStock, reservedStock, reason }, { rejectWithValue }) => {
    try {
      return await inventoryService.updateStock(id, { currentStock, reservedStock, reason });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update stock.');
    }
  }
);

export const markInventoryOutOfStock = createAsyncThunk(
  'inventory/outOfStock',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await inventoryService.markOutOfStock(id, { reason });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to mark out of stock.');
    }
  }
);

export const fetchInventoryHistory = createAsyncThunk(
  'inventory/history',
  async ({ id, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await inventoryService.history(id, { page, limit });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load history.');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setInventoryPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearInventoryNotice: (state) => {
      state.notice = null;
      state.error = null;
    },
    clearSelectedInventory: (state) => {
      state.selected = null;
      state.history = [];
      state.historyPagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInventoryList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchInventoryList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to load inventory.';
      })
      .addCase(fetchInventoryAnalytics.pending, (state) => {
        state.analyticsStatus = 'loading';
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = 'succeeded';
        state.analytics = action.payload;
      })
      .addCase(fetchInventoryAnalytics.rejected, (state, action) => {
        state.analyticsStatus = 'failed';
        state.error = action.payload || 'Unable to load analytics.';
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchInventoryById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(restockInventory.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(restockInventory.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Stock restocked successfully.';
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(restockInventory.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateInventoryStock.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Stock updated successfully.';
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(markInventoryOutOfStock.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Marked out of stock.';
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(fetchInventoryHistory.fulfilled, (state, action) => {
        state.history = action.payload.items || [];
        state.historyPagination = action.payload.pagination || null;
      });
  },
});

export const {
  setInventoryFilters,
  setInventoryPage,
  clearInventoryNotice,
  clearSelectedInventory,
} = inventorySlice.actions;

export default inventorySlice.reducer;
