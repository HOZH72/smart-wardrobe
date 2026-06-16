/**
 * محرك تنسيق الألوان - حساب التوافق اللوني بين القطع
 * Color harmony engine
 */
import { isColorCompatible, ColorHarmonyRules } from '../../constants/harmonyRules';
import type { ClothingItem } from '../../models/ClothingItem';

/** درجة التوافق بين لونين (0-1) */
function pairScore(color1: string, color2: string): number {
  if (!color1 || !color2) return 0.5;
  if (color1 === color2) return 0.6; // نفس اللون مقبول وليس ممتازاً
  if (isColorCompatible(color1, color2)) return 1.0;
  // ألوان متجاورة (محايد)
  return 0.3;
}

/** الحصول على سبب التوافق بين لونين */
export function getHarmonyReason(color1: string, color2: string): string {
  if (!color1 || !color2) return 'لون غير معروف';

  if (color1 === color2) {
    return `تنسيق أحادي اللون: ${color1} مع ${color2}`;
  }

  const rules = ColorHarmonyRules[color1];
  if (rules?.includes('*')) {
    return `${color1} لون محايد يتناسب مع ${color2}`;
  }

  if (isColorCompatible(color1, color2)) {
    return `${color1} و ${color2} متناسقان حسب قواعد تنسيق الألوان`;
  }

  return `${color1} و ${color2} قد لا يكونان متناسقين تماماً`;
}

/** حساب درجة توافق الألوان لمجموعة من القطع (0-1) */
export function calculateColorScore(items: ClothingItem[]): number {
  if (items.length <= 1) return 1.0;

  let totalScore = 0;
  let pairs = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalScore += pairScore(items[i].colorName, items[j].colorName);
      pairs++;
    }
  }

  return pairs > 0 ? totalScore / pairs : 1.0;
}

/** الحصول على تفصيل أسباب توافق الألوان */
export function getColorHarmonyDetails(items: ClothingItem[]): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (items.length <= 1) {
    if (items.length === 1) {
      reasons.push(`لون القطعة: ${items[0].colorName} (مفردة، لا تحتاج تنسيق)`);
    }
    return { score: 1.0, reasons };
  }

  let totalScore = 0;
  let pairs = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const c1 = items[i].colorName;
      const c2 = items[j].colorName;
      const s = pairScore(c1, c2);
      totalScore += s;
      pairs++;
      reasons.push(
        `${items[i].type} (${c1}) ↔ ${items[j].type} (${c2}): ${getHarmonyReason(c1, c2)}`
      );
    }
  }

  return { score: pairs > 0 ? totalScore / pairs : 1.0, reasons };
}
