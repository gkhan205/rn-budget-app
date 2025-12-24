import * as SQLite from 'expo-sqlite';
import { getDatabase } from './config';

/**
 * Database Service for SQLite operations
 * Provides a singleton pattern for database operations
 */
export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Get singleton instance of DatabaseService
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    try {
      this.db = await getDatabase();
      console.log('✅ Database service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * Execute a read operation (SELECT queries)
   */
  async read<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    const db = await this.getDb();
    try {
      return await operation(db);
    } catch (error) {
      console.error('❌ Database read operation failed:', error);
      throw error;
    }
  }

  /**
   * Execute a write operation (INSERT, UPDATE, DELETE queries)
   */
  async write<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    const db = await this.getDb();
    try {
      return await operation(db);
    } catch (error) {
      console.error('❌ Database write operation failed:', error);
      throw error;
    }
  }

  /**
   * Execute a transaction with multiple operations
   */
  async transaction<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    const db = await this.getDb();
    try {
      // SQLite automatically handles transactions for operations
      return await operation(db);
    } catch (error) {
      console.error('❌ Database transaction failed:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const db = await this.getDb();
    try {
      const result = params 
        ? await db.getAllAsync(sql, params)
        : await db.getAllAsync(sql);
      return result as T[];
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL statement (for non-SELECT queries)
   */
  async execute(sql: string, params?: any[]): Promise<SQLite.SQLiteRunResult> {
    const db = await this.getDb();
    try {
      return params 
        ? await db.runAsync(sql, params)
        : await db.runAsync(sql);
    } catch (error) {
      console.error('❌ Database execute failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.closeAsync();
        this.db = null;
        console.log('✅ Database service closed successfully');
      } catch (error) {
        console.error('❌ Failed to close database service:', error);
        throw error;
      }
    }
  }
}

/**
 * Singleton instance of DatabaseService
 */
export const databaseService = DatabaseService.getInstance();
