/**
 * ألوان التطبيق الأساسية
 * Smart Wardrobe - Color Palette
 */
export const Colors = {
  primary: '#6C63FF',
  primaryLight: '#8B7FFF',
  primaryDark: '#5A52E0',
  secondary: '#FF6584',
  secondaryLight: '#FF8FA3',

  background: '#0F0F1A',
  surface: '#1A1A2E',
  card: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.05)',

  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: 'rgba(255,255,255,0.4)',
  textMuted: 'rgba(255,255,255,0.2)',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF5252',
  info: '#6C63FF',

  gradientPrimary: ['#6C63FF', '#5A52E0'] as [string, string],
  gradientAccent: ['#6C63FF', '#FF6584'] as [string, string],
  gradientSecondary: ['#FF6584', '#FF8FA3'] as [string, string],
  gradientSuccess: ['#43A047', '#66BB6A'] as [string, string],
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
} as const;

/**
 * أسماء الألوان بالعربية
 */
export const ColorNames: Record<string, string> = {
  Red: 'أحمر',
  Blue: 'أزرق',
  Green: 'أخضر',
  Yellow: 'أصفر',
  Pink: 'وردي',
  Navy: 'كحلي',
  Brown: 'بني',
  Orange: 'برتقالي',
  Purple: 'بنفسجي',
  Black: 'أسود',
  White: 'أبيض',
  Gray: 'رمادي',
  Beige: 'بيج',
  Coral: 'مرجاني',
  Olive: 'زيتوني',
  Teal: 'شرسي',
};

export const colorNameAr = (name: string): string =>
  ColorNames[name] ?? name;
