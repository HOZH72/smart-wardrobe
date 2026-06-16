/**
 * مساعد إدارة الأذونات — Permission helpers
 */
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'blocked';

/** نتيجة طلب الإذن */
export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  granted: boolean;
}

// ── الكاميرا ───────────────────────────────────────────────

/** التحقق من إذن الكاميرا */
export async function getCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain, granted } =
    await ImagePicker.getCameraPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
    granted,
  };
}

/** طلب إذن الكاميرا */
export async function requestCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain, granted } =
    await ImagePicker.requestCameraPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
    granted,
  };
}

/** التأكد من وجود إذن الكاميرا — يطلب إذا لم يكن ممنوحاً */
export async function ensureCameraPermission(): Promise<boolean> {
  const current = await getCameraPermission();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const result = await requestCameraPermission();
  return result.granted;
}

// ── مكتبة الصور ────────────────────────────────────────────

/** التحقق من إذن مكتبة الصور */
export async function getMediaLibraryPermission(): Promise<PermissionResult> {
  const { status, canAskAgain, granted } =
    await MediaLibrary.getPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
    granted,
  };
}

/** طلب إذن مكتبة الصور */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  const { status, canAskAgain, granted } =
    await MediaLibrary.requestPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
    granted,
  };
}

/** التأكد من وجود إذن مكتبة الصور */
export async function ensureMediaLibraryPermission(): Promise<boolean> {
  const current = await getMediaLibraryPermission();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const result = await requestMediaLibraryPermission();
  return result.granted;
}

// ── Image Picker (اختيار من الألبوم) ───────────────────────

/** التحقق من إذن مكتبة الصور (لـ Image Picker) */
export async function getImagePickerPermission(): Promise<PermissionResult> {
  const { status, canAskAgain, granted } =
    await ImagePicker.getMediaLibraryPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
    granted,
  };
}

/** طلب إذن مكتبة الصور (لـ Image Picker) */
export async function requestImagePickerPermission(): Promise<PermissionResult> {
  const { status, canAskAgain, granted } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
    granted,
  };
}

/**
 * اختيار صورة من الألبوم مع التحقق من الأذونات
 * @returns الصورة المختارة أو null
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  const permitted = await ensureImagePickerPermission();
  if (!permitted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1] as [number, number],
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

/** التأكد من وجود إذن مكتبة الصور لـ Image Picker */
async function ensureImagePickerPermission(): Promise<boolean> {
  const current = await getImagePickerPermission();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const result = await requestImagePickerPermission();
  return result.granted;
}

// ── التصوير بالكاميرا ──────────────────────────────────────

/**
 * التقاط صورة بالكاميرا مع التحقق من الأذونات
 * @returns مسار الصورة الملتقطة أو null
 */
export async function takePhoto(): Promise<string | null> {
  const permitted = await ensureCameraPermission();
  if (!permitted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1] as [number, number],
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

// ── أذونات في آن واحد ──────────────────────────────────────

/** طلب أذونات متعددة دفعة واحدة */
export async function requestAllPermissions(): Promise<{
  camera: PermissionResult;
  mediaLibrary: PermissionResult;
}> {
  const [camera, mediaLibrary] = await Promise.all([
    requestCameraPermission(),
    requestMediaLibraryPermission(),
  ]);
  return { camera, mediaLibrary };
}
