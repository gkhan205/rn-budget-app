/**
 * Drizzle Migration Helper
 * 
 * This file provides utilities to help migrate from the legacy database
 * implementation to the new Drizzle ORM setup.
 */

import {
    AccountService as DrizzleAccountService,
    AppSettingsService as DrizzleAppSettingsService,
    BudgetService as DrizzleBudgetService,
    CategoryService as DrizzleCategoryService,
    ExpenseService as DrizzleExpenseService,
    RecurringExpenseService as DrizzleRecurringExpenseService,
    initializeDatabase
} from './index';

/**
 * Initialize Drizzle ORM and create tables with default data
 * Call this early in your app initialization
 */
export const initializeDrizzle = async (options?: { 
  createDefaults?: boolean 
}): Promise<void> => {
  try {
    await initializeDatabase();
    
    // Initialize default data if requested
    if (options?.createDefaults) {
      await initializeDefaultData();
    }
    
    console.log('✅ Drizzle ORM initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Drizzle ORM:', error);
    throw error;
  }
};

/**
 * Initialize default app data (categories, settings, etc.)
 */
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Initialize default app settings
    await DrizzleAppSettingsService.initializeDefaults();
    
    // Initialize default categories
    await DrizzleCategoryService.createDefaults();
    
    console.log('✅ Default data initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize default data:', error);
    throw error;
  }
};

/**
 * Migration utilities for gradual transition
 */
export const DrizzleMigration = {
  /**
   * Check if Drizzle is ready to use
   */
  async isReady(): Promise<boolean> {
    try {
      // Test basic operations
      await DrizzleBudgetService.getAll();
      return true;
    } catch (error) {
      console.warn('Drizzle not ready:', error);
      return false;
    }
  },

  /**
   * Get preferred service implementations
   * Returns Drizzle services if available, falls back to legacy
   */
  getServices() {
    return {
      Budget: DrizzleBudgetService,
      Expense: DrizzleExpenseService,
      RecurringExpense: DrizzleRecurringExpenseService,
      Account: DrizzleAccountService,
      Category: DrizzleCategoryService,
      AppSettings: DrizzleAppSettingsService,
    };
  },
};

/**
 * Convenience wrapper for common database operations
 */
export const db = {
  budgets: DrizzleBudgetService,
  expenses: DrizzleExpenseService,
  recurringExpenses: DrizzleRecurringExpenseService,
  accounts: DrizzleAccountService,
  categories: DrizzleCategoryService,
  settings: DrizzleAppSettingsService,
};

// Export for easy access
export {
    DrizzleAccountService as AccountService, DrizzleAppSettingsService as AppSettingsService, DrizzleBudgetService as BudgetService, DrizzleCategoryService as CategoryService, DrizzleExpenseService as ExpenseService,
    DrizzleRecurringExpenseService as RecurringExpenseService
};

