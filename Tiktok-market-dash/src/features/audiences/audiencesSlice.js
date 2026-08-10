import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { audiencesService } from '@/services/audiencesService';
import { PAGE_SIZE } from '@/components/ui/Pagination';
import { shopIdQueryParam } from '@/utils/shopQuery';

const initialState = {
  items: [],
  selected: null,
  analytics: null,
  demographics: null,
  filters: { search: '', status: 'all' },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
  notice: null,
};

export const fetchAudiencesList = createAsyncThunk(
  'audiences/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().audiences;
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await audiencesService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        shopId,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load audiences.');
    }
  }
);

export const fetchAudienceAnalytics = createAsyncThunk(
  'audiences/analytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await audiencesService.analytics({ shopId });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load audience analytics.');
    }
  }
);

const audiencesSlice = createSlice({
  name: 'audiences',
  initialState,
  reducers: {
    setAudienceFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setAudiencePage(state, action) {
      state.pagination.page = action.payload;
    },
    clearAudienceNotice(state) {
      state.notice = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAudiencesList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAudiencesList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchAudiencesList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAudienceAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.demographics = action.payload?.demographics || action.payload;
      });
  },
});

export const { setAudienceFilters, setAudiencePage, clearAudienceNotice } = audiencesSlice.actions;
export default audiencesSlice.reducer;
