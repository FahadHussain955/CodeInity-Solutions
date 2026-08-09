import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class AdsApiError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = 'AdsApiError';
    this.status = status;
  }
}

export const adsService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/ads', { params });
      return unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to load ads.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async analytics() {
    try {
      const response = await axiosPrivate.get('/ads/analytics');
      return unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to load ad analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/ads/${id}`);
      return unwrap(response)?.ad ?? unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to load ad.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async create(payload) {
    try {
      const response = await axiosPrivate.post('/ads', payload);
      return unwrap(response)?.ad ?? unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to create ad.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async update(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/ads/${id}`, payload);
      return unwrap(response)?.ad ?? unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to update ad.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async remove(id) {
    try {
      const response = await axiosPrivate.delete(`/ads/${id}`);
      return unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to delete ad.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async preview(id) {
    try {
      const response = await axiosPrivate.get(`/ads/${id}/preview`);
      return unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to load preview.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async updateReview(id, reviewStatus) {
    try {
      const response = await axiosPrivate.patch(`/ads/${id}/review`, { reviewStatus });
      return unwrap(response)?.ad ?? unwrap(response);
    } catch (error) {
      throw new AdsApiError(getErrorMessage(error, 'Unable to update review status.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
