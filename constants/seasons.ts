/**
 * الموسم - تصنيف القطع حسب الموسم
 */
export type Season = 'summer' | 'winter' | 'spring' | 'autumn' | 'all';

export const SeasonData: Record<Season, { nameAr: string; nameEn: string; icon: string }> = {
  summer: { nameAr: 'صيفي', nameEn: 'Summer', icon: '☀️' },
  winter: { nameAr: 'شتوي', nameEn: 'Winter', icon: '❄️' },
  spring: { nameAr: 'ربيعي', nameEn: 'Spring', icon: '🌸' },
  autumn: { nameAr: 'خريفي', nameEn: 'Autumn', icon: '🍂' },
  all: { nameAr: 'جميع المواسم', nameEn: 'All Seasons', icon: '🌤️' },
};

export const TypeSeasonMap: Record<string, Season> = {
  't-shirt': 'summer',
  shorts: 'summer',
  skirt: 'summer',
  dress: 'summer',
  coat: 'winter',
  sweater_hoodie: 'winter',
  jacket: 'autumn',
  shirt: 'spring',
  pants: 'spring',
  shoes: 'all',
  accessories: 'all',
  bag: 'all',
  blouse: 'spring',
};
