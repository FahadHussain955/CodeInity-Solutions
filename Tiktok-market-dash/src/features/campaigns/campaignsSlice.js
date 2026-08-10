import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { campaignsService } from '@/services/campaignsService';
import { PAGE_SIZE } from '@/components/ui/Pagination';
import { shopIdQueryParam } from '@/utils/shopQuery';

const initialState = {
  items: [],
  selected: null,
  analytics: null,
  filters: { status: 'all', search: '', sort: 'recent' },
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  status: 'idle',
  detailStatus: 'idle',
  actionStatus: 'idle',
  error: null,
  notice: null,
};

export const fetchCampaignsList = createAsyncThunk(
  'campaigns/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().campaigns;
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await campaignsService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        sort: filters.sort,
        shopId,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load campaigns.');
    }
  }
);

export const fetchCampaignAnalytics = createAsyncThunk(
  'campaigns/analytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await campaignsService.analytics({ shopId });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load analytics.');
    }
  }
);

export const fetchCampaignById = createAsyncThunk(
  'campaigns/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await campaignsService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load campaign.');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return await campaignsService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update campaign.');
    }
  }
);

export const duplicateCampaign = createAsyncThunk(
  'campaigns/duplicate',
  async (id, { rejectWithValue }) => {
    try {
      return await campaignsService.duplicate(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to duplicate campaign.');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const shopId = shopIdQueryParam(getState().integrations?.selectedShopId);
      return await campaignsService.create({ ...payload, ...(shopId ? { shopId } : {}) });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create campaign.');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/delete',
  async (id, { rejectWithValue }) => {
    try {
      await campaignsService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to delete campaign.');
    }
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setCampaignFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setCampaignPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearCampaignNotice(state) {
      state.notice = null;
      state.error = null;
    },
    clearSelectedCampaign(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignsList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCampaignsList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchCampaignsList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCampaignAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(fetchCampaignById.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchCampaignById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCampaign.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.selected = action.payload;
        state.items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
        state.notice = 'Campaign updated.';
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(createCampaign.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
        state.notice = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items = [action.payload, ...state.items.filter((c) => c.id !== action.payload.id)];
        state.pagination.total = (state.pagination.total || 0) + 1;
        state.notice = 'Campaign created.';
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
        state.pagination.total = Math.max(0, (state.pagination.total || 1) - 1);
        state.notice = 'Campaign deleted.';
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(duplicateCampaign.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.notice = 'Campaign duplicated.';
      });
  },
});

export const {
  setCampaignFilters,
  setCampaignPage,
  clearCampaignNotice,
  clearSelectedCampaign,
} = campaignsSlice.actions;

export default campaignsSlice.reducer;
