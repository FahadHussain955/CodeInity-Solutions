const DISMISS_PREFIX = 'nexora_tiktok_connect_prompt_dismissed:';
const LEGACY_LOCAL_PREFIX = 'nexora_tiktok_connect_prompt_dismissed:';

/** Session-only dismiss so "Maybe Later" does not re-open the popup while navigating. */
export const isTikTokConnectPromptDismissed = (userId) => {
  if (!userId || typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(`${DISMISS_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
};

export const dismissTikTokConnectPrompt = (userId) => {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${DISMISS_PREFIX}${userId}`, '1');
    // Drop legacy 7-day localStorage dismiss so reconnect eligibility is session-based.
    window.localStorage.removeItem(`${LEGACY_LOCAL_PREFIX}${userId}`);
  } catch {
    /* ignore quota */
  }
};

/** Re-enable the popup after the user disconnects their last shop. */
export const clearTikTokConnectPromptDismiss = (userId) => {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${DISMISS_PREFIX}${userId}`);
    window.localStorage.removeItem(`${LEGACY_LOCAL_PREFIX}${userId}`);
  } catch {
    /* ignore */
  }
};
