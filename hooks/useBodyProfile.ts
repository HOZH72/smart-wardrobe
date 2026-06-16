/**
 * useBodyProfile - هوك للتعامل مع الهيئة
 * Hook wrapping the body profile Zustand store
 */
import { useEffect, useCallback } from 'react';
import { useBodyProfileStore } from '../stores/bodyProfileStore';
import type { BodyProfile } from '../models/BodyProfile';
import { calcBMI, bmiCategory } from '../models/BodyProfile';

export function useBodyProfile() {
  const store = useBodyProfileStore();

  // Auto-load on mount
  useEffect(() => {
    if (!store.loaded) {
      store.load();
    }
  }, [store.loaded]);

  const profile = store.profile;

  const bmi = profile ? calcBMI(profile.measurements) : 0;
  const bmiLabel = bmiCategory(bmi);

  const hasProfile = profile !== null;

  const saveProfile = useCallback(
    async (p: BodyProfile) => {
      await store.save(p);
    },
    [store]
  );

  const updateProfile = useCallback(
    async (partial: Partial<BodyProfile>) => {
      await store.update(partial);
    },
    [store]
  );

  const resetProfile = useCallback(async () => {
    await store.reset();
  }, [store]);

  const clearProfile = useCallback(async () => {
    await store.clear();
  }, [store]);

  return {
    /** Current body profile */
    profile,
    /** Whether the profile has been loaded from storage */
    loaded: store.loaded,
    /** Whether a save operation is in progress */
    saving: store.saving,
    /** Computed BMI */
    bmi,
    /** BMI category label in Arabic */
    bmiLabel,
    /** Whether a profile exists (non-null) */
    hasProfile,

    /** Save a complete body profile */
    saveProfile,
    /** Update partial fields of the current profile */
    updateProfile,
    /** Reset to default body profile */
    resetProfile,
    /** Clear the stored profile entirely */
    clearProfile,
    /** Reload from AsyncStorage */
    reload: store.load,
  };
}
