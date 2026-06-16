/**
 * أنواع الملابس مع رموزها وأيقوناتها
 */
export const ClothingTypes = [
  { id: 'shirt', nameAr: 'قميص', nameEn: 'Shirt', icon: '👔', category: 'top' },
  { id: 't-shirt', nameAr: 'تيشيرت', nameEn: 'T-Shirt', icon: '👕', category: 'top' },
  { id: 'blouse', nameAr: 'بلوزة', nameEn: 'Blouse', icon: '👚', category: 'top' },
  { id: 'pants', nameAr: 'بنطلون', nameEn: 'Pants', icon: '👖', category: 'bottom' },
  { id: 'shorts', nameAr: 'شورت', nameEn: 'Shorts', icon: '🩳', category: 'bottom' },
  { id: 'skirt', nameAr: 'تنورة', nameEn: 'Skirt', icon: '👗', category: 'bottom' },
  { id: 'dress', nameAr: 'فستان', nameEn: 'Dress', icon: '👗', category: 'full' },
  { id: 'jacket', nameAr: 'جاكيت', nameEn: 'Jacket', icon: '🧥', category: 'top' },
  { id: 'coat', nameAr: 'معطف', nameEn: 'Coat', icon: '🧥', category: 'top' },
  { id: 'sweater_hoodie', nameAr: 'بلوفر/هودي', nameEn: 'Sweater/Hoodie', icon: '🧶', category: 'top' },
  { id: 'shoes', nameAr: 'حذاء', nameEn: 'Shoes', icon: '👟', category: 'footwear' },
  { id: 'accessories', nameAr: 'إكسسوارات', nameEn: 'Accessories', icon: '💍', category: 'accessories' },
  { id: 'bag', nameAr: 'حقيبة', nameEn: 'Bag', icon: '👜', category: 'accessories' },
  { id: 'other', nameAr: 'غير ذلك', nameEn: 'Other', icon: '📦', category: 'other' },
] as const;

export const typeIcon = (typeId: string): string =>
  ClothingTypes.find(t => t.id === typeId)?.icon ?? '📦';

export const typeNameAr = (typeId: string): string =>
  ClothingTypes.find(t => t.id === typeId)?.nameAr ?? typeId;

export const typeCategory = (typeId: string): string =>
  ClothingTypes.find(t => t.id === typeId)?.category ?? 'other';
