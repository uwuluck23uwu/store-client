/**
 * Color Palette - Modern Green Theme
 * Centralized color definitions for consistent theming across the app
 */

export const colors = {
  // Primary Colors
  primary: "#4CAF50",
  primaryDark: "#059669",
  primaryLight: "#D1FAE5",

  // Secondary & Accent
  secondary: "#3B82F6",
  secondaryLight: "#DBEAFE",
  accent: "#F59E0B",
  accentLight: "#FEF3C7",

  // Semantic Colors
  success: "#4CAF50",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  // Neutral Colors
  background: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceHover: "#F3F4F6",

  // Text Colors
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textDisabled: "#D1D5DB",
  textInverse: "#FFFFFF",

  // Border & Divider
  border: "#E5E7EB",
  borderDark: "#D1D5DB",
  divider: "#F3F4F6",

  // Special
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.1)",

  // Status
  online: "#4CAF50",
  offline: "#6B7280",

  // Product Specific
  price: "#4CAF50",
  discount: "#EF4444",
  rating: "#F59E0B",
} as const;

export type ColorKey = keyof typeof colors;
