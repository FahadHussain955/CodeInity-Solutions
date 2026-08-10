import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ordersService } from '@/services/ordersService';
import { PAGE_SIZE } from '@/components/ui/Pagination';
import { shopIdQueryParam } from '@/utils/shopQuery';

const initialFilters = {
  search: '',
  filter: 'all',
};

const initialState = {
  items: [],
  counts: { all: 0, processing: 0, pending: 0, delivered: 0, cancelled: 0 },
  selected: null,
  filters: { ...initialFilters },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  detailStatus: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

export const fetchOrdersList = createAsyncThunk(
  'orders/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().orders;
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await ordersService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.filter !== 'all' ? filters.filter : undefined,
        shopId,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load orders.');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await ordersService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load order.');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await ordersService.updateStatus(id, status);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update order status.');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setOrderPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearOrderNotice: (state) => {
      state.notice = null;
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrdersList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.counts = action.payload.counts || state.counts;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchOrdersList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to load orders.';
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.selected = null;
        state.error = action.payload || 'Unable to load order.';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.selected = action.payload;
        state.notice = 'Order status updated.';
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = {
            ...state.items[idx],
            status: action.payload.status,
            statusRaw: action.payload.statusRaw,
          };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload || 'Unable to update order status.';
      });
  },
});

export const { setOrderFilters, setOrderPage, clearOrderNotice, clearSelectedOrder } =
  ordersSlice.actions;

export default ordersSlice.reducer;
