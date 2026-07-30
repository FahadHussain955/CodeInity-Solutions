// =============================================================================
// USER SERVICE
// Abstracts user profile and settings fetching.
// Currently returns mock data. Replace with Supabase Auth + DB calls.
//
// FUTURE INTEGRATION:
//   import { supabase } from '../lib/supabaseClient';
//   const { data: { user } } = await supabase.auth.getUser();
// =============================================================================

import { STORAGE_KEYS, THEME_KEYS } from '../constants/appConstants';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mock user profile */
const mockUserProfile = {
  id: 'usr-0001',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: null,
  plan: 'pro',          // 'free' | 'pro' | 'enterprise'
  joinedAt: '2024-01-01T00:00:00Z',
  currency: 'USD',
  timezone: 'America/New_York',
};

/** Mock default user settings */
const defaultSettings = {
  theme: THEME_KEYS.DARK,
  notifications: {
    emailAlerts: true,
    pushAlerts: true,
    priceAlerts: true,
    signalAlerts: true,
  },
  display: {
    defaultAssetType: 'all',
    defaultSort: 'market_cap_desc',
    compactMode: false,
    showPortfolioValue: true,
  },
  trading: {
    riskLevel: 'moderate',  // 'conservative' | 'moderate' | 'aggressive'
    defaultOrderType: 'market',
  },
};

/**
 * Fetches the current user's profile.
 * @returns {Promise<UserProfile>}
 */
export async function getUserProfile() {
  await delay();
  return { ...mockUserProfile };
}

/**
 * Fetches the current user's application settings.
 * Reads from localStorage first, falls back to defaults.
 * @returns {Promise<UserSettings>}
 */
export async function getUserSettings() {
  await delay(100);
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    // Ignore JSON parse errors
  }
  return { ...defaultSettings };
}

/**
 * Persists user settings to localStorage.
 * FUTURE: Also sync to Supabase user_settings table.
 * @param {Partial<UserSettings>} updates
 * @returns {Promise<UserSettings>}
 */
export async function updateUserSettings(updates) {
  await delay(100);
  const current = await getUserSettings();
  const merged = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(merged));
  return merged;
}
