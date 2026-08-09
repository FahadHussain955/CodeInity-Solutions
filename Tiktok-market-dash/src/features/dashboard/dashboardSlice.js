import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/dashboardService';

const initialState = {
  overview: null,
  kpis: null,
  revenue: null,
  sales: null,
  productInsights: null,
  customerInsights: null,
  recentOrders: [],
  activity: [],
  storeHealth: null,
  lowStockItems: [],
  range: { preset: 'today', start: null, end: null },
  status: 'idle',
  error: null,
};

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/overview',
  async (range, { rejectWithValue }) => {
    try {
      return await dashboardService.overview(range || {});
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load dashboard.');
    }
  }
);

export const fetchDashboardKpis = createAsyncThunk(
  'dashboard/kpis',
  async (range, { rejectWithValue }) => {
    try {
      return await dashboardService.kpis(range || {});
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load KPIs.');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardRange(state, action) {
      state.range = { ...state.range, ...action.payload };
    },
    clearDashboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload || {};
        state.overview = data;
        state.kpis = data.kpis || null;
        state.revenue = data.revenue || null;
        state.sales = data.sales || null;
        state.productInsights = data.productInsights || null;
        state.customerInsights = data.customerInsights || null;
        state.recentOrders = data.recentOrders || [];
        state.activity = data.activity || [];
        state.storeHealth = data.storeHealth || null;
        state.lowStockItems = data.lowStockItems || data.productInsights?.lowStockProducts || [];
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to load dashboard.';
      })
      .addCase(fetchDashboardKpis.fulfilled, (state, action) => {
        state.kpis = action.payload;
      });
  },
});

export const { setDashboardRange, clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
