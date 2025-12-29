import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getDrizzleDb } from '../db/config';
import { accounts } from '../db/schema/accounts';
import { budgets } from '../db/schema/budgets';
import { categories } from '../db/schema/categories';
import { expenses } from '../db/schema/expenses';

export interface ExpenseExportRecord {
  date: string;
  amount: number;
  category: string;
  budget: string;
  account: string;
  note: string;
}

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
  budgetId?: string;
  accountId?: string;
  categoryId?: string;
  includeRecurring?: boolean;
}

export class ExpenseExportService {
  /**
   * Export expenses to CSV format with joins for readable field values
   */
  static async exportExpensesToCSV(options: ExportOptions = {}): Promise<string> {
    const records = await this.getExpenseExportData(options);
    return this.convertToCSV(records);
  }

  /**
   * Get expense data with joins for export
   */
  static async getExpenseExportData(options: ExportOptions = {}): Promise<ExpenseExportRecord[]> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions
    const conditions = [];
    
    if (options.startDate) {
      conditions.push(gte(expenses.date, options.startDate));
    }
    
    if (options.endDate) {
      conditions.push(lte(expenses.date, options.endDate));
    }
    
    if (options.budgetId) {
      conditions.push(eq(expenses.budgetId, options.budgetId));
    }
    
    if (options.accountId) {
      conditions.push(eq(expenses.accountId, options.accountId));
    }
    
    if (options.categoryId) {
      conditions.push(eq(expenses.categoryId, options.categoryId));
    }
    
    if (options.includeRecurring === false) {
      conditions.push(eq(expenses.isRecurring, false));
    }

