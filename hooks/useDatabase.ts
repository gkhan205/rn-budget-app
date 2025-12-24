import { useEffect, useState } from 'react';
import { databaseService, initializeDatabase } from '../db';

/**
 * Hook for initializing the SQLite database
 */
export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
        setError(null);
        console.log('✅ Database hook: SQLite initialized successfully');
      } catch (err) {
        console.error('❌ Database hook: Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Database initialization failed'));
        setIsInitialized(false);
      }
    };

    setupDatabase();
  }, []);

  return {
    isInitialized,
    error,
  };
};

/**
 * Hook for performing SQLite database operations
 */
export const useDatabaseOperations = () => {
  return {
    // Core database operations
    read: databaseService.read.bind(databaseService),
    write: databaseService.write.bind(databaseService),
    transaction: databaseService.transaction.bind(databaseService),
    query: databaseService.query.bind(databaseService),
    execute: databaseService.execute.bind(databaseService),
    
    // Convenience methods for common operations
    
    /**
     * Generic method to get objects with SQL query
     */
    getObjects: async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
      return databaseService.query<T>(sql, params);
    },
    
    /**
     * Get a single object by ID
     */
    getObjectById: async <T = any>(tableName: string, id: any): Promise<T | null> => {
      const results = await databaseService.query<T>(
        `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
        [id]
      );
      return results.length > 0 ? results[0] : null;
    },
    
    /**
     * Create a new object
     */
    createObject: async (tableName: string, data: Record<string, any>) => {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      return databaseService.execute(sql, values);
    },
    
    /**
     * Update an existing object
     */
    updateObject: async (tableName: string, id: any, data: Record<string, any>) => {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map(col => `${col} = ?`).join(', ');
      
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
      return databaseService.execute(sql, [...values, id]);
    },
    
    /**
     * Delete an object by ID
     */
    deleteObject: async (tableName: string, id: any) => {
      const sql = `DELETE FROM ${tableName} WHERE id = ?`;
      return databaseService.execute(sql, [id]);
    },
    
    /**
     * Delete multiple objects with a condition
     */
    deleteObjects: async (tableName: string, whereClause: string, params?: any[]) => {
      const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
      return databaseService.execute(sql, params);
    }
  };
};
