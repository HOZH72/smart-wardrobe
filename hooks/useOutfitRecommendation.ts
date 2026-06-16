/**
 * useOutfitRecommendation — Hook لتوليد وإدارة توصيات الإطلالات
 * Outfit recommendation state — wraps the outfit engine with loading/error states
 */
import { useState, useCallback, useRef } from 'react';
import { OutfitSuggestion, ClothingItem } from '../models/ClothingItem';
import {
  recommendByItem,
  recommendByOccasion,
  randomOutfit,
  getBestOutfits,
  getDailySuggestion,
} from '../services/outfit/engine';
import { getAll as getAllOutfits } from '../services/database/outfitRepository';
import { getAll as getAllItems } from '../services/database/clothingRepository';

export type RecommendationMode = 'by-item' | 'by-occasion' | 'random' | 'best' | 'daily';

export type RecommendationState = 'idle' | 'loading' | 'done' | 'error';

export interface UseOutfitRecommendationResult {
  /** The current list of suggestions */
  suggestions: OutfitSuggestion[];
  /** A single suggestion (for random/daily) */
  suggestion: OutfitSuggestion | null;
  /** Current recommendation state */
  state: RecommendationState;
  /** Which mode was last used */
  mode: RecommendationMode | null;
  /** Error message if state === 'error' */
  error: string | null;
  /** The parameter used for the last recommendation (itemId or occasion) */
  lastParam: string | null;

  /** Recommend outfits based on a specific clothing item */
  recommendForItem: (itemId: string, limit?: number) => Promise<void>;
  /** Recommend outfits for a specific occasion */
  recommendForOccasion: (occasion: string, limit?: number) => Promise<void>;
  /** Get a random outfit suggestion */
  getRandom: () => Promise<void>;
  /** Get the best overall outfit combinations */
  getBest: (limit?: number) => Promise<void>;
  /** Get the daily suggestion based on current season */
  getDaily: () => Promise<void>;
  /** Refresh/recalculate all recommendations */
  refresh: () => Promise<void>;
  /** Reset to idle */
  reset: () => void;
  /** Remove a suggestion by index */
  removeSuggestion: (index: number) => void;
  /** Clear all suggestions */
  clearSuggestions: () => void;
  /** Number of suggestions currently loaded */
  count: number;
}

export function useOutfitRecommendation(): UseOutfitRecommendationResult {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [state, setState] = useState<RecommendationState>('idle');
  const [mode, setMode] = useState<RecommendationMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastParam, setLastParam] = useState<string | null>(null);
  const isRunning = useRef(false);

  const reset = useCallback(() => {
    setSuggestions([]);
    setSuggestion(null);
    setState('idle');
    setMode(null);
    setError(null);
    setLastParam(null);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSuggestion(null);
  }, []);

  const removeSuggestion = useCallback((index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const recommendForItem = useCallback(
    async (itemId: string, limit = 10) => {
      if (isRunning.current) return;
      isRunning.current = true;

      setState('loading');
      setMode('by-item');
      setLastParam(itemId);
      setError(null);
      setSuggestion(null);

      try {
        const results = await recommendByItem(itemId, limit);
        setSuggestions(results);
        setSuggestion(results.length > 0 ? results[0] : null);
        setState('done');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'فشل الحصول على التوصيات';
        setError(msg);
        setState('error');
      } finally {
        isRunning.current = false;
      }
    },
    []
  );

  const recommendForOccasion = useCallback(
    async (occasion: string, limit = 10) => {
      if (isRunning.current) return;
      isRunning.current = true;

      setState('loading');
      setMode('by-occasion');
      setLastParam(occasion);
      setError(null);
      setSuggestion(null);

      try {
        const results = await recommendByOccasion(occasion, limit);
        setSuggestions(results);
        setSuggestion(results.length > 0 ? results[0] : null);
        setState('done');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'فشل الحصول على التوصيات';
        setError(msg);
        setState('error');
      } finally {
        isRunning.current = false;
      }
    },
    []
  );

  const getRandom = useCallback(async () => {
    if (isRunning.current) return;
    isRunning.current = true;

    setState('loading');
    setMode('random');
    setLastParam(null);
    setError(null);
    setSuggestions([]);

    try {
      const result = await randomOutfit();
      setSuggestion(result);
      if (result) {
        setSuggestions([result]);
      }
      setState('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'فشل إنشاء إطلالة عشوائية';
      setError(msg);
      setState('error');
    } finally {
      isRunning.current = false;
    }
  }, []);

  const getBest = useCallback(async (limit = 10) => {
    if (isRunning.current) return;
    isRunning.current = true;

    setState('loading');
    setMode('best');
    setLastParam(null);
    setError(null);
    setSuggestion(null);

    try {
      const results = await getBestOutfits(limit);
      setSuggestions(results);
      setSuggestion(results.length > 0 ? results[0] : null);
      setState('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'فشل الحصول على أفضل الإطلالات';
      setError(msg);
      setState('error');
    } finally {
      isRunning.current = false;
    }
  }, []);

  const getDaily = useCallback(async () => {
    if (isRunning.current) return;
    isRunning.current = true;

    setState('loading');
    setMode('daily');
    setLastParam(null);
    setError(null);
    setSuggestions([]);

    try {
      const result = await getDailySuggestion();
      setSuggestion(result);
      if (result) {
        setSuggestions([result]);
      }
      setState('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'فشل الحصول على الاقتراح اليومي';
      setError(msg);
      setState('error');
    } finally {
      isRunning.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    // Re-run the last mode if available
    if (!mode) {
      reset();
      return;
    }

    switch (mode) {
      case 'by-item':
        if (lastParam) await recommendForItem(lastParam);
        break;
      case 'by-occasion':
        if (lastParam) await recommendForOccasion(lastParam);
        break;
      case 'random':
        await getRandom();
        break;
      case 'best':
        await getBest();
        break;
      case 'daily':
        await getDaily();
        break;
    }
  }, [mode, lastParam, recommendForItem, recommendForOccasion, getRandom, getBest, getDaily, reset]);

  return {
    suggestions,
    suggestion,
    state,
    mode,
    error,
    lastParam,
    recommendForItem,
    recommendForOccasion,
    getRandom,
    getBest,
    getDaily,
    refresh,
    reset,
    removeSuggestion,
    clearSuggestions,
    count: suggestions.length,
  };
}
