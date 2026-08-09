import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class CustomersApiError extends Error {
  constructor(message, { status = 400, code = 'CUSTOMERS_ERROR' } = {}) {
    super(message);
    this.name = 'CustomersApiError';
    this.status = status;
    this.code = code;
  }
}

export const customersService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/customers', { params });
      return unwrap(response);
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to load customers.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async analytics() {
    try {
      const response = await axiosPrivate.get('/customers/analytics');
      return unwrap(response);
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to load customer analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async dashboard() {
    try {
      const response = await axiosPrivate.get('/customers/dashboard');
      return unwrap(response);
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to load customer dashboard.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/customers/${id}`);
      return unwrap(response)?.customer;
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to load customer.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async create(payload) {
    try {
      const response = await axiosPrivate.post('/customers', payload);
      return unwrap(response)?.customer;
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to create customer.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async update(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/customers/${id}`, payload);
      return unwrap(response)?.customer;
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to update customer.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async remove(id) {
    try {
      const response = await axiosPrivate.delete(`/customers/${id}`);
      return unwrap(response);
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to delete customer.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async purchaseHistory(id, params = {}) {
    try {
      const response = await axiosPrivate.get(`/customers/${id}/orders`, { params });
      return unwrap(response);
    } catch (error) {
      throw new CustomersApiError(getErrorMessage(error, 'Unable to load purchase history.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
