/**
 * مستودع قطع الملابس - عمليات CRUD كاملة
 * Clothing items repository — full CRUD against SQLite
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './init';
import type { ClothingItem } from '../../models/ClothingItem';

// ── helpers ────────────────────────────────────────────────

function rowToItem(row: Record<string, unknown>): ClothingItem {
  return {
    id: row.id as string,
    imageUri: row.imageUri as string,
    type: row.type as string,
    typeConfidence: (row.typeConfidence as number) ?? 1.0,
    colorName: (row.colorName as string) ?? '',
    colorHex: (row.colorHex as string) ?? '#000000',
    colorConfidence: (row.colorConfidence as number) ?? 1.0,
    pattern: (row.pattern as ClothingItem['pattern']) ?? 'solid',
    season: (row.season as ClothingItem['season']) ?? 'all',
    category: (row.category as ClothingItem['category']) ?? 'other',
    occasion: (row.occasion as string) ?? 'casual',
    tags: JSON.parse((row.tags as string) ?? '[]'),
    brand: row.brand as string | undefined,
    purchasedAt: row.purchasedAt as string | undefined,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    isArchived: (row.isArchived as number) ?? 0,
  };
}

function itemToRow(item: ClothingItem): Record<string, unknown> {
  return {
    id: item.id,
    imageUri: item.imageUri,
    type: item.type,
    typeConfidence: item.typeConfidence,
    colorName: item.colorName,
    colorHex: item.colorHex,
    colorConfidence: item.colorConfidence,
    pattern: item.pattern,
    season: item.season,
    category: item.category,
    occasion: item.occasion,
    tags: JSON.stringify(item.tags ?? []),
    brand: item.brand ?? null,
    purchasedAt: item.purchasedAt ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    isArchived: item.isArchived,
  };
}

// ── public API ─────────────────────────────────────────────

/** جلب جميع القطع (غير المؤرشفة) */
export async function getAll(): Promise<ClothingItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM clothing_items WHERE isArchived = 0 ORDER BY updatedAt DESC'
  );
  return rows.map(rowToItem);
}

/** جلب قطعة حسب المعرف */
export async function getById(id: string): Promise<ClothingItem | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM clothing_items WHERE id = ?',
    id
  );
  return row ? rowToItem(row) : null;
}

/** إدراج قطعة جديدة */
export async function insert(item: ClothingItem): Promise<void> {
  const db = await getDatabase();
  const row = itemToRow(item);
  const keys = Object.keys(row);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => row[k]);
  await db.runAsync(
    `INSERT INTO clothing_items (${keys.join(', ')}) VALUES (${placeholders})`,
    ...(values as string[])
  );
}

/** تحديث قطعة موجودة */
export async function update(item: ClothingItem): Promise<void> {
  const db = await getDatabase();
  const row = itemToRow(item);
  const keys = Object.keys(row).filter((k) => k !== 'id');
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => row[k]);
  await db.runAsync(
    `UPDATE clothing_items SET ${setClause} WHERE id = ?`,
    ...(values as string[]),
    item.id
  );
}

/** حذف قطعة */
export async function remove(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM clothing_items WHERE id = ?', id);
}

/** أرشفة قطعة (Soft delete) */
export async function archive(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE clothing_items SET isArchived = 1, updatedAt = ? WHERE id = ?',
    now,
    id
  );
}

/** التصفية حسب النوع */
export async function getByType(type: string): Promise<ClothingItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM clothing_items WHERE type = ? AND isArchived = 0 ORDER BY updatedAt DESC',
    type
  );
  return rows.map(rowToItem);
}

/** التصفية حسب الفئة */
export async function getByCategory(category: string): Promise<ClothingItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM clothing_items WHERE category = ? AND isArchived = 0 ORDER BY updatedAt DESC',
    category
  );
  return rows.map(rowToItem);
}

/** التصفية حسب الموسم */
export async function getBySeason(season: string): Promise<ClothingItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM clothing_items WHERE (season = ? OR season = 'all') AND isArchived = 0 ORDER BY updatedAt DESC`,
    season
  );
  return rows.map(rowToItem);
}

/** التصفية حسب المناسبة */
export async function getByOccasion(occasion: string): Promise<ClothingItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM clothing_items WHERE (occasion = ? OR occasion = 'casual') AND isArchived = 0 ORDER BY updatedAt DESC`,
    occasion
  );
  return rows.map(rowToItem);
}

/** إحصائيات سريعة عن خزانة الملابس */
export async function getStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byColor: Record<string, number>;
}> {
  const db = await getDatabase();

  const totalRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM clothing_items WHERE isArchived = 0'
  );
  const total = totalRow?.count ?? 0;

  const typeRows = await db.getAllAsync<{ type: string; count: number }>(
    'SELECT type, COUNT(*) as count FROM clothing_items WHERE isArchived = 0 GROUP BY type ORDER BY count DESC'
  );
  const byType: Record<string, number> = {};
  for (const r of typeRows) byType[r.type] = r.count;

  const colorRows = await db.getAllAsync<{ colorName: string; count: number }>(
    'SELECT colorName, COUNT(*) as count FROM clothing_items WHERE isArchived = 0 GROUP BY colorName ORDER BY count DESC'
  );
  const byColor: Record<string, number> = {};
  for (const r of colorRows) byColor[r.colorName] = r.count;

  return { total, byType, byColor };
}

/** بحث نصي في قطع الملابس (type, colorName, brand, tags) */
export async function search(query: string): Promise<ClothingItem[]> {
  const db = await getDatabase();
  const like = `%${query}%`;
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM clothing_items
     WHERE isArchived = 0
       AND (type LIKE ? OR colorName LIKE ? OR brand LIKE ? OR tags LIKE ?)
     ORDER BY updatedAt DESC`,
    like,
    like,
    like,
    like
  );
  return rows.map(rowToItem);
}
