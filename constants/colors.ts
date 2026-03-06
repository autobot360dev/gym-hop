const BRAND = {
  primary: "#F97316",
  primaryDark: "#EA6C0D",
  primaryLight: "#FED7AA",
  success: "#22C55E",
  successLight: "#DCFCE7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  warning: "#F59E0B",
  accent: "#3B82F6",
  accentLight: "#DBEAFE",
};

const DARK = {
  background: "#09090B",
  surface: "#18181B",
  card: "#27272A",
  border: "#3F3F46",
  borderLight: "#52525B",
  text: "#FAFAFA",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
};

const LIGHT = {
  background: "#FAFAFA",
  surface: "#F4F4F5",
  card: "#FFFFFF",
  border: "#E4E4E7",
  borderLight: "#D4D4D8",
  text: "#09090B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
};

export default {
  brand: BRAND,
  dark: DARK,
  light: LIGHT,
  light: {
    ...LIGHT,
    tint: BRAND.primary,
    tabIconDefault: LIGHT.textMuted,
    tabIconSelected: BRAND.primary,
  },
};

export { BRAND, DARK, LIGHT };
