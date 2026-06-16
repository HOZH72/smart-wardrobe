/**
 * AsyncStorage Wrapper — إدارة التفضيلات
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  THEME: 'smart_wardrobe_theme',
  LANGUAGE: 'smart_wardrobe_language',
  ONBOARDING_DONE: 'smart_wardrobe_onboarding_done',
  CAMERA_QUALITY: 'smart_wardrobe_camera_quality',
  LAST_SYNC: 'smart_wardrobe_last_sync',
  USER_PREFERENCES: 'smart_wardrobe_user_preferences',
  FAVORITE_COLORS: 'smart_wardrobe_favorite_colors',
  RECENT_SEARCHES: 'smart_wardrobe_recent_searches',
} as const;

type StorageKey = (typeof KEYS)[keyof typeof KEYS];

// ── Core ───────────────────────────────────────────────────

/** حفظ قيمة في التخزين */
async function set<T>(key: StorageKey, value: T): Promise<void> {
  const json = JSON.stringify(value);
  await AsyncStorage.setItem(key, json);
}

/** قراءة قيمة من التخزين */
async function get<T>(key: StorageKey): Promise<T | null> {
  const json = await AsyncStorage.getItem(key);
  if (json === null) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return json as unknown as T;
  }
}

/** إزالة قيمة */
async function remove(key: StorageKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

/** مسح كل التخزين */
async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

// ── واجهات مخصصة ──────────────────────────────────────────

/** تفضيلات المستخدم */
export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: 'ar' | 'en';
  cameraQuality: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  autoBackup: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'ar',
  cameraQuality: 'medium',
  notificationsEnabled: true,
  autoBackup: false,
};

/** حفظ تفضيلات المستخدم */
export async function savePreferences(
  prefs: Partial<UserPreferences>
): Promise<void> {
  const current = await getPreferences();
  const merged = { ...current, ...prefs };
  await set(KEYS.USER_PREFERENCES, merged);
}

/** قراءة تفضيلات المستخدم */
export async function getPreferences(): Promise<UserPreferences> {
  const stored = await get<UserPreferences>(KEYS.USER_PREFERENCES);
  return stored ?? DEFAULT_PREFERENCES;
}

/** إعادة تعيين التفضيلات إلى الافتراضية */
export async function resetPreferences(): Promise<void> {
  await set(KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
}

// ── ألوان مفضلة ───────────────────────────────────────────

/** حفظ الألوان المفضلة */
export async function saveFavoriteColors(colors: string[]): Promise<void> {
  await set(KEYS.FAVORITE_COLORS, colors);
}

/** قراءة الألوان المفضلة */
export async function getFavoriteColors(): Promise<string[]> {
  return (await get<string[]>(KEYS.FAVORITE_COLORS)) ?? [];
}

// ── عمليات بحث حديثة ──────────────────────────────────────

const MAX_RECENT_SEARCHES = 10;

/** إضافة عملية بحث حديثة */
export async function addRecentSearch(query: string): Promise<void> {
  const searches = await getRecentSearches();
  const filtered = searches.filter((s) => s !== query);
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  await set(KEYS.RECENT_SEARCHES, updated);
}

/** قراءة عمليات البحث الحديثة */
export async function getRecentSearches(): Promise<string[]> {
  return (await get<string[]>(KEYS.RECENT_SEARCHES)) ?? [];
}

/** مسح سجل البحث */
export async function clearRecentSearches(): Promise<void> {
  await remove(KEYS.RECENT_SEARCHES);
}

// ── Onboarding ─────────────────────────────────────────────

/** تحديد اكتمال Onboarding */
export async function setOnboardingDone(): Promise<void> {
  await set(KEYS.ONBOARDING_DONE, true);
}

/** التحقق من اكتمال Onboarding */
export async function isOnboardingDone(): Promise<boolean> {
  return (await get<boolean>(KEYS.ONBOARDING_DONE)) ?? false;
}

// ── Last Sync ──────────────────────────────────────────────

/** تحديث وقت آخر مزامنة */
export async function updateLastSync(): Promise<void> {
  await set(KEYS.LAST_SYNC, new Date().toISOString());
}

/** قراءة وقت آخر مزامنة */
export async function getLastSync(): Promise<string | null> {
  return get<string>(KEYS.LAST_SYNC);
}

/** تصدير عام */
export const storage = {
  set,
  get,
  remove,
  clearAll,
  KEYS,
};
