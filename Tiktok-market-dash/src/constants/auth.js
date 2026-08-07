export const AUTH_STORAGE_KEY = 'nexora_auth';
export const AUTH_ACTIVITY_KEY = 'nexora_last_activity';

/** Sign out after this much inactivity (also matches access-token lifetime). */
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

/** While active, renew access token this often. */
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
