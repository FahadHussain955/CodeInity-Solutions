import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage, unwrapApiData } from '@/utils/apiHelpers';

export class InventoryApiError extends Error {
  constructor(message, { status = 400, code = 'INVENTORY_ERROR' } = {}) {
    super(message);
    this.name = 'InventoryApiError';
    this.status = status;
    this.code = code;
  }
}

const unwrap = unwrapApiData;
const getErrorMessage = getApiErrorMessage;

export const inventoryService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/inventory', { params });
      return unwrap(response);
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to load inventory.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async analytics(params = {}) {
    try {
      const response = await axiosPrivate.get('/inventory/analytics', { params });
      return unwrap(response);
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to load inventory analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async dashboard(params = {}) {
    try {
      const response = await axiosPrivate.get('/inventory/dashboard', { params });
      return unwrap(response);
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to load inventory dashboard.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/inventory/${id}`);
      return unwrap(response)?.item;
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to load inventory item.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async updateStock(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/inventory/${id}/stock`, payload);
      return unwrap(response)?.item;
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to update stock.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async adjust(id, payload) {
    try {
      const response = await axiosPrivate.post(`/inventory/${id}/adjust`, payload);
      return unwrap(response)?.item;
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to adjust stock.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async restock(id, payload) {
    try {
      const response = await axiosPrivate.post(`/inventory/${id}/restock`, payload);
      return unwrap(response)?.item;
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to restock product.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async markOutOfStock(id, payload = {}) {
    try {
      const response = await axiosPrivate.post(`/inventory/${id}/out-of-stock`, payload);
      return unwrap(response)?.item;
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to mark out of stock.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async bulkUpdate(updates) {
    try {
      const response = await axiosPrivate.post('/inventory/bulk', { updates });
      return unwrap(response);
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to bulk update stock.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async history(id, params = {}) {
    try {
      const response = await axiosPrivate.get(`/inventory/${id}/history`, { params });
      return unwrap(response);
    } catch (error) {
      throw new InventoryApiError(getErrorMessage(error, 'Unable to load stock history.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
