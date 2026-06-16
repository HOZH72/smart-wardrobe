/**
 * مطابقة الموسم - تقييم توافق القطع مع الموسم الحالي
 * Season matching engine
 */
import type { ClothingItem } from '../../models/ClothingItem';
import { TypeSeasonMap, SeasonData } from '../../constants/seasons';
import type { Season } from '../../constants/seasons';

/** موسم تلقائي بناءً على الشهر الحالي */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-based
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/** الحصول على الموسم الافتراضي لنوع قطعة */
export function getDefaultSeasonForType(type: string): Season {
  return TypeSeasonMap[type] ?? 'all';
}

/** درجة توافق قطعة مع موسم معين (0-1) */
export function seasonCompatibility(
  itemSeason: string,
  targetSeason: string
): number {
  if (itemSeason === 'all' || targetSeason === 'all') return 1.0;
  if (itemSeason === targetSeason) return 1.0;

  // مواسم متجاورة مقبولة
  const adjacent: Record<string, string[]> = {
    spring: ['summer', 'autumn'],
    summer: ['spring', 'autumn'],
    autumn: ['summer', 'winter'],
    winter: ['autumn', 'spring'],
  };

  if (adjacent[itemSeason]?.includes(targetSeason)) return 0.6;
  return 0.2; // موسم معاكس
}

/** حساب درجة توافق الموسم لمجموعة قطع مع موسم مستهدف */
export function calculateSeasonScore(
  items: ClothingItem[],
  targetSeason?: Season
): number {
  const season = targetSeason ?? getCurrentSeason();
  if (items.length === 0) return 1.0;

  let totalScore = 0;
  for (const item of items) {
    totalScore += seasonCompatibility(item.season, season);
  }
  return totalScore / items.length;
}

/** الحصول على تفصيل توافق الموسم */
export function getSeasonDetails(
  items: ClothingItem[],
  targetSeason?: Season
): {
  score: number;
  season: Season;
  seasonLabel: string;
  reasons: string[];
} {
  const season = targetSeason ?? getCurrentSeason();
  const seasonLabel = SeasonData[season]?.nameAr ?? season;
  const reasons: string[] = [];

  if (items.length === 0) {
    return { score: 1.0, season, seasonLabel, reasons: ['لا توجد قطع'] };
  }

  let totalScore = 0;
  let hasMismatch = false;

  for (const item of items) {
    const comp = seasonCompatibility(item.season, season);
    totalScore += comp;
    if (comp >= 1.0) {
      reasons.push(`✓ ${item.type} مناسب لـ ${seasonLabel}`);
    } else if (comp >= 0.6) {
      reasons.push(`~ ${item.type} مقبول لـ ${seasonLabel}`);
    } else {
      reasons.push(`✗ ${item.type} غير مناسب لـ ${seasonLabel}`);
      hasMismatch = true;
    }
  }

  if (hasMismatch) {
    reasons.push(`💡 قد تحتاج لطبقات إضافية لتناسب ${seasonLabel}`);
  }

  return {
    score: totalScore / items.length,
    season,
    seasonLabel,
    reasons,
  };
}
