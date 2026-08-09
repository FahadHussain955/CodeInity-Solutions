/**
 * Shared Axios response helpers for API service modules.
 */

export const getApiErrorMessage = (error, fallback = 'Request failed.') => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) return data.errors[0].message;
  if (data?.code === 'DB_UNAVAILABLE') {
    return data.message || 'Database unavailable. Please try again shortly.';
  }
  if (!error?.response) return 'Cannot reach the API. Is the backend running?';
  return error?.message || fallback;
};

export const unwrapApiData = (response) => response?.data?.data;
