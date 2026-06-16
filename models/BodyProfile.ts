/**
 * نموذج بيانات الهيئة - Body Profile Model
 */

export type Gender = 'male' | 'female' | 'other';

export type BodyShape = 'slim' | 'athletic' | 'average' | 'curvy' | 'plus' | 'custom';

export type AgeRange = 'under_18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_64' | '65_plus';

export const AGE_RANGES: { range: AgeRange; labelAr: string; labelEn: string; minAge: number; maxAge: number; bodyAdjustment: { heightFactor: number; widthFactor: number; postureFactor: number } }[] = [
  { range: 'under_18', labelAr: 'أقل من 18', labelEn: 'Under 18', minAge: 0, maxAge: 17, bodyAdjustment: { heightFactor: 0.92, widthFactor: 0.85, postureFactor: 1.05 } },
  { range: '18_24', labelAr: '18 - 24', labelEn: '18 - 24', minAge: 18, maxAge: 24, bodyAdjustment: { heightFactor: 1.0, widthFactor: 0.95, postureFactor: 1.0 } },
  { range: '25_34', labelAr: '25 - 34', labelEn: '25 - 34', minAge: 25, maxAge: 34, bodyAdjustment: { heightFactor: 1.0, widthFactor: 1.0, postureFactor: 1.0 } },
  { range: '35_44', labelAr: '35 - 44', labelEn: '35 - 44', minAge: 35, maxAge: 44, bodyAdjustment: { heightFactor: 0.99, widthFactor: 1.05, postureFactor: 0.98 } },
  { range: '45_54', labelAr: '45 - 54', labelEn: '45 - 54', minAge: 45, maxAge: 54, bodyAdjustment: { heightFactor: 0.98, widthFactor: 1.1, postureFactor: 0.95 } },
  { range: '55_64', labelAr: '55 - 64', labelEn: '55 - 64', minAge: 55, maxAge: 64, bodyAdjustment: { heightFactor: 0.96, widthFactor: 1.08, postureFactor: 0.92 } },
  { range: '65_plus', labelAr: '65 فما فوق', labelEn: '65+', minAge: 65, maxAge: 120, bodyAdjustment: { heightFactor: 0.94, widthFactor: 1.06, postureFactor: 0.88 } },
];

export interface BodyMeasurements {
  height: number;        // cm
  weight: number;        // kg
  chest?: number;        // cm
  waist?: number;        // cm
  hips?: number;         // cm
  shoulderWidth?: number; // cm
  inseam?: number;       // cm
  sleeveLength?: number; // cm
}

export interface SkinColor {
  name: string;
  hex: string;
  labelAr: string;
}

export const SKIN_COLORS: SkinColor[] = [
  { name: 'very_fair', hex: '#FCE4D6', labelAr: 'أبيض جداً' },
  { name: 'fair', hex: '#F0C8A0', labelAr: 'أبيض' },
  { name: 'light', hex: '#DEB887', labelAr: 'فاتح' },
  { name: 'medium', hex: '#C68642', labelAr: 'متوسط' },
  { name: 'tan', hex: '#A0522D', labelAr: 'قمحي' },
  { name: 'brown', hex: '#8B4513', labelAr: 'أسمر' },
  { name: 'dark', hex: '#5C3317', labelAr: 'غامق' },
  { name: 'very_dark', hex: '#3E1F0F', labelAr: 'غامق جداً' },
];

export interface FacePhoto {
  uri: string;
  position: { x: number; y: number; scale: number };
}

export interface BodyProfile {
  id: string;
  gender: Gender;
  ageRange: AgeRange;
  shape: BodyShape;
  measurements: BodyMeasurements;
  skinColor: SkinColor;
  facePhoto?: FacePhoto;
  createdAt: string;
  updatedAt: string;
}

/** احسب BMI من القياسات */
export function calcBMI(measurements: BodyMeasurements): number {
  const heightM = measurements.height / 100;
  if (heightM <= 0) return 0;
  return measurements.weight / (heightM * heightM);
}

/** وصف حالة الجسم بناءً على BMI */
export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'نحافة';
  if (bmi < 25) return 'وزن طبيعي';
  if (bmi < 30) return 'زيادة وزن';
  return 'سمنة';
}

/** إنشاء هيئة افتراضية جديدة */
export function createDefaultBodyProfile(): BodyProfile {
  return {
    id: Date.now().toString(),
    gender: 'male',
    ageRange: '25_34',
    shape: 'average',
    measurements: { height: 170, weight: 70 },
    skinColor: SKIN_COLORS[2], // light
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getAgeAdjustment(ageRange: AgeRange) {
  return AGE_RANGES.find(a => a.range === ageRange)?.bodyAdjustment || AGE_RANGES[2].bodyAdjustment;
}
