/**
 * Design Tokens — Galaxy Theme ✦
 * Single source of truth for all design values.
 * Used by: antdTheme.js, global.css
 *
 * ── Galaxy Palette ──────────────────────────────────────────
 *   #F0F0FF — Cosmic White        (text / starlight)
 *   #A5B4FC — Soft Indigo         (secondary text)
 *   #818CF8 — Vivid Indigo        (primary brand)
 *   #A855F7 — Violet Nebula       (accent / purple)
 *   #22D3EE — Cyan Nebula Glow    (CTA accent / active)
 *   #4F46E5 — Deep Indigo         (hover / active states)
 *   #1E1A4A — Cosmic Overlay      (sidebar / header)
 *   #151136 — Elevated Surface    (cards / inputs)
 *   #0D0B26 — Container           (panels)
 *   #05051A — Deep Space          (page background)
 *   #FDE68A — Star Gold           (warnings / highlights)
 * ────────────────────────────────────────────────────────────
 */

export const COLORS = {
  // ── Primary Scale (Indigo/Violet) ──────────────────────────
  galaxyPrimary:  "#818CF8",  // Vivid Indigo  — buttons, links, focus rings
  galaxyDark:     "#4F46E5",  // Deep Indigo   — hover / active state
  galaxyDeeper:   "#3730A3",  // Darker Indigo — pressed state
  galaxyHover:    "#A5B4FC",  // Soft Indigo   — lighter hover tint
  galaxyLight:    "#C7D2FE",  // Lavender      — muted highlights
  galaxyMuted:    "#E0E7FF",  // Near-white    — very subtle tints

  // ── Accent Colors ──────────────────────────────────────────
  nebulaCyan:     "#22D3EE",  // Cyan Nebula Glow — CTAs, active indicators
  nebulaViolet:   "#A855F7",  // Violet Nebula    — special badges, gradients
  starGold:       "#FDE68A",  // Star Gold        — warnings, premium highlights

  // ── Backgrounds (dark space) ───────────────────────────────
  bgBase:         "#05051A",  // Deep Space        — page background
  bgContainer:    "#0D0B26",  // Container         — panels, modals
  bgElevated:     "#151136",  // Elevated Surface  — cards, inputs
  bgOverlay:      "#1E1A4A",  // Cosmic Overlay    — sidebar, header
  bgHighlight:    "#252070",  // Hover highlight   — menu item hover

  // ── Text ───────────────────────────────────────────────────
  textPrimary:    "#F0F0FF",  // Cosmic White   — headings, body
  textSecondary:  "#A5B4FC",  // Soft Indigo    — subtext
  textMuted:      "#6366F1",  // Indigo Muted   — placeholders, captions
  textInverse:    "#05051A",  // Deep Space     — text on light/glow bg

  // ── Semantic ───────────────────────────────────────────────
  success:        "#4ECBA8",  // Nebula Teal
  warning:        "#FDE68A",  // Star Gold
  error:          "#F87171",  // Cosmic Rose
  info:           "#22D3EE",  // Cyan Glow

  // ── Borders & Neutrals ─────────────────────────────────────
  border:         "#2D2B6B",  // Deep indigo border
  divider:        "#1A1845",  // Subtle divider
  shadow:         "rgba(5, 5, 26, 0.70)",
};

export const FONT = {
  family: "'Plus Jakarta Sans', sans-serif",
  weights: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  sizes: {
    xs:    "11px",
    sm:    "13px",
    base:  "14px",
    md:    "16px",
    lg:    "18px",
    xl:    "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
  },
};

export const SPACING = {
  xs:    "4px",
  sm:    "8px",
  md:    "16px",
  lg:    "24px",
  xl:    "32px",
  "2xl": "48px",
  "3xl": "64px",
};

export const BORDER_RADIUS = {
  sm:   "6px",
  md:   "10px",
  lg:   "14px",
  xl:   "20px",
  full: "9999px",
};

export const BREAKPOINTS = {
  sm:  "576px",
  md:  "768px",
  lg:  "992px",
  xl:  "1200px",
  xxl: "1600px",
};
