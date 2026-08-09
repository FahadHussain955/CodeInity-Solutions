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

  /**
   * Generate product draft fields from an image.
   * Prefers multipart file; falls back to imageUrl JSON.
   */
  async generateProductFromImage({ file, imageUrl, hint } = {}) {
    try {
      let response;
      if (file) {
        const form = new FormData();
        form.append('image', file);
        if (hint) form.append('hint', hint);
        if (imageUrl) form.append('imageUrl', imageUrl);
        response = await axiosPrivate.post('/ai/products/generate', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        });
      } else {
        response = await axiosPrivate.post(
          '/ai/products/generate',
          { imageUrl, hint },
          { timeout: 120000 }
        );
      }
      return unwrap(response);
    } catch (error) {
      throw new AiApiError(getErrorMessage(error, 'Unable to generate product details.'), {
        status: error?.response?.status || 400,
      });
    }
  },
};
