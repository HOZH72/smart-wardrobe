/**
 * مصفوفة توافق أنواع الملابس
 * Type compatibility matrix
 */
import type { ClothingItem } from '../../models/ClothingItem';
import { ClothingTypes, typeCategory } from '../../constants/types';

/**
 * مصفوفة التوافق بين أنواع الملابس
 * القيم: 0 = غير متوافق، 0.5 = مقبول، 1 = متوافق
 */
const TypeCompatibilityMatrix: Record<string, Record<string, number>> = {
  // ── القمصان ──
  shirt: { pants: 1.0, shorts: 0.6, skirt: 0.8, jacket: 1.0, sweater_hoodie: 0.3 },
  't-shirt': { pants: 1.0, shorts: 1.0, skirt: 0.6, jacket: 0.8, sweater_hoodie: 0.5 },
  blouse: { pants: 1.0, skirt: 1.0, shorts: 0.4, jacket: 0.8, sweater_hoodie: 0.2 },
  // ── الفساتين (كاملة) ──
  dress: { jacket: 0.9, coat: 0.7, accessories: 0.9, bag: 0.8, shoes: 1.0 },
  // ── الأحذية ──
  shoes: { pants: 1.0, shorts: 1.0, skirt: 0.9, dress: 1.0 },
  // ── الإكسسوارات ──
  accessories: {
    shirt: 0.8,
    't-shirt': 0.5,
    blouse: 0.9,
    dress: 0.9,
    jacket: 0.7,
    bag: 0.6,
  },
  bag: { dress: 0.8, pants: 0.7, shirt: 0.6, jacket: 0.7 },
  // ── الجاكيت مع البناطلون ──
  jacket: { pants: 1.0, shorts: 0.3, skirt: 0.8 },
  coat: { pants: 0.9, skirt: 0.8, dress: 0.7, shoes: 0.8 },
  // ── سويت شيرت ──
  sweater_hoodie: { pants: 0.9, shorts: 0.6, shoes: 0.8 },
  // ── تنورة ──
  skirt: { blouse: 1.0, shirt: 0.8, shoes: 0.9, jacket: 0.8 },
};

/** الحصول على درجة التوافق بين نوعين */
export function isTypeCompatible(type1: string, type2: string): boolean {
  if (type1 === type2) return false; // لا يمكن ارتداء قطعتين من نفس النوع
  const cat1 = typeCategory(type1);
  const cat2 = typeCategory(type2);
  if (cat1 === cat2 && cat1 !== 'accessories') return false; // فئة واحدة (إلا الإكسسوارات)

  const score = TypeCompatibilityMatrix[type1]?.[type2]
    ?? TypeCompatibilityMatrix[type2]?.[type1]
    ?? 0.5; // القيمة الافتراضية مقبول

  return score >= 0.5;
}

/** الحصول على درجة التوافق الرقمية بين نوعين (0-1) */
export function getTypePairScore(type1: string, type2: string): number {
  if (type1 === type2) return 0;
  const cat1 = typeCategory(type1);
  const cat2 = typeCategory(type2);
  if (cat1 === cat2 && cat1 !== 'accessories') return 0;

  return TypeCompatibilityMatrix[type1]?.[type2]
    ?? TypeCompatibilityMatrix[type2]?.[type1]
    ?? 0.5;
}

/** حساب درجة توافق الأنواع لمجموعة من القطع (0-1) */
export function calculateTypeScore(items: ClothingItem[]): number {
  if (items.length <= 1) return 1.0;

  let totalScore = 0;
  let pairs = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalScore += getTypePairScore(items[i].type, items[j].type);
      pairs++;
    }
  }

  return pairs > 0 ? totalScore / pairs : 1.0;
}

/** تحديد ما إذا كانت مجموعة قطع تشكل إطلالة صالحة */
export function isValidOutfit(items: ClothingItem[]): boolean {
  if (items.length < 2) return false;

  const categories = items.map((i) => typeCategory(i.type));
  const hasTop = categories.includes('top') || categories.includes('full');
  const hasBottom = categories.includes('bottom') || categories.includes('full');
  const hasShoes = categories.includes('footwear');

  return (hasTop || hasBottom) && hasShoes;
}

/** الحصول على تفصيل أسباب توافق الأنواع */
export function getTypeCompatibilityDetails(items: ClothingItem[]): {
  score: number;
  reasons: string[];
  isValid: boolean;
} {
  const reasons: string[] = [];

  if (items.length <= 1) {
    return { score: 1.0, reasons: ['قطعة واحدة فقط'], isValid: false };
  }

  let totalScore = 0;
  let pairs = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const s = getTypePairScore(items[i].type, items[j].type);
      totalScore += s;
      pairs++;
      const status = s >= 0.5 ? '✓' : '✗';
      reasons.push(
        `${status} ${items[i].type} + ${items[j].type}: ${Math.round(s * 100)}%`
      );
    }
  }

  const valid = isValidOutfit(items);
  if (!valid) {
    reasons.push('⚠️ الإطلالة تفتقر إلى عناصر أساسية (علوي/سفلي + حذاء)');
  }

  return {
    score: pairs > 0 ? totalScore / pairs : 1.0,
    reasons,
    isValid: valid,
  };
}
