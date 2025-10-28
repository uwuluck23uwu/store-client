/**
 * Typography System
 * Consistent font sizes, weights, and line heights
 */

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  display: 36,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
export type LineHeightKey = keyof typeof lineHeight;
