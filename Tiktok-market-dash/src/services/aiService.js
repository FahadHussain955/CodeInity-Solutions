import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage as getErrorMessage, unwrapApiData as unwrap } from '@/utils/apiHelpers';

export class AiApiError extends Error {
  constructor(message, { status = 400 } = {}) {
    super(message);
    this.name = 'AiApiError';
    this.status = status;
  }
}

export const aiService = {
  async insights(params = {}) {
    try {
      const response = await axiosPrivate.get('/ai/insights', { params });
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to load AI insights.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async generate(payload = {}) {
    try {
      const response = await axiosPrivate.post('/ai/insights/generate', payload);
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to generate AI insights.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async refresh(payload = {}) {
    try {
      const response = await axiosPrivate.post('/ai/insights/refresh', payload);
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to refresh AI insights.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async recommendations() {
    try {
      const response = await axiosPrivate.get('/ai/recommendations');
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to load recommendations.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async forecasts() {
    try {
      const response = await axiosPrivate.get('/ai/forecasts');
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to load forecasts.'), {
        status: error?.response?.status || 400,
      });
    }
  },

  async campaignSuggestions() {
    try {
      const response = await axiosPrivate.get('/ai/campaign-suggestions');
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to load campaign suggestions.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
