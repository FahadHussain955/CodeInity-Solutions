/**
 * Bridge so axios (outside React) can force a Redux logout + login redirect
 * without circular imports with the store.
 *
 * Distinguishes intentional Sign Out from real session expiry so logout
 * does not surface "Session expired" on the login page.
 */
let onSessionInvalid = null;
let intentionalLogout = false;

export const setSessionInvalidHandler = (handler) => {
  onSessionInvalid = typeof handler === 'function' ? handler : null;
};

export const beginIntentionalLogout = () => {
  intentionalLogout = true;
};

export const endIntentionalLogout = () => {
  intentionalLogout = false;
};

export const isIntentionalLogout = () => intentionalLogout;

export const notifySessionInvalid = (reason = 'expired') => {
  if (intentionalLogout) return;
  try {
    onSessionInvalid?.(reason);
  } catch {
    /* ignore handler errors */
  }
};
