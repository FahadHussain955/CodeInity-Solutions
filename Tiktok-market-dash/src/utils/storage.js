const isBrowser = typeof window !== 'undefined';

export const storage = {
  get(key) {
    if (!isBrowser) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  set(key, value) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / private mode */
    }
  },

  remove(key) {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
