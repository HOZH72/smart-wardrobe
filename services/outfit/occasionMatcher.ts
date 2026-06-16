/**
 * مطابقة المناسبة - تقييم توافق القطع مع المناسبة
 * Occasion matching engine
 */
import type { ClothingItem } from '../../models/ClothingItem';
import { OccasionTypeMap } from '../../models/Occasion';

/** درجة توافق نوع قطعة مع مناسبة (0-1) */
function typeOccasionScore(type: string, occasion: string): number {
  const allowedTypes = OccasionTypeMap[occasion];
  if (!allowedTypes) return 0.5;
  if (allowedTypes.includes(type)) return 1.0;

  // أنواع شبه مناسبة — مقبولة جزئياً
  const semiRelevant: Record<string, string[]> = {
    work: ['shoes', 'bag', 'accessories'],
    casual: ['pants', 'blouse'],
    party: ['shoes', 'blouse', 'pants'],
    sport: ['sweater_hoodie'],
    formal: ['shoes', 'bag', 'accessories'],
    date: ['pants', 'shoes', 'bag'],
    travel: ['jacket', 'shorts'],
    home: ['pants', 'shorts'],
  };

  return semiRelevant[occasion]?.includes(type) ? 0.5 : 0.2;
}

/** حساب درجة توافق المناسبة لمجموعة قطع */
export function calculateOccasionScore(
  items: ClothingItem[],
  targetOccasion?: string
): number {
  // إذا لم تحدد مناسبة، نأخذ أكثر مناسبة شيوعاً بين القطع
  const occasion = targetOccasion ?? getMostCommonOccasion(items);

  if (items.length === 0) return 1.0;

  let totalScore = 0;
  for (const item of items) {
    totalScore += typeOccasionScore(item.type, occasion);
  }
  return totalScore / items.length;
}

/** الحصول على أكثر مناسبة شيوعاً بين القطع */
export function getMostCommonOccasion(items: ClothingItem[]): string {
  if (items.length === 0) return 'casual';
  const freq: Record<string, number> = {};
  for (const item of items) {
    freq[item.occasion] = (freq[item.occasion] ?? 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'casual';
}

/** الحصول على تفصيل توافق المناسبة */
export function getOccasionDetails(
  items: ClothingItem[],
  targetOccasion?: string
): {
  score: number;
  occasion: string;
  reasons: string[];
} {
  const occasion = targetOccasion ?? getMostCommonOccasion(items);
  const reasons: string[] = [];

  if (items.length === 0) {
    return { score: 1.0, occasion, reasons: ['لا توجد قطع'] };
  }

  let totalScore = 0;
  for (const item of items) {
    const s = typeOccasionScore(item.type, occasion);
    totalScore += s;
    if (s >= 1.0) {
      reasons.push(`✓ ${item.type} مناسب لـ ${occasion}`);
    } else if (s >= 0.5) {
      reasons.push(`~ ${item.type} مقبول لـ ${occasion}`);
    } else {
      reasons.push(`✗ ${item.type} غير مناسب لـ ${occasion}`);
    }
  }

  return { score: totalScore / items.length, occasion, reasons };
}
