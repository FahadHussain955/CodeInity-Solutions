import { API_BASE_URL } from '@/constants/config';

/** Resolve API-relative media paths (e.g. /uploads/...) to an absolute URL. */
export const resolveMediaUrl = (url) => {
  if (!url) return '';
  const value = String(url).trim();
  if (!value) return '';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return value;
  }
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
};
