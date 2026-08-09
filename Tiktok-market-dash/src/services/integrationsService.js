import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class IntegrationsApiError extends Error {
  constructor(message, { status = 400, code = 'INTEGRATIONS_ERROR' } = {}) {
    super(message);
    this.name = 'IntegrationsApiError';
    this.status = status;
    this.code = code;
  }
}

export const integrationsService = {
  async list() {
    try {
      const response = await axiosPrivate.get('/integrations');
      return unwrap(response);
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to load integrations.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async status() {
    try {
      const response = await axiosPrivate.get('/integrations/status');
      return unwrap(response);
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to load integration status.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/integrations/${id}`);
      return unwrap(response)?.store;
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to load store.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async connect(payload) {
    try {
      const response = await axiosPrivate.post('/integrations/connect', payload);
      return unwrap(response)?.store;
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to connect store.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async update(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/integrations/${id}`, payload);
      return unwrap(response)?.store;
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to update store.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async disconnect(id) {
    try {
      const response = await axiosPrivate.delete(`/integrations/${id}`);
      return unwrap(response);
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to disconnect store.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async sync(id) {
    try {
      const response = await axiosPrivate.post(`/integrations/${id}/sync`);
      return unwrap(response);
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to sync store.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async lastSync(id) {
    try {
      const response = await axiosPrivate.get(`/integrations/${id}/sync`);
      return unwrap(response);
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to load sync status.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async syncLogs(id, params = {}) {
    try {
      const response = await axiosPrivate.get(`/integrations/${id}/sync/logs`, { params });
      return unwrap(response);
    } catch (error) {
      throw new IntegrationsApiError(getErrorMessage(error, 'Unable to load sync logs.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
