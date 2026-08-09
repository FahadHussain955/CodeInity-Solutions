import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage, unwrapApiData } from '@/utils/apiHelpers';

export class DashboardApiError extends Error {
  constructor(message, { status = 400, code = 'DASHBOARD_ERROR' } = {}) {
    super(message);
    this.name = 'DashboardApiError';
    this.status = status;
    this.code = code;
  }
}

const rangeParams = (range = {}) => {
  const params = {};
  if (range.preset) params.preset = range.preset;
  if (range.start) params.start = new Date(range.start).toISOString();
  if (range.end) params.end = new Date(range.end).toISOString();
  if (range.limit) params.limit = range.limit;
  return params;
};

export const dashboardService = {
  async overview(range = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard', { params: rangeParams(range) });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load dashboard.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async kpis(range = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard/kpis', { params: rangeParams(range) });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load KPIs.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async revenue(range = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard/revenue', { params: rangeParams(range) });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load revenue analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async sales(range = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard/sales', { params: rangeParams(range) });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load sales analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async productInsights() {
    try {
      const response = await axiosPrivate.get('/dashboard/product-insights');
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load product insights.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async customerInsights(range = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard/customer-insights', {
        params: rangeParams(range),
      });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load customer insights.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async recentOrders(range = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard/recent-orders', {
        params: rangeParams(range),
      });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load recent orders.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async activity(params = {}) {
    try {
      const response = await axiosPrivate.get('/dashboard/activity', { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load activity.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async storeHealth() {
    try {
      const response = await axiosPrivate.get('/dashboard/store-health');
      return unwrapApiData(response);
    } catch (error) {
      throw new DashboardApiError(getApiErrorMessage(error, 'Unable to load store health.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
