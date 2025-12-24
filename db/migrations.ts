import { getDatabase } from './config';

/**
 * Initialize and run database migrations
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // For now, we'll create tables manually
    // In the future, this can be replaced with proper Drizzle migrations
    await createTables();
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
};

/**
 * Create tables manually if migrations are not available
 * This is a fallback for development
 */
export const createTables = async (): Promise<void> => {
  try {
    const database = await getDatabase();
    
    // Create accounts table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other')),
        balance REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        icon TEXT NOT NULL DEFAULT '💳',
        color TEXT NOT NULL DEFAULT '#2196F3',
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // Create categories table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT '📂',
        color TEXT NOT NULL DEFAULT '#9E9E9E',
        type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income', 'both')),
        parent_id TEXT,
        description TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);
    
    // Create app_settings table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        type TEXT NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
        description TEXT,
        is_system INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT 'general',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // Create budgets table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        limit_amount REAL,
        period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'weekly', 'custom', 'noEndDate')),
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    
    // Create expenses table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        budget_id TEXT NOT NULL,
        account_id TEXT,
        category_id TEXT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        date INTEGER NOT NULL,
        category TEXT,
        is_recurring INTEGER NOT NULL DEFAULT 0,
        recurring_expense_id TEXT,
        tags TEXT,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);
    
    // Create recurring_expenses table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id TEXT PRIMARY KEY,
        budget_id TEXT NOT NULL,
        account_id TEXT,
        category_id TEXT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
        start_date INTEGER NOT NULL,
        next_due_date INTEGER NOT NULL,
        end_date INTEGER,
        category TEXT,
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        auto_add INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);
    
    // Create indexes for performance
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_account_id ON expenses(account_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
      
      CREATE INDEX IF NOT EXISTS idx_recurring_expenses_budget_id ON recurring_expenses(budget_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_due_date ON recurring_expenses(next_due_date);
      CREATE INDEX IF NOT EXISTS idx_recurring_expenses_account_id ON recurring_expenses(account_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_expenses_category_id ON recurring_expenses(category_id);
      
      CREATE INDEX IF NOT EXISTS idx_budgets_is_archived ON budgets(is_archived);
      CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);
      CREATE INDEX IF NOT EXISTS idx_accounts_is_archived ON accounts(is_archived);
      CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
      CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
      CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
      CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
    `);
    
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Failed to create database tables:', error);
    throw new Error(`Failed to create database tables: ${error}`);
  }
};
