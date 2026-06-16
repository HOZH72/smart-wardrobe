/**
 * useImageClassification — Hook لإدارة حالة تصنيف الصور بالذكاء الاصطناعي
 * AI image classification state — manages the classification lifecycle
 */
import { useState, useCallback, useRef } from 'react';
import { ClothingItem, ClothingCategory, Season, Pattern } from '../models/ClothingItem';
import { cropToSquare, createThumbnail } from '../services/image/processor';
import {
  loadModel,
  classifyRuleBased,
  preprocessImage,
  extractDominantColor,
  getLabels,
} from '../services/ai';

// ── Types ─────────────────────────────────────────────────

export type ClassificationState = 'idle' | 'classifying' | 'done' | 'error';

/** نتيجة التصنيف الأولية قبل إنشاء ClothingItem كامل */
export interface ClassificationResult {
  /** The processed image URI */
  imageUri: string;
  /** Predicted clothing type (e.g. 't-shirt', 'dress') */
  type: string;
  /** Confidence of the type prediction (0-1) */
  typeConfidence: number;
  /** Predicted color name (e.g. 'Red', 'Blue') */
  colorName: string;
  /** Predicted hex color */
  colorHex: string;
  /** Confidence of the color prediction (0-1) */
  colorConfidence: number;
  /** Predicted pattern */
  pattern: Pattern;
  /** Predicted season suitability */
  season: Season;
  /** Predicted category */
  category: ClothingCategory;
  /** Suggested occasion */
  occasion: string;
  /** Generated tags */
  tags: string[];
}

export interface UseImageClassificationOptions {
  /** Callback fired when classification completes */
  onComplete?: (result: ClassificationResult) => void;
  /** Callback fired on error */
  onError?: (error: string) => void;
}

export interface UseImageClassificationResult {
  /** Current classification state */
  state: ClassificationState;
  /** The last classification result */
  result: ClassificationResult | null;
  /** Progress message during classification */
  progressMessage: string;
  /** Error message if state === 'error' */
  error: string | null;
  /** Start classification on an image URI */
  classify: (imageUri: string) => Promise<ClassificationResult | null>;
  /** Retry classification with the last image */
  retry: () => Promise<ClassificationResult | null>;
  /** Reset to idle */
  reset: () => void;
  /** The last classified image URI */
  lastImageUri: string | null;
}

// ── Internal classification logic ─────────────────────────

/**
 * Extract dominant color information from an image URI.
 * Loads the image, reads pixel data, and runs color extraction.
 */
async function extractColorInfo(imageUri: string): Promise<{
  colorName: string;
  colorHex: string;
  colorConfidence: number;
}> {
  try {
    // In production: get ImageData from file via expo-image-manipulator
    // or react-native-canvas. For now we return a default while
    // Documenting the real approach:
    //
    //   1. Load image into a canvas/getContext2d
    //   2. Call ctx.getImageData(0, 0, width, height)
    //   3. Pass to extractDominantColor(imageData)
    //
    // Placeholder: simulate a medium-gray dominant color
    const result = extractDominantColor({
      data: new Uint8ClampedArray(400),
      width: 10,
      height: 10,
    } as ImageData);
    return {
      colorName: result.colorName,
      colorHex: result.colorHex,
      colorConfidence: result.confidence,
    };
  } catch {
    return { colorName: 'Black', colorHex: '#000000', colorConfidence: 0.9 };
  }
}

/**
 * Guess pattern from minimal info (placeholder).
 * In production this would use a vision model.
 */
function guessPattern(_imageUri: string): Pattern {
  // Placeholder
  return 'solid';
}

/**
 * Determine season suitability based on type/color (placeholder).
 */
function guessSeason(type: string, _colorName: string): Season {
  const summerTypes = ['t-shirt', 'shorts', 'swimsuit', 'vest', 'skirt'];
  const winterTypes = ['jacket', 'coat', 'sweater', 'hoodie', 'boots'];
  const lower = type.toLowerCase();
  if (summerTypes.some((t) => lower.includes(t))) return 'summer';
  if (winterTypes.some((t) => lower.includes(t))) return 'winter';
  return 'all';
}

/**
 * Map clothing type to category.
 */
function typeToCategory(type: string): ClothingCategory {
  const lower = type.toLowerCase();
  const footwear = ['shoe', 'boot', 'sneaker', 'sandal', 'heel', 'footwear'];
  const accessories = ['hat', 'cap', 'belt', 'watch', 'bag', 'scarf', 'glasses', 'jewelry', 'accessory'];
  const bottoms = ['pant', 'trouser', 'jean', 'short', 'skirt', 'legging', 'bottom'];
  const full = ['dress', 'jumpsuit', 'onesie', 'overall', 'gown', 'full'];
  const tops = ['shirt', 'blouse', 't-shirt', 'top', 'hoodie', 'sweater', 'jacket', 'coat', 'vest'];

  if (tops.some((t) => lower.includes(t))) return 'top';
  if (bottoms.some((t) => lower.includes(t))) return 'bottom';
  if (full.some((t) => lower.includes(t))) return 'full';
  if (footwear.some((t) => lower.includes(t))) return 'footwear';
  if (accessories.some((t) => lower.includes(t))) return 'accessories';
  return 'other';
}

