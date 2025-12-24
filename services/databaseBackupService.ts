import { eq } from 'drizzle-orm';
import { getDrizzleDb } from '../db/config';
import type {
  Account,
  AppSetting,
  Budget,
  Category,
  Expense,
  RecurringExpense
} from '../db/schema';
import {
  accounts,
  appSettings,
  budgets,
  categories,
  expenses,
  recurringExpenses
} from '../db/schema';

export interface DatabaseBackup {
  version: string;
  timestamp: string;
  metadata: {
    exportDate: string;
    appVersion: string;
    recordCounts: {
      accounts: number;
      appSettings: number;
      budgets: number;
      categories: number;
      expenses: number;
      recurringExpenses: number;
    };
  };
  data: {
    accounts: Account[];
    appSettings: AppSetting[];
    budgets: Budget[];
    categories: Category[];
    expenses: Expense[];
    recurringExpenses: RecurringExpense[];
  };
}

export interface BackupValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCounts: {
    accounts: number;
    appSettings: number;
    budgets: number;
    categories: number;
    expenses: number;
    recurringExpenses: number;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCounts: {
    accounts: number;
    appSettings: number;
    budgets: number;
    categories: number;
    expenses: number;
    recurringExpenses: number;
  };
  errors: string[];
}

export class DatabaseBackupService {
  private static readonly BACKUP_VERSION = '1.0.0';
  
