import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class CampaignsApiError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = 'CampaignsApiError';
    this.status = status;
  }
}

export const campaignsService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/campaigns', { params });
      return unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to load campaigns.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async analytics() {
    try {
      const response = await axiosPrivate.get('/campaigns/analytics');
      return unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to load campaign analytics.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async getById(id) {
    try {
      const response = await axiosPrivate.get(`/campaigns/${id}`);
      return unwrap(response)?.campaign ?? unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to load campaign.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async create(payload) {
    try {
      const response = await axiosPrivate.post('/campaigns', payload);
      return unwrap(response)?.campaign ?? unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to create campaign.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async update(id, payload) {
    try {
      const response = await axiosPrivate.patch(`/campaigns/${id}`, payload);
      return unwrap(response)?.campaign ?? unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to update campaign.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async remove(id) {
    try {
      const response = await axiosPrivate.delete(`/campaigns/${id}`);
      return unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to delete campaign.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async duplicate(id) {
    try {
      const response = await axiosPrivate.post(`/campaigns/${id}/duplicate`);
      return unwrap(response)?.campaign ?? unwrap(response);
    } catch (error) {
      throw new CampaignsApiError(getErrorMessage(error, 'Unable to duplicate campaign.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
