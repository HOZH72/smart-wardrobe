/**
 * bodyProfileStore - متجر حالة الهيئة (Zustand)
 * Central state for body profile with AsyncStorage persistence
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BodyProfile } from '../models/BodyProfile';
import { createDefaultBodyProfile } from '../models/BodyProfile';

const STORAGE_KEY = '@smart_wardrobe_body_profile';

interface BodyProfileState {
  /** Current body profile (null until loaded) */
  profile: BodyProfile | null;
  /** Whether data has been loaded from storage */
  loaded: boolean;
  /** Loading flag for save/load operations */
  saving: boolean;

  /** Load profile from AsyncStorage */
  load: () => Promise<void>;
  /** Save/update the body profile */
  save: (profile: BodyProfile) => Promise<void>;
  /** Update partial fields of the current profile */
  update: (partial: Partial<BodyProfile>) => Promise<void>;
  /** Reset to default profile */
  reset: () => Promise<void>;
  /** Clear stored profile */
  clear: () => Promise<void>;
}

export const useBodyProfileStore = create<BodyProfileState>((set, get) => ({
  profile: null,
  loaded: false,
  saving: false,

  load: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed: BodyProfile = JSON.parse(json);
        set({ profile: parsed, loaded: true });
      } else {
        // First time — set default
        const defaultProfile = createDefaultBodyProfile();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
        set({ profile: defaultProfile, loaded: true });
      }
    } catch (error) {
      console.error('Failed to load body profile:', error);
      // Fallback to default
      set({ profile: createDefaultBodyProfile(), loaded: true });
    }
  },

  save: async (profile: BodyProfile) => {
    set({ saving: true });
    try {
      const updated = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ profile: updated, saving: false });
    } catch (error) {
      console.error('Failed to save body profile:', error);
      set({ saving: false });
      throw error;
    }
  },

  update: async (partial: Partial<BodyProfile>) => {
    const current = get().profile;
    if (!current) return;
    const updated: BodyProfile = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await get().save(updated);
  },

  reset: async () => {
    const defaultProfile = createDefaultBodyProfile();
    await get().save(defaultProfile);
  },

  clear: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ profile: null, loaded: true });
    } catch (error) {
      console.error('Failed to clear body profile:', error);
    }
  },
}));
