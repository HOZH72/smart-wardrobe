/**
 * محرك الإطلالات الرئيسي - يجمع كل محركات التقييم
 * Main outfit engine that combines all scoring engines
 */
import type { ClothingItem, OutfitSuggestion, CompatibilityScore } from '../../models/ClothingItem';
import * as clothingRepo from '../database/clothingRepository';
import { calculateColorScore, getColorHarmonyDetails } from './colorHarmony';
import { calculateTypeScore, getTypeCompatibilityDetails } from './typeCompatibility';
import { calculateSeasonScore, getSeasonDetails, getCurrentSeason } from './seasonMatcher';
import { calculateOccasionScore, getOccasionDetails } from './occasionMatcher';

// ── الحساب ────────────────────────────────────────────────

/** حساب درجة التوافق الكاملة لمجموعة قطع */
export function calculateCompatibility(
  items: ClothingItem[],
  options?: {
    targetSeason?: string;
    targetOccasion?: string;
  }
): CompatibilityScore {
  const colorResult = getColorHarmonyDetails(items);
  const typeResult = getTypeCompatibilityDetails(items);
  const seasonResult = getSeasonDetails(items, options?.targetSeason as any);
  const occasionResult = getOccasionDetails(items, options?.targetOccasion);

  const reasons: string[] = [
    ...colorResult.reasons,
    ...typeResult.reasons,
    ...seasonResult.reasons,
    ...occasionResult.reasons,
  ];

  // الأوزان: لون 30%، نوع 30%، موسم 20%، مناسبة 20%
  const weights = { color: 0.3, type: 0.3, season: 0.2, occasion: 0.2 };
  const total =
    colorResult.score * weights.color +
    typeResult.score * weights.type +
    seasonResult.score * weights.season +
    occasionResult.score * weights.occasion;

  return {
    total: Math.round(total * 100) / 100,
    colorScore: Math.round(colorResult.score * 100) / 100,
    typeScore: Math.round(typeResult.score * 100) / 100,
    seasonScore: Math.round(seasonResult.score * 100) / 100,
    occasionScore: Math.round(occasionResult.score * 100) / 100,
    reasons,
  };
}

// ── التوصيات ───────────────────────────────────────────────

/** إنشاء إطلالة من قائمة قطع (تجميع المنطق) */
function buildSuggestion(items: ClothingItem[]): OutfitSuggestion | null {
  if (items.length < 2) return null;
  const score = calculateCompatibility(items);
  return { items, score };
}

/** ترتيب الاقتراحات حسب الجودة */
function sortByScore(suggestions: OutfitSuggestion[]): OutfitSuggestion[] {
  return suggestions.sort((a, b) => b.score.total - a.score.total);
}

/**
 * اقتراح إطلالات مبنية على قطعة معينة
 * يجب أن تحتوي كل إطلالة على القطعة المحددة
 */
export async function recommendByItem(
  itemId: string,
  limit = 10
): Promise<OutfitSuggestion[]> {
  const baseItem = await clothingRepo.getById(itemId);
  if (!baseItem) return [];

  const allItems = await clothingRepo.getAll();
  const others = allItems.filter((i) => i.id !== itemId);

  const suggestions: OutfitSuggestion[] = [];

  // توليد ازواج (القطعة الأساسية + قطعة أخرى)
  for (const other of others) {
    const combo = [baseItem, other];
    const suggestion = buildSuggestion(combo);
    if (suggestion) suggestions.push(suggestion);
  }

  // توليد ثلاثيات
  for (let i = 0; i < others.length; i++) {
    for (let j = i + 1; j < others.length; j++) {
      const combo = [baseItem, others[i], others[j]];
      const suggestion = buildSuggestion(combo);
      if (suggestion) suggestions.push(suggestion);
    }
  }

  return sortByScore(suggestions).slice(0, limit);
}

/**
 * اقتراح إطلالات مناسبة لمناسبة محددة
 */
export async function recommendByOccasion(
  occasion: string,
  limit = 10
): Promise<OutfitSuggestion[]> {
  const items = await clothingRepo.getByOccasion(occasion);
  if (items.length < 2) return [];

  const suggestions: OutfitSuggestion[] = [];

  // ثنائيات
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const combo = [items[i], items[j]];
      const suggestion = buildSuggestion(combo);
      if (suggestion) suggestions.push(suggestion);
    }
  }

  // ثلاثيات (محدودة لتجنب الانفجار)
  const maxTriplets = 30;
  let triplets = 0;
  for (let i = 0; i < items.length && triplets < maxTriplets; i++) {
    for (let j = i + 1; j < items.length && triplets < maxTriplets; j++) {
      for (let k = j + 1; k < items.length && triplets < maxTriplets; k++) {
        const combo = [items[i], items[j], items[k]];
        const suggestion = buildSuggestion(combo);
        if (suggestion) {
          suggestions.push(suggestion);
          triplets++;
        }
      }
    }
  }

  return sortByScore(suggestions).slice(0, limit);
}

/**
 * إطلالة عشوائية (ذكية) — تختار أفضل إطلالة عشوائية
 */
export async function randomOutfit(): Promise<OutfitSuggestion | null> {
  const items = await clothingRepo.getAll();
  if (items.length < 2) return null;

  // خلط واختيار عشوائي
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(3 + Math.floor(Math.random() * 2), shuffled.length));

  // حاول عدة مرات للحصول على إطلالة معقولة
  for (let attempt = 0; attempt < 5; attempt++) {
    const suggestion = buildSuggestion(selected);
    if (suggestion && suggestion.score.total >= 0.4) return suggestion;

    // أعد الخلط واختيار جديد
    const reshuffled = [...items].sort(() => Math.random() - 0.5);
    const reselected = reshuffled.slice(
      0,
      Math.min(2 + Math.floor(Math.random() * 3), reshuffled.length)
    );
    const retry = buildSuggestion(reselected);
    if (retry) return retry;
  }

  // الملاذ الأخير: أي إطلالة
  const fallback = buildSuggestion(items.slice(0, 2));
  return fallback;
}

/**
 * أفضل الإطلالات بناءً على جميع القطع المتاحة
 */
export async function getBestOutfits(limit = 10): Promise<OutfitSuggestion[]> {
  const allItems = await clothingRepo.getAll();
  if (allItems.length < 2) return [];

  const suggestions: OutfitSuggestion[] = [];

  // ثنائيات (أفضل مصدر)
  for (let i = 0; i < allItems.length; i++) {
    for (let j = i + 1; j < allItems.length; j++) {
      const combo = [allItems[i], allItems[j]];
      const suggestion = buildSuggestion(combo);
      if (suggestion && suggestion.score.total >= 0.5) {
        suggestions.push(suggestion);
      }
    }
  }

  return sortByScore(suggestions).slice(0, limit);
}

/** الحصول على توصيات سريعة للإطلالة اليومية */
export async function getDailySuggestion(): Promise<OutfitSuggestion | null> {
  const currentSeason = getCurrentSeason();
  const filtered = await clothingRepo.getBySeason(currentSeason);

  if (filtered.length >= 2) {
    const best = await recommendByOccasion('casual', 5);
    if (best.length > 0) return best[0];
  }

  // إذا لم تكن هناك قطع للموسم، استخدم كل القطع
  return randomOutfit();
}
