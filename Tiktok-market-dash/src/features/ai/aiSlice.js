import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { aiService } from '@/services/aiService';

const initialState = {
  insights: null,
  forecast: null,
  groups: [],
  actions: [],
  provider: null,
  cached: false,
  status: 'idle',
  error: null,
  generatedAt: null,
};

export const fetchAiInsights = createAsyncThunk(
  'ai/insights',
  async (_, { rejectWithValue }) => {
    try {
      return await aiService.insights();
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load AI insights.');
    }
  }
);

export const refreshAiInsights = createAsyncThunk(
  'ai/refresh',
  async (_, { rejectWithValue }) => {
    try {
      return await aiService.refresh({ force: true });
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to refresh AI insights.');
    }
  }
);

const applyPayload = (state, payload) => {
  state.insights = payload;
  state.forecast = payload?.forecast || null;
  state.groups = payload?.groups || [];
  state.actions = payload?.actions || [];
  state.provider = payload?.provider || null;
  state.cached = Boolean(payload?.cached);
  state.generatedAt = payload?.generatedAt || null;
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAiError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiInsights.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAiInsights.fulfilled, (state, action) => {
        state.status = 'succeeded';
        applyPayload(state, action.payload);
      })
      .addCase(fetchAiInsights.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(refreshAiInsights.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(refreshAiInsights.fulfilled, (state, action) => {
        state.status = 'succeeded';
        applyPayload(state, action.payload);
      })
      .addCase(refreshAiInsights.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearAiError } = aiSlice.actions;
export default aiSlice.reducer;
