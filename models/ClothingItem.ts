/**
 * أنواع بيانات التطبيق - نماذج مشتركة
 */

export type ClothingCategory = 'top' | 'bottom' | 'full' | 'footwear' | 'accessories' | 'other';
export type Season = 'summer' | 'winter' | 'spring' | 'autumn' | 'all';
export type Pattern = 'solid' | 'striped' | 'floral' | 'checked' | 'graphic' | 'other';

export interface ClothingItem {
  id: string;
  imageUri: string;
  type: string;
  typeConfidence: number;
  colorName: string;
  colorHex: string;
  colorConfidence: number;
  pattern: Pattern;
  season: Season;
  category: ClothingCategory;
  occasion: string;
  tags: string[];
  brand?: string;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: number; // 0 or 1
}

export interface Outfit {
  id: string;
  name: string;
  occasion: string;
  items: string[]; // ClothingItem IDs
  season: Season;
  isFavorite: number; // 0 or 1
  rating: number; // 1-5
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Occasion {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  description: string;
}

export interface CompatibilityScore {
  total: number;
  colorScore: number;
  typeScore: number;
  seasonScore: number;
  occasionScore: number;
  reasons: string[];
}

export interface OutfitSuggestion {
  items: ClothingItem[];
  score: CompatibilityScore;
}
