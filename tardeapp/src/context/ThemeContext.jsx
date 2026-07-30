// =============================================================================
// THEME CONTEXT
// Manages light/dark mode across the app.
// Persists preference to localStorage.
// =============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { THEME_KEYS } from '../constants/appConstants';

// ─── Context Creation ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} ThemeContextValue
 * @property {'light' | 'dark'} theme - Current theme
 * @property {boolean} isDark - Convenience boolean
 * @property {() => void} toggleTheme - Toggles between light and dark
 * @property {(theme: string) => void} setTheme - Set theme directly
 */

/** @type {React.Context<ThemeContextValue>} */
export const ThemeContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * ThemeProvider — wraps the app and provides theme state.
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Read from localStorage on initial mount
    try {
      return localStorage.getItem(THEME_KEYS.STORAGE_KEY) ?? THEME_KEYS.DARK;
    } catch {
      return THEME_KEYS.DARK;
    }
  });

  // Sync theme to <html> data attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEYS.STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) =>
      prev === THEME_KEYS.DARK ? THEME_KEYS.LIGHT : THEME_KEYS.DARK
    );
  };

  const setTheme = (newTheme) => {
    if (Object.values(THEME_KEYS).includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const value = {
    theme,
    isDark: theme === THEME_KEYS.DARK,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useTheme — consume ThemeContext. Must be used inside ThemeProvider.
 * @returns {ThemeContextValue}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
