import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { customersService } from '@/services/customersService';
import { PAGE_SIZE } from '@/components/ui/Pagination';
import { shopIdQueryParam } from '@/utils/shopQuery';

const initialFilters = {
  search: '',
  filter: 'all',
  sort: 'recent',
};

const initialState = {
  items: [],
  selected: null,
  purchaseHistory: [],
  purchaseSummary: null,
  analytics: null,
  dashboard: null,
  filters: { ...initialFilters },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  historyPagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  detailStatus: 'idle',
  analyticsStatus: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

export const fetchCustomersList = createAsyncThunk(
  'customers/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().customers;
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await customersService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        filter: filters.filter !== 'all' ? filters.filter : undefined,
        sort: filters.sort,
        shopId,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load customers.');
    }
  }
);

export const fetchCustomerAnalytics = createAsyncThunk(
  'customers/analytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await customersService.analytics({ shopId });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load analytics.');
    }
  }
);

export const fetchCustomersDashboard = createAsyncThunk(
  'customers/dashboard',
  async (_, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await customersService.dashboard({ shopId });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load customer dashboard.');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await customersService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load customer.');
    }
  }
);

export const fetchCustomerPurchaseHistory = createAsyncThunk(
  'customers/purchaseHistory',
  async ({ id, page = 1, limit = PAGE_SIZE }, { rejectWithValue }) => {
    try {
      return await customersService.purchaseHistory(id, { page, limit });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load purchase history.');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await customersService.create({ ...payload, ...(shopId ? { shopId } : {}) });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create customer.');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return await customersService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update customer.');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await customersService.remove(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to delete customer.');
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomerFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setCustomerPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setHistoryPage: (state, action) => {
      state.historyPagination.page = action.payload;
    },
    clearCustomerNotice: (state) => {
      state.notice = null;
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selected = null;
      state.purchaseHistory = [];
      state.purchaseSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomersList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCustomersList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchCustomersList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to load customers.';
      })
      .addCase(fetchCustomerAnalytics.pending, (state) => {
        state.analyticsStatus = 'loading';
      })
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = 'succeeded';
        state.analytics = action.payload;
      })
      .addCase(fetchCustomerAnalytics.rejected, (state, action) => {
        state.analyticsStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCustomersDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCustomerPurchaseHistory.fulfilled, (state, action) => {
        state.purchaseHistory = action.payload.items || [];
        state.purchaseSummary = action.payload.summary || null;
        state.historyPagination = action.payload.pagination || state.historyPagination;
        if (action.payload.customer) state.selected = action.payload.customer;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Customer created successfully.';
        state.items = [action.payload, ...state.items];
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Customer updated successfully.';
        state.selected = action.payload;
        state.items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = action.payload?.softDeleted
          ? 'Customer deactivated (has orders).'
          : 'Customer deleted.';
        if (action.payload?.customer) {
          state.items = state.items.map((c) =>
            c.id === action.payload.customer.id ? action.payload.customer : c
          );
        } else if (action.payload?.id) {
          state.items = state.items.filter((c) => c.id !== action.payload.id);
        }
      });
  },
});

export const {
  setCustomerFilters,
  setCustomerPage,
  setHistoryPage,
  clearCustomerNotice,
  clearSelectedCustomer,
} = customersSlice.actions;

export default customersSlice.reducer;
