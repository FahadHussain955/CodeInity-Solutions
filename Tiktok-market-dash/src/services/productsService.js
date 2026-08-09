import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage, unwrapApiData } from '@/utils/apiHelpers';

export class ProductsApiError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = 'ProductsApiError';
    this.status = status;
  }
}

export const productsService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/products', { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to load products.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/products/${id}`);
      return unwrapApiData(response)?.product;
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to load product.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async create(payload) {
    try {
      const response = await axiosPrivate.post('/products', payload);
      return unwrapApiData(response)?.product;
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to create product.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async update(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/products/${id}`, payload);
      return unwrapApiData(response)?.product;
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to update product.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async remove(id) {
    try {
      const response = await axiosPrivate.delete(`/products/${id}`);
      return unwrapApiData(response);
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to delete product.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getProductPerformance(id, params = {}) {
    try {
      const response = await axiosPrivate.get(`/products/${id}/performance`, { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to load product performance.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getProductsPerformance(params = {}) {
    try {
      const response = await axiosPrivate.get('/products/performance', { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to load products performance.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async rankings(params = {}) {
    try {
      const response = await axiosPrivate.get('/products/rankings', { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new ProductsApiError(getApiErrorMessage(error, 'Unable to load product rankings.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
