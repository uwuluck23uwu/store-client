/**
 * Theme System - Main Export
 * Central theme configuration for the entire app
 */

import { colors } from './colors';
import { spacing } from './spacing';
import { fontSize, fontWeight, lineHeight } from './typography';
import { borderRadius } from './borderRadius';
import { shadow } from './shadows';

export const theme = {
  colors,
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  borderRadius,
  shadow,
} as const;

// Re-export individual modules
export { colors } from './colors';
export { spacing } from './spacing';
export { fontSize, fontWeight, lineHeight } from './typography';
export { borderRadius } from './borderRadius';
export { shadow } from './shadows';

// Type exports
export type Theme = typeof theme;
