/**
 * Ant Design Theme Configuration
 * Wires cream & sage design tokens into antd's ConfigProvider.
 */
import { COLORS, FONT } from "./tokens";

const antdTheme = {
  token: {
    // Brand Colors
    colorPrimary: COLORS.sagePrimary,
    colorPrimaryHover: COLORS.sageHover,
    colorPrimaryActive: COLORS.sageDark,
    colorPrimaryBg: COLORS.sageSurface,
    colorPrimaryBorder: COLORS.sageLight,

    // Background
    colorBgBase: COLORS.warmWhite,
    colorBgContainer: COLORS.warmWhite,
    colorBgLayout: COLORS.creamBase,
    colorBgElevated: COLORS.warmWhite,

    // Text
    colorText: COLORS.textPrimary,
    colorTextSecondary: COLORS.textSecondary,
    colorTextTertiary: COLORS.textMuted,
    colorTextPlaceholder: COLORS.textMuted,

    // Border
    colorBorder: COLORS.border,
    colorBorderSecondary: COLORS.divider,

    // Semantic
    colorSuccess: COLORS.success,
    colorWarning: COLORS.warning,
    colorError: COLORS.error,
    colorInfo: COLORS.info,

    // Typography
    fontFamily: FONT.family,
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // Shape
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    // Shadow
    boxShadow: `0 2px 12px ${COLORS.shadow}`,
    boxShadowSecondary: `0 4px 20px ${COLORS.shadow}`,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 8,
    margin: 16,
    marginLG: 24,
    marginSM: 8,

    // Control height
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Button: {
      colorPrimary: COLORS.sagePrimary,
      colorPrimaryHover: COLORS.sageHover,
      colorPrimaryActive: COLORS.sageDark,
      borderRadius: 10,
      controlHeight: 40,
      fontWeight: 600,
    },
    Input: {
      colorBgContainer: COLORS.warmWhite,
      colorBorder: COLORS.border,
      colorPrimaryHover: COLORS.sagePrimary,
      borderRadius: 10,
      controlHeight: 40,
    },
    Select: {
      colorBgContainer: COLORS.warmWhite,
      borderRadius: 10,
      controlHeight: 40,
    },
    Card: {
      colorBgContainer: COLORS.warmWhite,
      borderRadius: 14,
      paddingLG: 24,
    },
    Menu: {
      colorItemBg: "transparent",
      colorItemText: COLORS.textSecondary,
      colorItemTextSelected: COLORS.sagePrimary,
      colorItemBgSelected: COLORS.sageSurface,
      colorItemTextHover: COLORS.sagePrimary,
      colorItemBgHover: COLORS.sageSurface,
      borderRadius: 10,
    },
    Layout: {
      colorBgHeader: COLORS.warmWhite,
      colorBgBody: COLORS.creamBase,
      colorBgSider: COLORS.warmWhite,
    },
    Table: {
      colorBgContainer: COLORS.warmWhite,
      borderRadius: 14,
    },
    Tag: {
      borderRadius: 6,
    },
  },
};

export default antdTheme;
