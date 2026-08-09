import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adsService } from '@/services/adsService';
import { PAGE_SIZE } from '@/components/ui/Pagination';

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
      return await adsService.list({
        page: override.page || pagination.page,
        limit: override.limit || pagination.limit,
        search: filters.search || undefined,
        status: (override.status ?? filters.status) !== 'All' ? (override.status ?? filters.status) : undefined,
        campaignId: override.campaignId || filters.campaignId || undefined,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load ads.');
    }
  }
);

export const fetchAdsAnalytics = createAsyncThunk(
  'ads/analytics',
  async (_, { rejectWithValue }) => {
    try {
      return await adsService.analytics();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load ad analytics.');
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
      });
  },
});

export const { setAdsFilters, setAdsPage, clearAdsNotice } = adsSlice.actions;
export default adsSlice.reducer;
