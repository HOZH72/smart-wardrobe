/**
 * مستودع الإطلالات - عمليات CRUD كاملة
 * Outfits repository — full CRUD against SQLite
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './init';
import type { Outfit } from '../../models/ClothingItem';

// ── helpers ────────────────────────────────────────────────

function rowToOutfit(row: Record<string, unknown>): Outfit {
  return {
    id: row.id as string,
    name: row.name as string,
    occasion: (row.occasion as string) ?? 'casual',
    items: JSON.parse((row.items as string) ?? '[]'),
    season: (row.season as Outfit['season']) ?? 'all',
    isFavorite: (row.isFavorite as number) ?? 0,
    rating: (row.rating as number) ?? 0,
    note: row.note as string | undefined,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

function outfitToRow(outfit: Outfit): Record<string, unknown> {
  return {
    id: outfit.id,
    name: outfit.name,
    occasion: outfit.occasion,
    items: JSON.stringify(outfit.items ?? []),
    season: outfit.season,
    isFavorite: outfit.isFavorite,
    rating: outfit.rating,
    note: outfit.note ?? null,
    createdAt: outfit.createdAt,
    updatedAt: outfit.updatedAt,
  };
}

// ── public API ─────────────────────────────────────────────

/** جلب جميع الإطلالات */
export async function getAll(): Promise<Outfit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM outfits ORDER BY updatedAt DESC'
  );
  return rows.map(rowToOutfit);
}

/** جلب إطلالة حسب المعرف */
export async function getById(id: string): Promise<Outfit | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM outfits WHERE id = ?',
    id
  );
  return row ? rowToOutfit(row) : null;
}

/** إدراج إطلالة جديدة */
export async function insert(outfit: Outfit): Promise<void> {
  const db = await getDatabase();
  const row = outfitToRow(outfit);
  const keys = Object.keys(row);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => row[k]);
  await db.runAsync(
    `INSERT INTO outfits (${keys.join(', ')}) VALUES (${placeholders})`,
    ...(values as string[])
  );
}

/** تحديث إطلالة موجودة */
export async function update(outfit: Outfit): Promise<void> {
  const db = await getDatabase();
  const row = outfitToRow(outfit);
  const keys = Object.keys(row).filter((k) => k !== 'id');
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => row[k]);
  await db.runAsync(
    `UPDATE outfits SET ${setClause} WHERE id = ?`,
    ...(values as string[]),
    outfit.id
  );
}

/** حذف إطلالة */
export async function remove(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM outfits WHERE id = ?', id);
}

/** التصفية حسب المناسبة */
export async function getByOccasion(occasion: string): Promise<Outfit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM outfits WHERE occasion = ? ORDER BY updatedAt DESC',
    occasion
  );
  return rows.map(rowToOutfit);
}

/** التصفية حسب الموسم */
export async function getBySeason(season: string): Promise<Outfit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM outfits WHERE (season = ? OR season = 'all') ORDER BY updatedAt DESC`,
    season
  );
  return rows.map(rowToOutfit);
}

/** جلب الإطلالات المفضلة */
export async function getFavorites(): Promise<Outfit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM outfits WHERE isFavorite = 1 ORDER BY updatedAt DESC'
  );
  return rows.map(rowToOutfit);
}

/** جلب الإطلالات الأعلى تقييماً */
export async function getTopRated(limit = 10): Promise<Outfit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM outfits WHERE rating > 0 ORDER BY rating DESC, updatedAt DESC LIMIT ?',
    limit
  );
  return rows.map(rowToOutfit);
}

/** تبديل حالة المفضلة */
export async function toggleFavorite(id: string): Promise<boolean> {
  const db = await getDatabase();
  const outfit = await getById(id);
  if (!outfit) return false;
  const newVal = outfit.isFavorite ? 0 : 1;
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE outfits SET isFavorite = ?, updatedAt = ? WHERE id = ?',
    newVal,
    now,
    id
  );
  return newVal === 1;
}

/** تحديث التقييم */
export async function updateRating(id: string, rating: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE outfits SET rating = ?, updatedAt = ? WHERE id = ?',
    Math.max(0, Math.min(5, Math.round(rating))),
    now,
    id
  );
}
