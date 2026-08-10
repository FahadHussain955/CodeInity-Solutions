import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adsService } from '@/services/adsService';
import { PAGE_SIZE } from '@/components/ui/Pagination';
import { shopIdQueryParam } from '@/utils/shopQuery';

const initialState = {
  items: [],
  selected: null,
  analytics: null,
  filters: { status: 'All', search: '', campaignId: null },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
  notice: null,
};

export const fetchAdsList = createAsyncThunk(
  'ads/list',
  async (override = {}, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().ads;
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await adsService.list({
        page: override.page || pagination.page,
        limit: override.limit || pagination.limit,
        search: filters.search || undefined,
        status: (override.status ?? filters.status) !== 'All' ? (override.status ?? filters.status) : undefined,
        campaignId: override.campaignId || filters.campaignId || undefined,
        shopId,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load ads.');
    }
  }
);

export const fetchAdsAnalytics = createAsyncThunk(
  'ads/analytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await adsService.analytics({ shopId });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load ad analytics.');
    }
  }
);

export const createAd = createAsyncThunk(
  'ads/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await adsService.create({ ...payload, ...(shopId ? { shopId } : {}) });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create ad.');
    }
  }
);

export const updateAd = createAsyncThunk(
  'ads/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return await adsService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update ad.');
    }
  }
);

export const deleteAd = createAsyncThunk(
  'ads/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adsService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to delete ad.');
    }
  }
);

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setAdsFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setAdsPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearAdsNotice(state) {
      state.notice = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdsList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdsList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchAdsList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAdsAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items.filter((a) => a.id !== action.payload.id)];
        state.pagination.total = (state.pagination.total || 0) + 1;
        state.notice = 'Ad created.';
        state.error = null;
      })
      .addCase(createAd.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.items = state.items.map((a) => (a.id === action.payload.id ? action.payload : a));
        state.selected = action.payload;
        state.notice = 'Ad updated.';
        state.error = null;
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
        state.pagination.total = Math.max(0, (state.pagination.total || 1) - 1);
        state.notice = 'Ad deleted.';
      })
      .addCase(deleteAd.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setAdsFilters, setAdsPage, clearAdsNotice } = adsSlice.actions;
export default adsSlice.reducer;
