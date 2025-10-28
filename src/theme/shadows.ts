/**
 * Shadow System
 * Consistent shadow elevations for iOS and Android
 */

import { Platform } from 'react-native';

export const shadow = {
  none: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
  }),

  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),

  base: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),

  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  }),

  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),

  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    android: {
      elevation: 12,
    },
  }),
} as const;

export type ShadowKey = keyof typeof shadow;
