/**
 * قواعد تنسيق الألوان - مصفوفة التوافق
 */
export const ColorHarmonyRules: Record<string, string[]> = {
  Red: ['Black', 'White', 'Beige', 'Navy'],
  Blue: ['White', 'Gray', 'Beige', 'Black', 'Navy'],
  Green: ['White', 'Black', 'Beige', 'Brown'],
  Yellow: ['Blue', 'Black', 'White', 'Navy'],
  Pink: ['White', 'Black', 'Gray', 'Navy', 'Beige'],
  Navy: ['White', 'Beige', 'Red', 'Pink', 'Gray'],
  Brown: ['White', 'Beige', 'Green', 'Blue'],
  Orange: ['Navy', 'Black', 'White', 'Gray'],
  Purple: ['White', 'Black', 'Gray', 'Pink'],
  Black: ['*'], // محايد - يتوافق مع الكل
  White: ['*'], // محايد
  Gray: ['*'], // محايد
  Beige: ['*'], // محايد
  Coral: ['White', 'Black', 'Navy', 'Beige'],
  Olive: ['White', 'Black', 'Beige', 'Brown', 'Navy'],
  Teal: ['White', 'Black', 'Beige', 'Navy', 'Gray'],
};

export const isColorCompatible = (color1: string, color2: string): boolean => {
  if (color1 === color2) return true;
  const rules = ColorHarmonyRules[color1];
  if (!rules) return false;
  if (rules.includes('*')) return true;
  return rules.includes(color2);
};
