/**
 * Design Tokens — Cream & Sage Theme
 * Single source of truth for all design values.
 * Used by: antdTheme.js, global.css
 */

export const COLORS = {
  // Sage Green
  sagePrimary: "#6B8F6A",
  sageDark: "#4A6741",
  sageHover: "#5C7D5B",
  sageLight: "#A8C5A0",
  sageMuted: "#C9DDCA",
  sageSurface: "#EAF0EA",

  // Cream
  creamBase: "#F5F0E8",
  creamDark: "#EAE0D0",
  creamDeeper: "#D4C4A0",
  warmWhite: "#FDFAF6",

  // Text
  textPrimary: "#2C3825",
  textSecondary: "#5A6B55",
  textMuted: "#8A9B85",
  textInverse: "#FFFFFF",

  // Semantic
  success: "#6B8F6A",
  warning: "#C9A84C",
  error: "#C0574B",
  info: "#5A7FA0",

  // Neutrals
  border: "#D4C8B8",
  divider: "#E5DDD0",
  shadow: "rgba(44, 56, 37, 0.10)",
};

export const FONT = {
  family: "'Plus Jakarta Sans', sans-serif",
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    xs: "11px",
    sm: "13px",
    base: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
  },
};

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
};

export const BORDER_RADIUS = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  full: "9999px",
};

export const BREAKPOINTS = {
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  xxl: "1600px",
};