  /**
   * Export all database tables to a JSON backup
   */
  static async exportDatabase(): Promise<DatabaseBackup> {
    try {
      const db = getDrizzleDb();
      
      // Fetch all data from all tables
      const [
        accountsData,
        appSettingsData,
        budgetsData,
        categoriesData,
        expensesData,
        recurringExpensesData,
      ] = await Promise.all([
        db.select().from(accounts),
        db.select().from(appSettings),
        db.select().from(budgets),
        db.select().from(categories),
        db.select().from(expenses),
        db.select().from(recurringExpenses),
      ]);

      const backup: DatabaseBackup = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        metadata: {
          exportDate: new Date().toLocaleDateString(),
          appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
          recordCounts: {
            accounts: accountsData.length,
            appSettings: appSettingsData.length,
            budgets: budgetsData.length,
            categories: categoriesData.length,
            expenses: expensesData.length,
            recurringExpenses: recurringExpensesData.length,
          },
        },
        data: {
          accounts: accountsData,
          appSettings: appSettingsData,
          budgets: budgetsData,
          categories: categoriesData,
          expenses: expensesData,
          recurringExpenses: recurringExpensesData,
        },
      };

      return backup;
    } catch (error) {
      console.error('Failed to export database:', error);
      throw new Error(`Database export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a backup file before import
   */
  static validateBackup(backupData: any): BackupValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Check if backup data exists
      if (!backupData) {
        errors.push('Backup data is empty or invalid');
        return {
          isValid: false,
          errors,
          warnings,
          recordCounts: {
            accounts: 0,
            appSettings: 0,
            budgets: 0,
            categories: 0,
            expenses: 0,
            recurringExpenses: 0,
          },
        };
      }

      // Check backup structure
      if (!backupData.version) {
        errors.push('Backup version is missing');
      } else if (backupData.version !== this.BACKUP_VERSION) {
        warnings.push(`Backup version mismatch. Expected: ${this.BACKUP_VERSION}, Found: ${backupData.version}`);
      }

      if (!backupData.timestamp) {
        errors.push('Backup timestamp is missing');
      }

      if (!backupData.data) {
        errors.push('Backup data section is missing');
        return {
          isValid: false,
          errors,
          warnings,
          recordCounts: {
            accounts: 0,
            appSettings: 0,
            budgets: 0,
            categories: 0,
            expenses: 0,
            recurringExpenses: 0,
          },
        };
      }

      // Check each table
      const requiredTables = ['accounts', 'appSettings', 'budgets', 'categories', 'expenses', 'recurringExpenses'];
      const recordCounts = {
        accounts: 0,
        appSettings: 0,
        budgets: 0,
        categories: 0,
        expenses: 0,
        recurringExpenses: 0,
      };

      for (const table of requiredTables) {
        if (!Array.isArray(backupData.data[table])) {
          errors.push(`Table '${table}' is missing or not an array`);
        } else {
          recordCounts[table as keyof typeof recordCounts] = backupData.data[table].length;
        }
      }

      // Validate data integrity
      const { data } = backupData;

      // Check for required fields in key tables
      if (data.accounts?.length > 0) {
        const firstAccount = data.accounts[0];
        if (!firstAccount.id || !firstAccount.name || !firstAccount.type) {
          warnings.push('Account records may be missing required fields');
        }
      }

      if (data.budgets?.length > 0) {
        const firstBudget = data.budgets[0];
        if (!firstBudget.id || !firstBudget.name) {
          warnings.push('Budget records may be missing required fields');
        }
      }

      if (data.expenses?.length > 0) {
        const firstExpense = data.expenses[0];
        if (!firstExpense.id || firstExpense.amount === undefined || !firstExpense.date) {
          warnings.push('Expense records may be missing required fields');
        }
      }

      // Check for orphaned records
      const budgetIds = new Set(data.budgets?.map((b: any) => b.id) || []);
      const accountIds = new Set(data.accounts?.map((a: any) => a.id) || []);
      const categoryIds = new Set(data.categories?.map((c: any) => c.id) || []);

      let orphanedExpenses = 0;
      let orphanedRecurring = 0;

      data.expenses?.forEach((expense: any) => {
        if (expense.budgetId && !budgetIds.has(expense.budgetId)) orphanedExpenses++;
        if (expense.accountId && !accountIds.has(expense.accountId)) orphanedExpenses++;
        if (expense.categoryId && !categoryIds.has(expense.categoryId)) orphanedExpenses++;
      });

      data.recurringExpenses?.forEach((recurring: any) => {
        if (recurring.budgetId && !budgetIds.has(recurring.budgetId)) orphanedRecurring++;
        if (recurring.accountId && !accountIds.has(recurring.accountId)) orphanedRecurring++;
      });

      if (orphanedExpenses > 0) {
        warnings.push(`${orphanedExpenses} expense records reference missing budgets, accounts, or categories`);
      }

      if (orphanedRecurring > 0) {
        warnings.push(`${orphanedRecurring} recurring expense records reference missing budgets or accounts`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        recordCounts,
      };

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        errors,
        warnings,
        recordCounts: {
          accounts: 0,
          appSettings: 0,
          budgets: 0,
          categories: 0,
          expenses: 0,
          recurringExpenses: 0,
        },
      };
    }
  }

  /**
   * Clear all data from database tables
   */
  static async clearDatabase(): Promise<void> {
    try {
      const db = getDrizzleDb();
      
      // Delete in reverse dependency order to avoid foreign key constraints
      await db.delete(expenses);
      await db.delete(recurringExpenses);
      await db.delete(budgets);
      await db.delete(categories);
      await db.delete(accounts);
      await db.delete(appSettings);
      
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw new Error(`Database clearing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import data from backup with option to overwrite existing data
   */
  static async importDatabase(backup: DatabaseBackup, overwrite: boolean = false): Promise<ImportResult> {
    try {
      const db = getDrizzleDb();
      
      // Validate backup first
      const validation = this.validateBackup(backup);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Backup validation failed',
          importedCounts: {
            accounts: 0,
            appSettings: 0,
            budgets: 0,
            categories: 0,
            expenses: 0,
            recurringExpenses: 0,
          },
          errors: validation.errors,
        };
      }

      let importedCounts = {
        accounts: 0,
        appSettings: 0,
        budgets: 0,
        categories: 0,
        expenses: 0,
        recurringExpenses: 0,
      };

      // Clear existing data if overwrite is enabled
      if (overwrite) {
        await this.clearDatabase();
      }

      const { data } = backup;

      // Import in dependency order
      
      // 1. Import app settings
      if (data.appSettings?.length > 0) {
        for (const setting of data.appSettings) {
          try {
            if (overwrite) {
              await db.insert(appSettings).values(setting);
              importedCounts.appSettings++;
            } else {
              // Check if setting exists
              const existing = await db.select().from(appSettings).where(eq(appSettings.key, setting.key)).limit(1);
              if (existing.length === 0) {
                await db.insert(appSettings).values(setting);
                importedCounts.appSettings++;
              }
            }
          } catch (error) {
            console.warn(`Failed to import app setting: ${setting.key}`, error);
          }
        }
      }

      // 2. Import accounts
      if (data.accounts?.length > 0) {
        for (const account of data.accounts) {
          try {
            await db.insert(accounts).values({
              ...account,
              createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
              updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
            });
            importedCounts.accounts++;
          } catch (error) {
            console.warn(`Failed to import account: ${account.name}`, error);
          }
        }
      }

      // 3. Import categories
      if (data.categories?.length > 0) {
        for (const category of data.categories) {
          try {
            await db.insert(categories).values({
              ...category,
              createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
              updatedAt: category.updatedAt ? new Date(category.updatedAt) : new Date(),
            });
            importedCounts.categories++;
          } catch (error) {
            console.warn(`Failed to import category: ${category.name}`, error);
          }
        }
      }

      // 4. Import budgets
      if (data.budgets?.length > 0) {
        for (const budget of data.budgets) {
          try {
            await db.insert(budgets).values({
              ...budget,
              startDate: new Date(budget.startDate),
              endDate: budget.endDate ? new Date(budget.endDate) : null,
              createdAt: budget.createdAt ? new Date(budget.createdAt) : new Date(),
              updatedAt: budget.updatedAt ? new Date(budget.updatedAt) : new Date(),
            });
            importedCounts.budgets++;
          } catch (error) {
            console.warn(`Failed to import budget: ${budget.name}`, error);
          }
        }
      }

      // 5. Import recurring expenses
      if (data.recurringExpenses?.length > 0) {
        for (const recurringExpense of data.recurringExpenses) {
          try {
            await db.insert(recurringExpenses).values({
              ...recurringExpense,
              startDate: new Date(recurringExpense.startDate),
              endDate: recurringExpense.endDate ? new Date(recurringExpense.endDate) : null,
              createdAt: recurringExpense.createdAt ? new Date(recurringExpense.createdAt) : new Date(),
              updatedAt: recurringExpense.updatedAt ? new Date(recurringExpense.updatedAt) : new Date(),
            });
            importedCounts.recurringExpenses++;
          } catch (error) {
            console.warn(`Failed to import recurring expense: ${recurringExpense.name}`, error);
          }
        }
      }

      // 6. Import expenses
      if (data.expenses?.length > 0) {
        for (const expense of data.expenses) {
          try {
            await db.insert(expenses).values({
              ...expense,
              date: new Date(expense.date),
              createdAt: expense.createdAt ? new Date(expense.createdAt) : new Date(),
              updatedAt: expense.updatedAt ? new Date(expense.updatedAt) : new Date(),
            });
            importedCounts.expenses++;
          } catch (error) {
            console.warn(`Failed to import expense: ${expense.description}`, error);
          }
        }
      }

      const totalImported = Object.values(importedCounts).reduce((sum, count) => sum + count, 0);
      
      return {
        success: true,
        message: `Successfully imported ${totalImported} records from backup`,
        importedCounts,
        errors: [],
      };

    } catch (error) {
      console.error('Failed to import database:', error);
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        importedCounts: {
          accounts: 0,
          appSettings: 0,
          budgets: 0,
          categories: 0,
          expenses: 0,
          recurringExpenses: 0,
        },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    try {
      const db = getDrizzleDb();
      
      const [
        accountsCount,
        appSettingsCount,
        budgetsCount,
        categoriesCount,
        expensesCount,
        recurringExpensesCount,
      ] = await Promise.all([
        db.select().from(accounts).then(rows => rows.length),
        db.select().from(appSettings).then(rows => rows.length),
        db.select().from(budgets).then(rows => rows.length),
        db.select().from(categories).then(rows => rows.length),
        db.select().from(expenses).then(rows => rows.length),
        db.select().from(recurringExpenses).then(rows => rows.length),
      ]);

      return {
        accounts: accountsCount,
        appSettings: appSettingsCount,
        budgets: budgetsCount,
        categories: categoriesCount,
        expenses: expensesCount,
        recurringExpenses: recurringExpensesCount,
        total: accountsCount + appSettingsCount + budgetsCount + categoriesCount + expensesCount + recurringExpensesCount,
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Generate backup file name
   */
  static generateBackupFileName(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `budget_app_backup_${dateStr}_${timeStr}.json`;
  }
}
