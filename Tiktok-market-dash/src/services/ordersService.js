import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class OrdersApiError extends Error {
  constructor(message, { status = 400, code = 'ORDERS_ERROR' } = {}) {
    super(message);
    this.name = 'OrdersApiError';
    this.status = status;
    this.code = code;
  }
}

export const ordersService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/orders', { params });
      return unwrap(response);
    } catch (error) {
      throw new OrdersApiError(getErrorMessage(error, 'Unable to load orders.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/orders/${id}`);
      return unwrap(response);
    } catch (error) {
      throw new OrdersApiError(getErrorMessage(error, 'Unable to load order.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await axiosPrivate.patch(`/orders/${id}/status`, { status });
      return unwrap(response);
    } catch (error) {
      throw new OrdersApiError(getErrorMessage(error, 'Unable to update order status.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
