/**
 * useImagePicker — Hook لاختيار الصور من معرض الجهاز
 * Image picker state management — gallery selection, permission, processing
 */
import { useState, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getImagePickerPermission } from '../services/utils/permissions';
import { compressImage } from '../services/image/compressor';
import { autoFixOrientation } from '../services/image/processor';

export type ImagePickerState = 'idle' | 'selecting' | 'processing' | 'done' | 'error';

export interface UseImagePickerOptions {
  /** Allow editing/cropping after selection (default: true) */
  allowsEditing?: boolean;
  /** Aspect ratio for cropping [width, height] (default: [1,1]) */
  aspect?: [number, number];
  /** Image quality 0-1 (default: 0.8) */
  quality?: number;
  /** Max width for compression (default: 1024) */
  maxWidth?: number;
  /** Max height for compression (default: 1024) */
  maxHeight?: number;
  /** Whether to compress the image (default: true) */
  compress?: boolean;
}

export interface UseImagePickerResult {
  /** Current state */
  state: ImagePickerState;
  /** URI of the selected and processed image */
  imageUri: string | null;
  /** Raw URI before processing */
  rawUri: string | null;
  /** Error message if state === 'error' */
  error: string | null;
  /** Open the image picker */
  pickImage: () => Promise<string | null>;
  /** Retry after error */
  retry: () => void;
  /** Reset to idle */
  reset: () => void;
  /** Check if picker permission is granted */
  hasPermission: boolean | null;
  /** Request picker permission explicitly */
  requestPermission: () => Promise<boolean>;
}

const DEFAULT_OPTIONS: Required<UseImagePickerOptions> = {
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  compress: true,
};

export function useImagePicker(
  options?: UseImagePickerOptions
): UseImagePickerResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<ImagePickerState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isPicking = useRef(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const perm = await getImagePickerPermission();
    setHasPermission(perm.granted);
    return perm.granted;
  }, []);

  const pickImage = useCallback(async (): Promise<string | null> => {
    if (isPicking.current) return null;
    isPicking.current = true;

    try {
      // Ensure permission
      const permResult = await getImagePickerPermission();
      setHasPermission(permResult.granted);
      if (!permResult.granted) {
        setError('صلاحية الوصول للمعرض غير متاحة');
        setState('error');
        return null;
      }

      setState('selecting');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: opts.quality,
        allowsEditing: opts.allowsEditing,
        aspect: opts.aspect,
      });

      if (result.canceled || !result.assets?.length) {
        setState('idle');
        return null;
      }

      const selectedUri = result.assets[0].uri;
      setRawUri(selectedUri);

      if (!opts.compress) {
        setImageUri(selectedUri);
        setState('done');
        return selectedUri;
      }

      setState('processing');

      // Auto-fix orientation and compress
      const compressed = await compressImage(selectedUri);

      setImageUri(compressed);
      setState('done');
      return compressed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'حدث خطأ أثناء اختيار الصورة';
      setError(msg);
      setState('error');
      return null;
    } finally {
      isPicking.current = false;
    }
  }, [opts.quality, opts.allowsEditing, opts.aspect, opts.compress, opts.maxWidth, opts.maxHeight]);

  const retry = useCallback(() => {
    setState('idle');
    setImageUri(null);
    setRawUri(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setImageUri(null);
    setRawUri(null);
    setError(null);
  }, []);

  return {
    state,
    imageUri,
    rawUri,
    error,
    pickImage,
    retry,
    reset,
    hasPermission,
    requestPermission,
  };
}
