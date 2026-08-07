/**
 * Bridge so axios (outside React) can force a Redux logout + login redirect
 * without circular imports with the store.
 */
let onSessionInvalid = null;

export const setSessionInvalidHandler = (handler) => {
  onSessionInvalid = typeof handler === 'function' ? handler : null;
};

export const notifySessionInvalid = (reason = 'expired') => {
  try {
    onSessionInvalid?.(reason);
  } catch {
    /* ignore handler errors */
  }
};
