import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class AudiencesApiError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = 'AudiencesApiError';
    this.status = status;
  }
}

export const audiencesService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/audiences', { params });
      return unwrap(response);
    } catch (error) {
      throw new AudiencesApiError(getErrorMessage(error, 'Unable to load audiences.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async analytics(params = {}) {
    try {
      const response = await axiosPrivate.get('/audiences/analytics', { params });
      return unwrap(response);
    } catch (error) {
      throw new AudiencesApiError(getErrorMessage(error, 'Unable to load audience analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/audiences/${id}`);
      return unwrap(response)?.audience ?? unwrap(response);
    } catch (error) {
      throw new AudiencesApiError(getErrorMessage(error, 'Unable to load audience.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async create(payload) {
    try {
      const response = await axiosPrivate.post('/audiences', payload);
      return unwrap(response)?.audience ?? unwrap(response);
    } catch (error) {
      throw new AudiencesApiError(getErrorMessage(error, 'Unable to create audience.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async update(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/audiences/${id}`, payload);
      return unwrap(response)?.audience ?? unwrap(response);
    } catch (error) {
      throw new AudiencesApiError(getErrorMessage(error, 'Unable to update audience.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async remove(id) {
    try {
      const response = await axiosPrivate.delete(`/audiences/${id}`);
      return unwrap(response);
    } catch (error) {
      throw new AudiencesApiError(getErrorMessage(error, 'Unable to delete audience.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
