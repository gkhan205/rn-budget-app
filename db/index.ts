// SQLite Database Exports
export {
    closeDatabase,
    dbConfig,
    getDatabase, getDB, getDrizzleDb, isDatabaseOpen,
    resetDatabase
} from './config';

// Drizzle schema exports (primary exports)
export * from './schema';

// Drizzle service exports (primary exports)
export * from './services';

// Database initialization
export { createTables, initializeDatabase } from './migrations';

// Legacy exports - for backward compatibility during transition
export {
    Budget as LegacyBudget,
    BudgetService as LegacyBudgetService,
    Expense as LegacyExpense,
    ExpenseService as LegacyExpenseService,
    RecurringExpense as LegacyRecurringExpense,
    RecurringExpenseService as LegacyRecurringExpenseService,
    type FrequencyType as LegacyFrequencyType,
    type PeriodType as LegacyPeriodType
} from './models';

export { DatabaseService, databaseService } from './service';

// Legacy database initialization utilities
export {
    isDatabaseReady, initializeDatabase as legacyInitializeDatabase, testDatabaseConnection
} from './init';

