import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productsService } from '@/services/productsService';
import { PAGE_SIZE } from '@/components/ui/Pagination';

const initialState = {
  items: [],
  counts: { all: 0, active: 0, draft: 0, archived: 0 },
  selected: null,
  performance: null,
  rankings: null,
  filters: {
    search: '',
    status: 'all',
    range: 'all',
    start: null,
    end: null,
  },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  detailStatus: 'idle',
  performanceStatus: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

const rangeParams = (filters) => {
  const params = { range: filters.range || 'all' };
  if (filters.range === 'custom' && filters.start && filters.end) {
    params.startDate = filters.start;
    params.endDate = filters.end;
  }
  return params;
};

export const fetchProductsList = createAsyncThunk(
  'products/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().products;
      return await productsService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        ...rangeParams(filters),
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load products.');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await productsService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load product.');
    }
  }
);

export const fetchProductPerformance = createAsyncThunk(
  'products/performance',
  async ({ id, range }, { getState, rejectWithValue }) => {
    try {
      const filters = range || getState().products.filters;
      return await productsService.getProductPerformance(id, rangeParams(filters));
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load performance.');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await productsService.create(payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create product.');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await productsService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update product.');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setProductPage(state, action) {
      state.pagination.page = action.payload;
    },
    setPerformanceRange(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedProduct(state) {
      state.selected = null;
      state.performance = null;
      state.detailStatus = 'idle';
      state.performanceStatus = 'idle';
      state.error = null;
    },
    clearProductNotice(state) {
      state.notice = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProductsList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.items || [];
        state.counts = action.payload?.counts || state.counts;
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchProductsList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload;
        state.selected = null;
      })
      .addCase(fetchProductPerformance.pending, (state) => {
        state.performanceStatus = 'loading';
      })
      .addCase(fetchProductPerformance.fulfilled, (state, action) => {
        state.performanceStatus = 'succeeded';
        state.performance = action.payload;
      })
      .addCase(fetchProductPerformance.rejected, (state, action) => {
        state.performanceStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Product created.';
        if (action.payload) state.items = [action.payload, ...state.items];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.notice = 'Product updated.';
        state.selected = action.payload;
        state.items = state.items.map((p) => (p.id === action.payload.id ? action.payload : p));
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setProductFilters,
  setProductPage,
  setPerformanceRange,
  clearSelectedProduct,
  clearProductNotice,
} = productsSlice.actions;

export default productsSlice.reducer;