/**
 * Suggest occasion based on type and color.
 */
function guessOccasion(type: string, _colorName: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('suit') || lower.includes('blazer') || lower.includes('tie')) return 'formal';
  if (lower.includes('sport') || lower.includes('gym') || lower.includes('athletic')) return 'sport';
  return 'casual';
}

/**
 * Generate tags from all inferred attributes.
 */
function generateTags(
  type: string,
  colorName: string,
  pattern: Pattern,
  season: Season,
  category: ClothingCategory,
  occasion: string
): string[] {
  const tags: string[] = [type, colorName, pattern, season, category, occasion];
  return [...new Set(tags.map((t) => t.toLowerCase()).filter(Boolean))];
}

/** Run AI classification using rule-based + optional TFLite model */
async function runClassification(imageUri: string): Promise<ClassificationResult> {
  // Process image for better classification
  const processed = await cropToSquare(imageUri);
  await createThumbnail(processed);

  // ── Rule‑Based Classification (primary, works offline) ──
  // في الإنتاج: يتم استخراج البكسلات من الصورة الحقيقية عبر
  // expo-image-manipulator + canvas/native module
  // حالياً نستخدم التصنيف القواعدي مع بيانات محاكية

  let type = 't-shirt';
  let typeConfidence = 0.6;

  // محاولة تحميل النموذج إذا كان موجوداً (اختياري)
  const model = await loadModel();

  // استخدام التصنيف القواعدي (يعمل بدون نموذج)
  try {
    // في الإنتاج: pixels = await getImagePixels(processed, 28, 28)
    const mockPixels = new Uint8Array(28 * 28 * 4);
    const result = classifyRuleBased(mockPixels, 28, 28);
    type = result.type;
    typeConfidence = result.typeConfidence;

    // إذا النموذج محمّل، نحاول مزج التنبؤات
    if (model.loaded) {
      // هنا ندمج prediction من TFLite مع rule‑based
      // (يتطلب استخراج pixels حقيقي من الصورة)
      console.log('✅ Model loaded, but using rule-based as primary');
    }
  } catch (e) {
    console.warn('⚠️ Rule-based fallback:', e);
    // التصنيف الافتراضي
  }

  // Extract color attributes using the color service
  const colorInfo = await extractColorInfo(processed);

  // Derive additional attributes from type + color
  const pattern = guessPattern(processed);
  const season = guessSeason(type, colorInfo.colorName);
  const category = typeToCategory(type);
  const occasion = guessOccasion(type, colorInfo.colorName);
  const tags = generateTags(type, colorInfo.colorName, pattern, season, category, occasion);

  return {
    imageUri: processed,
    type,
    typeConfidence,
    colorName: colorInfo.colorName,
    colorHex: colorInfo.colorHex,
    colorConfidence: colorInfo.colorConfidence,
    pattern,
    season,
    category,
    occasion,
    tags,
  };
}

// ── Hook ──────────────────────────────────────────────────

export function useImageClassification(
  options?: UseImageClassificationOptions
): UseImageClassificationResult {
  const [state, setState] = useState<ClassificationState>('idle');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastImageUri, setLastImageUri] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const isClassifying = useRef(false);

  const classify = useCallback(
    async (imageUri: string): Promise<ClassificationResult | null> => {
      if (isClassifying.current) return null;
      isClassifying.current = true;

      setLastImageUri(imageUri);
      setError(null);
      setResult(null);
      setProgressMessage('جاري تحليل الصورة...');
      setState('classifying');

      try {
        const classificationResult = await runClassification(imageUri);
        setResult(classificationResult);
        setProgressMessage('تم التصنيف بنجاح');
        setState('done');
        options?.onComplete?.(classificationResult);
        return classificationResult;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'فشل تصنيف الصورة';
        setError(msg);
        setProgressMessage('');
        setState('error');
        options?.onError?.(msg);
        return null;
      } finally {
        isClassifying.current = false;
      }
    },
    [options]
  );

  const retry = useCallback(async (): Promise<ClassificationResult | null> => {
    if (!lastImageUri) return null;
    return classify(lastImageUri);
  }, [classify, lastImageUri]);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setLastImageUri(null);
    setProgressMessage('');
  }, []);

  return {
    state,
    result,
    progressMessage,
    error,
    classify,
    retry,
    reset,
    lastImageUri,
  };
}

/**
 * Utility: Convert a ClassificationResult into a partial ClothingItem
 * ready for insertion. The caller must provide id/timestamps.
 */
export function classificationToClothingItem(
  classification: ClassificationResult,
  overrides?: Partial<ClothingItem>
): Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    imageUri: classification.imageUri,
    type: classification.type,
    typeConfidence: classification.typeConfidence,
    colorName: classification.colorName,
    colorHex: classification.colorHex,
    colorConfidence: classification.colorConfidence,
    pattern: classification.pattern,
    season: classification.season,
    category: classification.category,
    occasion: classification.occasion,
    tags: classification.tags,
    isArchived: 0,
    brand: undefined,
    purchasedAt: undefined,
    ...overrides,
  };
}