    // Execute query with joins
    const results = await db
      .select({
        date: expenses.date,
        amount: expenses.amount,
        description: expenses.description,
        notes: expenses.notes,
        category: expenses.category, // Legacy field
        budgetName: budgets.name,
        accountName: accounts.name,
        categoryName: categories.name,
      })
      .from(expenses)
      .leftJoin(budgets, eq(expenses.budgetId, budgets.id))
      .leftJoin(accounts, eq(expenses.accountId, accounts.id))
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.date));

    // Transform to export format
    return results.map((record: {
      date: Date;
      amount: number;
      description: string;
      notes: string | null;
      category: string | null;
      budgetName: string | null;
      accountName: string | null;
      categoryName: string | null;
    }) => ({
      date: this.formatDate(record.date),
      amount: record.amount,
      category: record.categoryName || record.category || 'Uncategorized',
      budget: record.budgetName || 'Unknown Budget',
      account: record.accountName || 'Unknown Account',
      note: record.notes || record.description || '',
    }));
  }

  /**
   * Get expense summary by category for export
   */
  static async getExpenseSummaryByCategory(options: ExportOptions = {}): Promise<string> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions
    const conditions = [];
    
    if (options.startDate) {
      conditions.push(gte(expenses.date, options.startDate));
    }
    
    if (options.endDate) {
      conditions.push(lte(expenses.date, options.endDate));
    }
    
    if (options.budgetId) {
      conditions.push(eq(expenses.budgetId, options.budgetId));
    }

    // Query with aggregation
    const results = await db
      .select({
        category: categories.name,
        legacyCategory: expenses.category,
        totalAmount: expenses.amount,
        count: expenses.id,
        budgetName: budgets.name,
      })
      .from(expenses)
      .leftJoin(budgets, eq(expenses.budgetId, budgets.id))
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.date));

    // Group by category and sum amounts
    const categoryTotals = new Map<string, { total: number; count: number; budget: string }>();
    
    results.forEach((record: {
      category: string | null;
      legacyCategory: string | null;
      totalAmount: number;
      budgetName: string | null;
    }) => {
      const categoryName = record.category || record.legacyCategory || 'Uncategorized';
      const budgetName = record.budgetName || 'Unknown Budget';
      
      if (categoryTotals.has(categoryName)) {
        const existing = categoryTotals.get(categoryName)!;
        existing.total += record.totalAmount;
        existing.count += 1;
      } else {
        categoryTotals.set(categoryName, {
          total: record.totalAmount,
          count: 1,
          budget: budgetName,
        });
      }
    });

    // Convert to CSV
    const headers = ['Category', 'Total Amount', 'Transaction Count', 'Primary Budget'];
    const rows = Array.from(categoryTotals.entries()).map(([category, data]) => [
      category,
      data.total.toFixed(2),
      data.count.toString(),
      data.budget,
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Get expense summary by budget for export
   */
  static async getExpenseSummaryByBudget(options: ExportOptions = {}): Promise<string> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions
    const conditions = [];
    
    if (options.startDate) {
      conditions.push(gte(expenses.date, options.startDate));
    }
    
    if (options.endDate) {
      conditions.push(lte(expenses.date, options.endDate));
    }

    // Query with aggregation
    const results = await db
      .select({
        budgetName: budgets.name,
        budgetLimit: budgets.income,
        amount: expenses.amount,
      })
      .from(expenses)
      .leftJoin(budgets, eq(expenses.budgetId, budgets.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Group by budget and sum amounts
    const budgetTotals = new Map<string, { total: number; count: number; limit: number | null }>();
    
    results.forEach((record: {
      budgetName: string | null;
      budgetLimit: number | null;
      amount: number;
    }) => {
      const budgetName = record.budgetName || 'Unknown Budget';
      
      if (budgetTotals.has(budgetName)) {
        const existing = budgetTotals.get(budgetName)!;
        existing.total += record.amount;
        existing.count += 1;
      } else {
        budgetTotals.set(budgetName, {
          total: record.amount,
          count: 1,
          limit: record.budgetLimit,
        });
      }
    });

    // Convert to CSV
    const headers = ['Budget', 'Total Spent', 'Transaction Count', 'Budget Limit', 'Remaining', 'Usage %'];
    const rows = Array.from(budgetTotals.entries()).map(([budget, data]) => {
      const remaining = data.limit ? data.limit - data.total : null;
      const usagePercent = data.limit ? ((data.total / data.limit) * 100).toFixed(1) : 'N/A';
      
      return [
        budget,
        data.total.toFixed(2),
        data.count.toString(),
        data.limit?.toFixed(2) || 'No Limit',
        remaining?.toFixed(2) || 'N/A',
        usagePercent + (typeof usagePercent === 'string' ? '' : '%'),
      ];
    });

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Convert expense records to CSV string
   */
  private static convertToCSV(records: ExpenseExportRecord[]): string {
    const headers = ['Date', 'Amount', 'Category', 'Budget', 'Account', 'Note'];
    const rows = records.map(record => [
      record.date,
      record.amount.toFixed(2),
      record.category,
      record.budget,
      record.account,
      record.note,
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Convert array of arrays to CSV string with proper escaping
   */
  private static arrayToCSV(data: string[][]): string {
    return data.map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = field.replace(/"/g, '""');
        return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    ).join('\n');
  }

  /**
   * Format date for export
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Get expenses for a specific date range
   */
  static async getExpensesByDateRange(
    startDate: Date,
    endDate: Date,
    options: Omit<ExportOptions, 'startDate' | 'endDate'> = {}
  ): Promise<ExpenseExportRecord[]> {
    return this.getExpenseExportData({
      ...options,
      startDate,
      endDate,
    });
  }

  /**
   * Export expenses for current month
   */
  static async exportCurrentMonthToCSV(): Promise<string> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.exportExpensesToCSV({ startDate, endDate });
  }

  /**
   * Export expenses for last month
   */
  static async exportLastMonthToCSV(): Promise<string> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return this.exportExpensesToCSV({ startDate, endDate });
  }

  /**
   * Export expenses for current year
   */
  static async exportCurrentYearToCSV(): Promise<string> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear(), 11, 31);
    
    return this.exportExpensesToCSV({ startDate, endDate });
  }

  /**
   * Get file name suggestion based on export options
   */
  static getExportFileName(options: ExportOptions = {}): string {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];
    
    if (options.startDate && options.endDate) {
      const start = this.formatDate(options.startDate);
      const end = this.formatDate(options.endDate);
      return `expenses_${start}_to_${end}.csv`;
    }
    
    if (options.budgetId) {
      return `expenses_budget_${timestamp}.csv`;
    }
    
    if (options.accountId) {
      return `expenses_account_${timestamp}.csv`;
    }
    
    return `expenses_export_${timestamp}.csv`;
  }
}
