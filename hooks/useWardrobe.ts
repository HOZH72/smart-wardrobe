/**
 * useWardrobe — Hook رئيسي لحالة خزانة الملابس
 * Main wardrobe state hook — items, stats, CRUD operations
 */
import { useState, useEffect, useCallback } from 'react';
import { ClothingItem } from '../models/ClothingItem';
import {
  getAll,
  insert,
  update,
  remove,
  getStats,
} from '../services/database/clothingRepository';

export interface WardrobeStats {
  total: number;
  byType: Record<string, number>;
  byColor: Record<string, number>;
}

export function useWardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WardrobeStats>({
    total: 0,
    byType: {},
    byColor: {},
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const allItems = await getAll();
      setItems(allItems);
      const s = await getStats();
      setStats(s);
    } catch (e) {
      console.error('useWardrobe refresh error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item: ClothingItem) => {
      await insert(item);
      await refresh();
    },
    [refresh]
  );

  const updateItem = useCallback(
    async (item: ClothingItem) => {
      await update(item);
      await refresh();
    },
    [refresh]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await remove(id);
      await refresh();
    },
    [refresh]
  );

  return { items, loading, stats, refresh, addItem, updateItem, deleteItem };
}
