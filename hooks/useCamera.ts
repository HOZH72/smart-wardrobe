/**
 * useCamera — Hook لإدارة حالة الكاميرا والتصوير
 * Camera state management — permissions, capture, processing
 */
import { useState, useCallback, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ensureCameraPermission } from '../services/utils/permissions';
import { compressImage } from '../services/image/compressor';
import { autoFixOrientation } from '../services/image/processor';

export type CameraCaptureState = 'idle' | 'waiting' | 'captured' | 'processing' | 'done' | 'error';

export interface UseCameraResult {
  /** Camera ref to attach to <CameraView> */
  cameraRef: React.RefObject<CameraView | null>;
  /** Current permission status */
  permission: { granted: boolean; loading: boolean };
  /** Whether the camera is ready to capture */
  isReady: boolean;
  /** Current capture state */
  state: CameraCaptureState;
  /** URI of the captured image (after processing) */
  capturedUri: string | null;
  /** The raw image URI before processing */
  rawUri: string | null;
  /** Error message if state === 'error' */
  error: string | null;
  /** Current camera facing */
  facing: CameraType;
  /** Toggle front/back camera */
  toggleFacing: () => void;
  /** Capture a photo */
  takePicture: () => Promise<string | null>;
  /** Retry after error */
  retry: () => void;
  /** Reset to idle */
  reset: () => void;
  /** Request camera permissions explicitly */
  requestPermission: () => Promise<boolean>;
}

export function useCamera(): UseCameraResult {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermissionHook] = useCameraPermissions();
  const [state, setState] = useState<CameraCaptureState>('idle');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const isProcessing = useRef(false);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestPermissionHook();
    return result?.granted ?? false;
  }, [requestPermissionHook]);

  const takePicture = useCallback(async (): Promise<string | null> => {
    if (isProcessing.current) return null;
    isProcessing.current = true;

    try {
      // Ensure we have permission
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) {
        setError('صلاحية الكاميرا غير متاحة');
        setState('error');
        return null;
      }

      setState('waiting');

      // If CameraView ref exists, use it
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });

        if (!photo?.uri) {
          setError('فشل التقاط الصورة');
          setState('error');
          return null;
        }

        setRawUri(photo.uri);
        setState('processing');

        // Process: auto-fix orientation + compress
        const compressed = await compressImage(photo.uri);

        setCapturedUri(compressed);
        setState('done');
        return compressed;
      }

      // Fallback: use ImagePicker.launchCameraAsync directly
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled || !result.assets?.length) {
        setState('idle');
        return null;
      }

      const uri = result.assets[0].uri;
      setRawUri(uri);
      setState('processing');

      const compressed = await compressImage(uri);

      setCapturedUri(compressed);
      setState('done');
      return compressed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'حدث خطأ أثناء التصوير';
      setError(msg);
      setState('error');
      return null;
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const retry = useCallback(() => {
    setState('idle');
    setCapturedUri(null);
    setRawUri(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setCapturedUri(null);
    setRawUri(null);
    setError(null);
  }, []);

  return {
    cameraRef,
    permission: {
      granted: permission?.granted ?? false,
      loading: permission === null,
    },
    isReady: (permission?.granted ?? false) && state === 'idle',
    state,
    capturedUri,
    rawUri,
    error,
    facing,
    toggleFacing,
    takePicture,
    retry,
    reset,
    requestPermission,
  };
}
