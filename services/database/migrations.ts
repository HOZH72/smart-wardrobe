/**
 * نظام الترحيل (Migrations) لإدارة تحديثات قاعدة البيانات
 * Database migration system
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './init';

interface Migration {
  id: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  {
    id: 1,
    name: 'Add brand index to clothing_items',
    up: async (db) => {
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_clothing_items_brand ON clothing_items(brand);'
      );
    },
  },
  {
    id: 2,
    name: 'Add search indexes',
    up: async (db) => {
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_clothing_items_type ON clothing_items(type);'
      );
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);'
      );
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_clothing_items_season ON clothing_items(season);'
      );
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_clothing_items_occasion ON clothing_items(occasion);'
      );
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);'
      );
    },
  },
  {
    id: 3,
    name: 'Seed default occasions',
    up: async (db) => {
      const existing = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM occasions'
      );
      if (existing && existing.count === 0) {
        await db.runAsync(
          `INSERT INTO occasions (id, nameAr, nameEn, icon, description) VALUES
            ('work', 'عمل', 'Work', '💼', 'ملابس رسمية مناسبة للعمل'),
            ('casual', 'كاجوال يومي', 'Casual', '😎', 'ملابس يومية مريحة'),
            ('party', 'حفلة / سهرة', 'Party', '🎉', 'ملابس سهرة وحفلات'),
            ('sport', 'رياضة', 'Sport', '🏃', 'ملابس رياضية'),
            ('formal', 'رسمي', 'Formal', '🎩', 'ملابس رسمية فاخرة'),
            ('date', 'موعد غرامي', 'Date', '💕', 'إطلالة رومانسية أنيقة'),
            ('travel', 'سفر', 'Travel', '✈️', 'ملابس سفر مريحة'),
            ('home', 'المنزل / راحة', 'Home', '🏠', 'ملابس استرخاء منزلية')`
        );
      }
    },
  },
];

const MIGRATIONS_TABLE = '_migrations';

async function ensureMigrationsTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT NOT NULL
    )`
  );
}

async function getAppliedMigrations(db: SQLiteDatabase): Promise<Set<number>> {
  const rows = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM ${MIGRATIONS_TABLE}`
  );
  return new Set(rows.map((r) => r.id));
}

/**
 * تشغيل جميع الترحيلات غير المطبّقة
 * Run all pending migrations
 */
export async function runMigrations(): Promise<string[]> {
  const db = await getDatabase();
  await ensureMigrationsTable(db);
  const applied = await getAppliedMigrations(db);
  const results: string[] = [];

  for (const m of migrations) {
    if (applied.has(m.id)) continue;
    try {
      await m.up(db);
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO ${MIGRATIONS_TABLE} (id, name, appliedAt) VALUES (?, ?, ?)`,
        m.id,
        m.name,
        now
      );
      results.push(`✅ Migration #${m.id}: ${m.name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push(`❌ Migration #${m.id}: ${m.name} — ${message}`);
      throw err;
    }
  }

  if (results.length === 0) {
    results.push('ℹ️ No pending migrations.');
  }

  return results;
}

/**
 * التحقق من حالة الترحيلات
 * Check migration status (useful for debugging)
 */
export async function getMigrationStatus(): Promise<
  { id: number; name: string; appliedAt: string | null }[]
> {
  const db = await getDatabase();
  await ensureMigrationsTable(db);
  const applied = await db.getAllAsync<{ id: number; name: string; appliedAt: string }>(
    `SELECT id, name, appliedAt FROM ${MIGRATIONS_TABLE} ORDER BY id`
  );
  const appliedMap = new Map(applied.map((a) => [a.id, a]));

  return migrations.map((m) => ({
    id: m.id,
    name: m.name,
    appliedAt: appliedMap.get(m.id)?.appliedAt ?? null,
  }));
}
