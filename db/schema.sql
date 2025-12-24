-- =====================================================
-- Drizzle SQLite Schema for Budget App
-- =====================================================
-- This file contains all CREATE TABLE statements with 
-- indexes for the budgeting application database.
-- All statements are idempotent (CREATE IF NOT EXISTS).
-- =====================================================

-- =====================================================
-- ACCOUNTS TABLE
-- Represents user financial accounts (bank, credit, cash, etc.)
-- =====================================================
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

-- =====================================================
-- CATEGORIES TABLE
-- Represents expense/income categories for organization
-- =====================================================
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

-- =====================================================
-- APP SETTINGS TABLE
-- Stores application configuration and user preferences
-- =====================================================
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

-- =====================================================
-- BUDGETS TABLE
-- Represents spending budgets with limits and time periods
-- =====================================================
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

-- =====================================================
-- EXPENSES TABLE
-- Represents individual transactions/expenses
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  account_id TEXT,
  category_id TEXT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  date INTEGER NOT NULL,
  category TEXT, -- Legacy field for backward compatibility
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurring_expense_id TEXT,
  tags TEXT, -- JSON string array of tags
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =====================================================
-- RECURRING EXPENSES TABLE
-- Templates for automatic expense generation
-- =====================================================
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
  category TEXT, -- Legacy field for backward compatibility
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  auto_add INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_account_id ON expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring_expense_id ON expenses(recurring_expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_is_recurring ON expenses(is_recurring);

-- Recurring expenses table indexes
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_budget_id ON recurring_expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_due_date ON recurring_expenses(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_account_id ON recurring_expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_category_id ON recurring_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_is_active ON recurring_expenses(is_active);

-- Budgets table indexes
CREATE INDEX IF NOT EXISTS idx_budgets_is_archived ON budgets(is_archived);
CREATE INDEX IF NOT EXISTS idx_budgets_period_type ON budgets(period_type);
CREATE INDEX IF NOT EXISTS idx_budgets_start_date ON budgets(start_date);

-- Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_is_archived ON accounts(is_archived);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON categories(is_default);

-- App settings table indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_system ON app_settings(is_system);

-- =====================================================
-- SCHEMA NOTES
-- =====================================================

/*
Schema Design Notes:

1. All primary keys are TEXT type using CUID2 for better distribution
2. All timestamps are stored as INTEGER (Unix timestamps) for consistency
3. Boolean values are stored as INTEGER (0/1) for SQLite compatibility
4. Foreign keys use CASCADE delete for dependent records, SET NULL for optional refs
5. Enum constraints are enforced using CHECK constraints
6. Indexes are created for all foreign keys and commonly queried columns
7. Legacy category field maintained for backward compatibility during migration

Table Relationships:
- budgets (1) -> expenses (many)
- budgets (1) -> recurring_expenses (many)
- accounts (1) -> expenses (many, optional)
- accounts (1) -> recurring_expenses (many, optional)
- categories (1) -> expenses (many, optional)
- categories (1) -> recurring_expenses (many, optional)
- categories (1) -> categories (many, for subcategories)
- recurring_expenses (1) -> expenses (many, via recurring_expense_id)

Performance Considerations:
- Indexes on all foreign keys for efficient JOINs
- Date indexes for time-based queries
- Status indexes (is_active, is_archived) for filtering
- Composite indexes may be added based on query patterns

Data Types:
- id: TEXT (CUID2)
- amounts: REAL (for precision with decimals)
- timestamps: INTEGER (Unix timestamps)
- booleans: INTEGER (0/1)
- enums: TEXT with CHECK constraints
- json data: TEXT (for tags, metadata)
*/
