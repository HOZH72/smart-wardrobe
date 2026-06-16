/**
 * إدارة تسميات النموذج
 * Model labels manager
 */
import { loadModel, getModelInfo } from './modelLoader';

export interface LabelInfo {
  index: number;
  name: string;
  nameAr: string;
  category: string;
}

const LABEL_TRANSLATIONS: Record<string, { ar: string; category: string }> = {
  't-shirt': { ar: 'تيشيرت', category: 'top' },
  'shirt': { ar: 'قميص', category: 'top' },
  'blouse': { ar: 'بلوزة', category: 'top' },
  'dress': { ar: 'فستان', category: 'full' },
  'coat': { ar: 'معطف', category: 'top' },
  'jacket': { ar: 'جاكيت', category: 'top' },
  'sweater': { ar: 'سويت شيرت', category: 'top' },
  'hoodie': { ar: 'هودي', category: 'top' },
  'vest': { ar: 'صدرية', category: 'top' },
  'pants': { ar: 'بنطلون', category: 'bottom' },
  'trouser': { ar: 'بنطلون', category: 'bottom' },
  'shorts': { ar: 'شورت', category: 'bottom' },
  'skirt': { ar: 'تنورة', category: 'bottom' },
  'jeans': { ar: 'جينز', category: 'bottom' },
  'shoe': { ar: 'حذاء', category: 'footwear' },
  'sandals': { ar: 'صندل', category: 'footwear' },
  'boots': { ar: 'بوت', category: 'footwear' },
  'sneaker': { ar: 'حذاء رياضي', category: 'footwear' },
  'bag': { ar: 'حقيبة', category: 'accessories' },
  'hat': { ar: 'قبعة', category: 'accessories' },
  'scarf': { ar: 'وشاح', category: 'accessories' },
  'belt': { ar: 'حزام', category: 'accessories' },
  'watch': { ar: 'ساعة', category: 'accessories' },
};

export async function getLabels(): Promise<LabelInfo[]> {
  const model = getModelInfo();
  if (!model.loaded) {
    await loadModel();
  }
  return getModelInfo().labels.map((name, index) => ({
    index,
    name,
    nameAr: LABEL_TRANSLATIONS[name]?.ar || name,
    category: LABEL_TRANSLATIONS[name]?.category || 'other',
  }));
}

export function translateLabel(label: string): string {
  return LABEL_TRANSLATIONS[label]?.ar || label;
}

export function getLabelCategory(label: string): string {
  return LABEL_TRANSLATIONS[label]?.category || 'other';
}
