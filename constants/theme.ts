/**
 * topscore App Theme - IIT Foundation & Medical
 * Color Palette: Orange + Dark Blue (matching logo colors)
 */

import { Platform } from 'react-native';

// Theme Colors - Matching topscore Logo
export const ThemeColors = {
  orange: '#1E2F44',        // Primary orange from logo circle
  deepBlue: '#0B3C5D',      // Dark blue from topscore logo
  lightNeutral: '#FAFAFA',
  grayText: '#424242',
  white: '#FFFFFF',
  darkBackground: '#0A2E3D',
  // Legacy support - map to new colors
  cyan: '#FF6B35',          // Map cyan to orange for backward compatibility
};

const tintColorLight = ThemeColors.orange;
const tintColorDark = ThemeColors.orange;

export const Colors = {
  light: {
    text: ThemeColors.grayText,
    background: ThemeColors.lightNeutral,
    tint: tintColorLight,
    icon: ThemeColors.grayText,
    tabIconDefault: ThemeColors.grayText,
    tabIconSelected: tintColorLight,
    primary: ThemeColors.orange,
    secondary: ThemeColors.deepBlue,
    card: ThemeColors.white,
    border: '#E0E0E0',
  },
  dark: {
    text: ThemeColors.lightNeutral,
    background: ThemeColors.darkBackground,
    tint: tintColorDark,
    icon: ThemeColors.lightNeutral,
    tabIconDefault: ThemeColors.lightNeutral,
    tabIconSelected: tintColorDark,
    primary: ThemeColors.orange,
    secondary: ThemeColors.deepBlue,
    card: '#1A3D4D',
    border: '#2A4D5D',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
