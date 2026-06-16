/**
 * تهيئة قاعدة البيانات SQLite
 * Database initialization with automatic migrations
 */
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('smart-wardrobe.db');
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS clothing_items (
      id TEXT PRIMARY KEY,
      imageUri TEXT NOT NULL,
      type TEXT NOT NULL,
      typeConfidence REAL DEFAULT 1.0,
      colorName TEXT DEFAULT '',
      colorHex TEXT DEFAULT '#000000',
      colorConfidence REAL DEFAULT 1.0,
      pattern TEXT DEFAULT 'solid',
      season TEXT DEFAULT 'all',
      category TEXT DEFAULT 'other',
      occasion TEXT DEFAULT 'casual',
      tags TEXT DEFAULT '[]',
      brand TEXT,
      purchasedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      isArchived INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      occasion TEXT DEFAULT 'casual',
      items TEXT NOT NULL DEFAULT '[]',
      season TEXT DEFAULT 'all',
      isFavorite INTEGER DEFAULT 0,
      rating INTEGER DEFAULT 0,
      note TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS occasions (
      id TEXT PRIMARY KEY,
      nameAr TEXT NOT NULL,
      nameEn TEXT NOT NULL,
      icon TEXT,
      description TEXT
    );
  `);
}

export async function closeDatabase() {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
