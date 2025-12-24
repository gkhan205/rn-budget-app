import { getDB } from './config';
import { databaseService } from './service';

/**
 * Initialize the database and create tables if they don't exist
 * This should be called when the app starts
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing SQLite database...');
    
    // Initialize the database service
    await databaseService.initialize();
    
    // Get database instance to ensure it's ready
    const db = await getDB();
    
    console.log('✅ SQLite database initialized successfully');
    console.log('📁 Database name: budgetflow.db');
    console.log('🔧 Foreign keys: ENABLED');
    console.log('💾 Journal mode: WAL (Write-Ahead Logging)');
    console.log('🌐 Ready for offline-first usage');
    
    return;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
};

/**
 * Check if the database is ready to use
 */
export const isDatabaseReady = async (): Promise<boolean> => {
  try {
    const db = await getDB();
    return !!db;
  } catch (error) {
    console.error('❌ Database not ready:', error);
    return false;
  }
};

/**
 * Utility function to test database connection
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const result = await databaseService.query('SELECT 1 as test');
    if (result.length > 0 && result[0].test === 1) {
      console.log('✅ Database connection test passed');
    } else {
      throw new Error('Database connection test failed');
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
};
