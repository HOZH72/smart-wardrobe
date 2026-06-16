/**
 * بيانات المناسبات - أيقونات وأوصاف بالعربية والإنجليزية
 */

export const Occasions = [
  { id: 'work', nameAr: 'عمل', nameEn: 'Work', icon: '💼', description: 'ملابس رسمية مناسبة للعمل' },
  { id: 'casual', nameAr: 'كاجوال يومي', nameEn: 'Casual', icon: '😎', description: 'ملابس يومية مريحة' },
  { id: 'party', nameAr: 'حفلة / سهرة', nameEn: 'Party', icon: '🎉', description: 'ملابس سهرة وحفلات' },
  { id: 'sport', nameAr: 'رياضة', nameEn: 'Sport', icon: '🏃', description: 'ملابس رياضية' },
  { id: 'formal', nameAr: 'رسمي', nameEn: 'Formal', icon: '🎩', description: 'ملابس رسمية فاخرة' },
  { id: 'date', nameAr: 'موعد غرامي', nameEn: 'Date', icon: '💕', description: 'إطلالة رومانسية أنيقة' },
  { id: 'travel', nameAr: 'سفر', nameEn: 'Travel', icon: '✈️', description: 'ملابس سفر مريحة' },
  { id: 'home', nameAr: 'المنزل / راحة', nameEn: 'Home', icon: '🏠', description: 'ملابس استرخاء منزلية' },
];

export const OccasionTypeMap: Record<string, string[]> = {
  work: ['shirt', 'pants', 'blouse', 'skirt'],
  casual: ['t-shirt', 'shorts', 'sweater_hoodie', 'shoes'],
  party: ['dress', 'jacket', 'accessories', 'bag'],
  sport: ['t-shirt', 'shorts', 'shoes'],
  formal: ['shirt', 'pants', 'dress', 'jacket'],
  date: ['shirt', 'jacket', 'dress', 'accessories'],
  travel: ['t-shirt', 'pants', 'shoes', 'bag', 'sweater_hoodie'],
  home: ['t-shirt', 'sweater_hoodie'],
};

export const getOccasionById = (id: string) => Occasions.find(o => o.id === id);
export const getOccasionNameAr = (id: string) => getOccasionById(id)?.nameAr ?? id;
