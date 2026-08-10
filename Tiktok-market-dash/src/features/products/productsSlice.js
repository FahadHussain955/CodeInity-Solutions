import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productsService } from '@/services/productsService';
import { PAGE_SIZE } from '@/components/ui/Pagination';
import { shopIdQueryParam } from '@/utils/shopQuery';

export const EMPTY_PRODUCT_FILTERS = {
  search: '',
  status: 'all',
  category: 'all',
  minPrice: '',
  maxPrice: '',
  stockStatus: 'all',
  sortBy: 'updated',
  sortOrder: 'desc',
  range: 'all',
  start: null,
  end: null,
};

const initialState = {
  items: [],
  counts: { all: 0, active: 0, draft: 0, archived: 0 },
  categories: [],
  selected: null,
  performance: null,
  rankings: null,
  filters: { ...EMPTY_PRODUCT_FILTERS },
  lowStockThreshold: 10,
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

const buildListParams = (filters, pagination, shopId) => {
  const params = {
    page: pagination.page,
    limit: pagination.limit,
    shopId,
    sortBy: filters.sortBy || 'updated',
    sortOrder: filters.sortOrder || 'desc',
    ...rangeParams(filters),
  };

  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.stockStatus && filters.stockStatus !== 'all') {
    params.stockStatus = filters.stockStatus;
  }
  if (filters.minPrice !== '' && filters.minPrice != null) {
    const min = Number(filters.minPrice);
    if (Number.isFinite(min)) params.minPrice = min;
  }
  if (filters.maxPrice !== '' && filters.maxPrice != null) {
    const max = Number(filters.maxPrice);
    if (Number.isFinite(max)) params.maxPrice = max;
  }
  return params;
};

export const fetchProductsList = createAsyncThunk(
  'products/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().products;
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await productsService.list(buildListParams(filters, pagination, shopId));
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load products.');
    }
  }
);

export const fetchProductCategories = createAsyncThunk(
  'products/categories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await productsService.categories({ shopId });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load categories.');
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
  async (payload, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await productsService.create({ ...payload, ...(shopId ? { shopId } : {}) });
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
    clearProductFilters(state) {
      const status = state.filters.status;
      const range = state.filters.range;
      const start = state.filters.start;
      const end = state.filters.end;
      state.filters = {
        ...EMPTY_PRODUCT_FILTERS,
        // Keep catalog status tabs + performance range; clear search/category/price/stock only.
        status,
        range,
        start,
        end,
      };
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
        if (action.payload?.lowStockThreshold != null) {
          state.lowStockThreshold = action.payload.lowStockThreshold;
        }
      })
      .addCase(fetchProductsList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.categories = action.payload?.items || [];
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
  clearProductFilters,
  setProductPage,
  setPerformanceRange,
  clearSelectedProduct,
  clearProductNotice,
} = productsSlice.actions;

export default productsSlice.reducer;
