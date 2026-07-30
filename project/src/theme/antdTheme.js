/**
 * Ant Design Theme Configuration
 * Wires Galaxy design tokens into antd's ConfigProvider.
 *
 * IMPORTANT: `algorithm: theme.darkAlgorithm` MUST be set so antd v6 stops
 * injecting its default light (cream/white) backgrounds onto body & layout.
 */
import { theme } from "antd";
import { COLORS, FONT } from "./tokens";

const antdTheme = {
  algorithm: theme.darkAlgorithm,   // ← REQUIRED: forces antd dark mode base

  token: {
    // ── Brand Colors ──────────────────────────────────────────
    colorPrimary:        COLORS.galaxyPrimary,   // Vivid Indigo
    colorPrimaryHover:   COLORS.galaxyDark,      // Deep Indigo
    colorPrimaryActive:  COLORS.galaxyDeeper,    // Darker Indigo
    colorPrimaryBg:      COLORS.bgElevated,      // Dark elevated surface
    colorPrimaryBorder:  COLORS.galaxyDark,

    // ── Backgrounds ───────────────────────────────────────────
    colorBgBase:         COLORS.bgBase,
    colorBgContainer:    COLORS.bgElevated,
    colorBgLayout:       COLORS.bgBase,
    colorBgElevated:     COLORS.bgOverlay,
    colorBgSpotlight:    COLORS.bgHighlight,

    // ── Text ──────────────────────────────────────────────────
    colorText:           COLORS.textPrimary,
    colorTextSecondary:  COLORS.textSecondary,
    colorTextTertiary:   COLORS.textMuted,
    colorTextPlaceholder:COLORS.textMuted,
    colorTextDisabled:   COLORS.textMuted,

    // ── Borders ───────────────────────────────────────────────
    colorBorder:         COLORS.border,
    colorBorderSecondary:COLORS.divider,

    // ── Semantic ──────────────────────────────────────────────
    colorSuccess:        COLORS.success,
    colorWarning:        COLORS.warning,
    colorError:          COLORS.error,
    colorInfo:           COLORS.info,

    // ── Link ──────────────────────────────────────────────────
    colorLink:           COLORS.nebulaCyan,
    colorLinkHover:      COLORS.galaxyLight,

    // ── Typography ────────────────────────────────────────────
    fontFamily:   FONT.family,
    fontSize:     14,
    fontSizeLG:   16,
    fontSizeSM:   12,

    // ── Shape ─────────────────────────────────────────────────
    borderRadius:   10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    // ── Shadows ───────────────────────────────────────────────
    boxShadow:          `0 2px 12px ${COLORS.shadow}`,
    boxShadowSecondary: `0 4px 24px ${COLORS.shadow}`,

    // ── Spacing ───────────────────────────────────────────────
    padding:   16,
    paddingLG: 24,
    paddingSM: 8,
    margin:    16,
    marginLG:  24,
    marginSM:  8,

    // ── Control Heights ───────────────────────────────────────
    controlHeight:   40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },

  components: {
    Button: {
      colorPrimary:       COLORS.galaxyPrimary,
      colorPrimaryHover:  COLORS.galaxyDark,
      colorPrimaryActive: COLORS.galaxyDeeper,
      borderRadius: 10,
      controlHeight: 40,
      fontWeight: 600,
    },
    Input: {
      colorBgContainer:    COLORS.bgElevated,
      colorBorder:         COLORS.border,
      colorPrimaryHover:   COLORS.galaxyPrimary,
      colorText:           COLORS.textPrimary,
      colorTextPlaceholder:COLORS.textMuted,
      activeBg:            COLORS.bgOverlay,
      borderRadius: 10,
      controlHeight: 40,
    },
    Select: {
      colorBgContainer:   COLORS.bgElevated,
      colorBorder:        COLORS.border,
      colorText:          COLORS.textPrimary,
      optionSelectedBg:   COLORS.bgHighlight,
      borderRadius: 10,
      controlHeight: 40,
    },
    Card: {
      colorBgContainer: COLORS.bgElevated,
      colorBorderSecondary: COLORS.border,
      borderRadius: 14,
      paddingLG: 24,
    },
    Menu: {
      colorItemBg:          "transparent",
      colorItemText:        COLORS.textSecondary,
      colorItemTextSelected:COLORS.galaxyPrimary,
      colorItemBgSelected:  COLORS.bgHighlight,
      colorItemTextHover:   COLORS.galaxyLight,
      colorItemBgHover:     COLORS.bgElevated,
      colorActiveBarBorderSize: 0,
      borderRadius: 10,
    },
    Layout: {
      colorBgHeader: COLORS.bgOverlay,
      colorBgBody:   COLORS.bgBase,
      colorBgSider:  COLORS.bgOverlay,
    },
    Table: {
      colorBgContainer:   COLORS.bgContainer,
      colorText:          COLORS.textPrimary,
      headerBg:           COLORS.bgOverlay,
      rowHoverBg:         COLORS.bgHighlight,
      borderColor:        COLORS.border,
      borderRadius: 14,
    },
    Modal: {
      colorBgElevated:    COLORS.bgOverlay,
      colorText:          COLORS.textPrimary,
      colorIcon:          COLORS.textSecondary,
    },
    Dropdown: {
      colorBgElevated:    COLORS.bgOverlay,
      colorText:          COLORS.textPrimary,
      controlItemBgHover: COLORS.bgHighlight,
    },
    Tag: {
      colorBgContainer:  COLORS.bgElevated,
      colorText:         COLORS.galaxyLight,
      colorBorder:       COLORS.border,
      borderRadius: 6,
    },
    Badge: {
      colorBgContainer: COLORS.nebulaCyan,
    },
    Tabs: {
      colorPrimary:           COLORS.galaxyPrimary,
      colorBorderSecondary:   COLORS.border,
      inkBarColor:            COLORS.nebulaCyan,
      itemSelectedColor:      COLORS.galaxyPrimary,
      itemHoverColor:         COLORS.galaxyLight,
      itemColor:              COLORS.textSecondary,
    },
  },
};

export default antdTheme;
