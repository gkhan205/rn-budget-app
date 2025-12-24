import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

/**
 * Database Configuration
 */
export const dbConfig = {
  name: 'budgetflow.db',
  version: '1.0',
  displayName: 'Budget Flow Database',
  size: 200000,
};

// Single database instance
let databaseInstance: SQLite.SQLiteDatabase | null = null;
let drizzleDb: ReturnType<typeof drizzle> | null = null;

/**
 * Get database connection - ensures single instance and reuse
 * Enables foreign keys and sets up for offline-first usage
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (databaseInstance) {
    return databaseInstance;
  }

  try {
    // Open or create database
    databaseInstance = await SQLite.openDatabaseAsync(dbConfig.name);
    
    // Enable foreign keys
    await databaseInstance.execAsync('PRAGMA foreign_keys = ON;');
    
    // Set up database for offline-first usage
    await databaseInstance.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA temp_store = MEMORY;
      PRAGMA mmap_size = 268435456;
    `);
    
    // Initialize Drizzle
    drizzleDb = drizzle(databaseInstance, { schema });
    
    console.log('✅ Database opened successfully:', dbConfig.name);
    return databaseInstance;
  } catch (error) {
    console.error('❌ Failed to open database:', error);
    throw new Error(`Failed to open database: ${error}`);
  }
};

/**
 * Get Drizzle database instance
 */
export const getDrizzleDb = () => {
  if (!drizzleDb) {
    throw new Error('Database not initialized. Call getDatabase() first.');
  }
  return drizzleDb;
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (databaseInstance) {
    try {
      await databaseInstance.closeAsync();
      databaseInstance = null;
      drizzleDb = null;
      console.log('✅ Database closed successfully');
    } catch (error) {
      console.error('❌ Failed to close database:', error);
      throw error;
    }
  }
};

/**
 * Check if database is open
 */
export const isDatabaseOpen = (): boolean => {
  return databaseInstance !== null;
};

/**
 * Reset database - useful for development and testing
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    await closeDatabase();
    await SQLite.deleteDatabaseAsync(dbConfig.name);
    console.log('✅ Database reset successfully');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    throw error;
  }
};

/**
 * Helper function - alias for getDatabase to match the requirement
 */
export const getDB = getDatabase;

export default dbConfig;
