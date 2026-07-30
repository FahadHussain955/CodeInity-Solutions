import React, { useState } from "react";

/**
 * ColorPalette — Galaxy Theme Reference Page
 * Accessible at: /color-palette (no auth required)
 *
 * Shows all design tokens as interactive swatches with click-to-copy.
 */

const PALETTE = [
  {
    group: "✦ Primary Scale — Indigo / Violet",
    colors: [
      { name: "Galaxy Primary",    cssVar: "--galaxy-primary",  hex: "#818CF8", desc: "Vivid Indigo — buttons, links, focus rings" },
      { name: "Galaxy Dark",       cssVar: "--galaxy-dark",     hex: "#4F46E5", desc: "Deep Indigo — hover / active state" },
      { name: "Galaxy Deeper",     cssVar: "--galaxy-deeper",   hex: "#3730A3", desc: "Darker Indigo — pressed state" },
      { name: "Galaxy Hover",      cssVar: "--galaxy-hover",    hex: "#A5B4FC", desc: "Soft Indigo — lighter hover tint" },
      { name: "Galaxy Light",      cssVar: "--galaxy-light",    hex: "#C7D2FE", desc: "Lavender — muted highlights" },
      { name: "Galaxy Muted",      cssVar: "--galaxy-muted",    hex: "#E0E7FF", desc: "Near-white — subtle tints" },
    ],
  },
  {
    group: "✦ Accent Colors",
    colors: [
      { name: "Nebula Cyan",       cssVar: "--nebula-cyan",     hex: "#22D3EE", desc: "Cyan Nebula Glow — CTAs, active indicators" },
      { name: "Nebula Violet",     cssVar: "--nebula-violet",   hex: "#A855F7", desc: "Violet Nebula — badges, gradients" },
      { name: "Star Gold",         cssVar: "--star-gold",       hex: "#FDE68A", desc: "Star Gold — warnings, premium highlights" },
    ],
  },
  {
    group: "✦ Backgrounds — Deep Space",
    colors: [
      { name: "Deep Space",        cssVar: "--bg-base",         hex: "#05051A", desc: "Page background — deepest space" },
      { name: "Container",         cssVar: "--bg-container",    hex: "#0D0B26", desc: "Panels, modals" },
      { name: "Elevated Surface",  cssVar: "--bg-elevated",     hex: "#151136", desc: "Cards, inputs" },
      { name: "Cosmic Overlay",    cssVar: "--bg-overlay",      hex: "#1E1A4A", desc: "Sidebar, header" },
      { name: "Hover Highlight",   cssVar: "--bg-highlight",    hex: "#252070", desc: "Menu hover, selection" },
    ],
  },
  {
    group: "✦ Text Colors",
    colors: [
      { name: "Cosmic White",      cssVar: "--text-primary",    hex: "#F0F0FF", desc: "Headings, body" },
      { name: "Soft Indigo",       cssVar: "--text-secondary",  hex: "#A5B4FC", desc: "Subtext" },
      { name: "Indigo Muted",      cssVar: "--text-muted",      hex: "#6366F1", desc: "Placeholders, captions" },
      { name: "Text Inverse",      cssVar: "--text-inverse",    hex: "#05051A", desc: "Text on light / glow bg" },
    ],
  },
  {
    group: "✦ Semantic Colors",
    colors: [
      { name: "Success",           cssVar: "--color-success",   hex: "#4ECBA8", desc: "Nebula Teal" },
      { name: "Warning",           cssVar: "--color-warning",   hex: "#FDE68A", desc: "Star Gold" },
      { name: "Error",             cssVar: "--color-error",     hex: "#F87171", desc: "Cosmic Rose" },
      { name: "Info",              cssVar: "--color-info",      hex: "#22D3EE", desc: "Cyan Glow" },
    ],
  },
  {
    group: "✦ Borders & Neutrals",
    colors: [
      { name: "Border",            cssVar: "--border-color",    hex: "#2D2B6B", desc: "Deep indigo border" },
      { name: "Divider",           cssVar: "--divider-color",   hex: "#1A1845", desc: "Subtle divider" },
    ],
  },
];

const GRADIENTS = [
  { label: "Primary Brand",    bg: "linear-gradient(135deg, #818CF8, #A855F7, #22D3EE)" },
  { label: "Deep Space",       bg: "linear-gradient(135deg, #05051A, #151136, #1E1A4A, #252070)" },
  { label: "Accent Glow",      bg: "linear-gradient(135deg, #22D3EE, #818CF8, #A855F7, #FDE68A)" },
];

