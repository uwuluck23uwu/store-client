/**
 * Border Radius System
 * Consistent border radius values
 */

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