const CONTRASTS = [
  {
    bg: "#05051A", border: "#2D2B6B",
    label: "Page BG", labelColor: "#6366F1",
    heading: "Heading Text", headingColor: "#F0F0FF",
    body: "Secondary body copy on the deep space background.", bodyColor: "#A5B4FC",
    btn: "Primary Button", btnBg: "#818CF8", btnColor: "#fff",
  },
  {
    bg: "#151136", border: "#2D2B6B",
    label: "Card / Input", labelColor: "#6366F1",
    heading: "Card Heading", headingColor: "#F0F0FF",
    body: "Body text on an elevated card surface.", bodyColor: "#A5B4FC",
    btn: "CTA Button", btnBg: "#22D3EE", btnColor: "#05051A",
  },
  {
    bg: "#1E1A4A", border: "#2D2B6B",
    label: "Sidebar / Header", labelColor: "#6366F1",
    heading: "Nav Title", headingColor: "#F0F0FF",
    body: "Menu items and nav text on overlay bg.", bodyColor: "#A5B4FC",
    btn: "Accent Button", btnBg: "#A855F7", btnColor: "#fff",
  },
  {
    bg: "linear-gradient(135deg,#818CF8,#A855F7)", border: "#818CF8",
    label: "Gradient Surface", labelColor: "rgba(255,255,255,0.7)",
    heading: "Hero Heading", headingColor: "#fff",
    body: "Text on the primary brand gradient.", bodyColor: "rgba(255,255,255,0.85)",
    btn: "Dark Button", btnBg: "#05051A", btnColor: "#F0F0FF",
  },
];

export default function ColorPalette() {
  const [toast, setToast] = useState({ visible: false, hex: "" });

  function copyHex(hex) {
    if (navigator.clipboard) navigator.clipboard.writeText(hex);
    setToast({ visible: true, hex });
    setTimeout(() => setToast({ visible: false, hex: "" }), 2000);
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>✦ Galaxy Design System</div>
        <h1 style={styles.h1}>Color Palette</h1>
        <p style={styles.sub}>Click any swatch to copy the hex value to clipboard</p>
      </div>

      {/* Gradients */}
      <section style={styles.section}>
        <div style={styles.sectionTitle}>✦ Signature Gradients</div>
        {GRADIENTS.map((g) => (
          <div key={g.label}>
            <div style={styles.gradientLabel}>{g.label}</div>
            <div style={{ ...styles.gradientStrip, background: g.bg }} />
          </div>
        ))}
      </section>

      {/* Color Groups */}
      {PALETTE.map((group) => (
        <section key={group.group} style={styles.section}>
          <div style={styles.sectionTitle}>{group.group}</div>
          <div style={styles.grid}>
            {group.colors.map((c) => (
              <ColorCard key={c.hex} item={c} onCopy={copyHex} />
            ))}
          </div>
        </section>
      ))}

      {/* Contrast Preview */}
      <section style={styles.section}>
        <div style={styles.sectionTitle}>✦ Contrast Preview</div>
        <div style={styles.contrastGrid}>
          {CONTRASTS.map((c, i) => (
            <div
              key={i}
              style={{
                ...styles.contrastCard,
                background: c.bg,
                borderColor: c.border,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.7, color: c.labelColor }}>
                {c.label}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: c.headingColor }}>{c.heading}</span>
              <span style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.85, color: c.bodyColor }}>{c.body}</span>
              <span style={{ display: "inline-block", padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: c.btnBg, color: c.btnColor, width: "fit-content", marginTop: 4 }}>
                {c.btn}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Toast */}
      {toast.visible && (
        <div style={styles.toast}>✓ Copied {toast.hex}</div>
      )}
    </div>
  );
}

function ColorCard({ item, onCopy }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.5)" : "none",
      }}
      onClick={() => onCopy(item.hex)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Click to copy ${item.hex}`}
    >
      {/* Actual color swatch */}
      <div style={{ height: 100, width: "100%", background: item.hex, position: "relative" }}>
        {hovered && (
          <span style={styles.copyTip}>Click to copy</span>
        )}
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F0FF", marginBottom: 3 }}>{item.name}</div>
        <div style={{ fontSize: 10.5, fontWeight: 500, color: "#6366F1", fontFamily: "monospace", marginBottom: 6 }}>{item.cssVar}</div>
        <span style={styles.hexBadge}>{item.hex}</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#05051A",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: "#F0F0FF",
    padding: "48px 32px 80px",
  },
  header: { textAlign: "center", marginBottom: 56 },
  badge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #818CF8, #A855F7)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    padding: "4px 14px",
    borderRadius: 9999,
    marginBottom: 16,
  },
  h1: {
    fontSize: 40,
    fontWeight: 800,
    background: "linear-gradient(135deg, #818CF8 30%, #22D3EE 70%, #A855F7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 12,
  },
  sub: { color: "#A5B4FC", fontSize: 15 },
  section: { marginBottom: 48 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#6366F1",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1px solid #2D2B6B",
  },
  gradientLabel: { fontSize: 12, color: "#A5B4FC", marginBottom: 10, fontWeight: 500 },
  gradientStrip: {
    height: 60,
    borderRadius: 14,
    marginBottom: 24,
    border: "1px solid #2D2B6B",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #2D2B6B",
    background: "#151136",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
  },
  copyTip: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    zIndex: 10,
  },
  hexBadge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    fontFamily: "monospace",
    background: "#1E1A4A",
    padding: "3px 8px",
    borderRadius: 6,
    color: "#A5B4FC",
  },
  contrastGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  contrastCard: {
    borderRadius: 14,
    padding: 20,
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  toast: {
    position: "fixed",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#818CF8",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 22px",
    borderRadius: 9999,
    boxShadow: "0 4px 24px rgba(129,140,248,0.5)",
    zIndex: 1000,
    animation: "none",
  },
};
