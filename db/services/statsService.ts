import { asc, count, desc, sql, sum } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { budgets } from '../schema/budgets';
import { expenses } from '../schema/expenses';
import { recurringExpenses } from '../schema/recurringExpenses';

/**
 * Stats Service - Provides database-level aggregations and analytics
 * All computations are done in SQL for performance
 */

export interface CategorySpendingStats {
  category: string;
  totalAmount: number;
  transactionCount: number;
  avgTransactionAmount: number;
}

export interface DailySpendingTrend {
  date: string; // YYYY-MM-DD format
  totalAmount: number;
  transactionCount: number;
}

export interface BudgetPerformanceStats {
  budgetId: string;
  budgetName: string;
  plannedAmount: number | null;
  actualAmount: number;
  recurringPlannedAmount: number;
  variance: number; // actual - planned
  utilizationPercentage: number | null; // (actual / planned) * 100
}

export interface RecurringVsNonRecurringStats {
  recurringTotal: number;
  nonRecurringTotal: number;
  totalAmount: number;
  recurringPercentage: number;
  nonRecurringPercentage: number;
  recurringCount: number;
  nonRecurringCount: number;
}

export interface MonthlySpendingStats {
  month: string; // YYYY-MM format
  totalAmount: number;
  transactionCount: number;
  avgDailySpending: number;
}

export class StatsService {
  /**
   * Get spending statistics grouped by category
   * Uses SUM() and COUNT() aggregations in SQL
   */
  static async getCategorySpendingStats(
    startDate?: Date,
    endDate?: Date,
    budgetId?: string
  ): Promise<CategorySpendingStats[]> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions array
    const whereConditions = [sql`${expenses.category} IS NOT NULL`];
    
    if (budgetId) {
      whereConditions.push(sql`${expenses.budgetId} = ${budgetId}`);
    }
    if (startDate && endDate) {
      whereConditions.push(sql`${expenses.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`);
    } else if (startDate) {
      whereConditions.push(sql`${expenses.date} >= ${startDate.toISOString()}`);
    } else if (endDate) {
      whereConditions.push(sql`${expenses.date} <= ${endDate.toISOString()}`);
    }

    const query = db
      .select({
        category: expenses.category,
        totalAmount: sum(expenses.amount).as('total_amount'),
        transactionCount: count(expenses.id).as('transaction_count'),
        avgTransactionAmount: sql<number>`ROUND(AVG(${expenses.amount}), 2)`.as('avg_amount')
      })
      .from(expenses)
      .where(sql.join(whereConditions, sql.raw(' AND ')))
      .groupBy(expenses.category)
      .orderBy(desc(sql`total_amount`));

    const results = await query;
    
    return results.map(row => ({
      category: row.category || 'Unknown',
      totalAmount: Number(row.totalAmount) || 0,
      transactionCount: Number(row.transactionCount) || 0,
      avgTransactionAmount: Number(row.avgTransactionAmount) || 0,
    }));
  }

  /**
   * Get daily spending trend over a date range
   * Uses SUM() and COUNT() with DATE grouping in SQL
   */
  static async getDailySpendingTrend(
    startDate: Date,
    endDate: Date,
    budgetId?: string
  ): Promise<DailySpendingTrend[]> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions array
    const whereConditions = [
      sql`${expenses.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`
    ];
    
    if (budgetId) {
      whereConditions.push(sql`${expenses.budgetId} = ${budgetId}`);
    }

    const query = db
      .select({
        date: sql<string>`DATE(${expenses.date})`.as('spending_date'),
        totalAmount: sum(expenses.amount).as('daily_total'),
        transactionCount: count(expenses.id).as('daily_count')
      })
      .from(expenses)
      .where(sql.join(whereConditions, sql.raw(' AND ')))
      .groupBy(sql`DATE(${expenses.date})`)
      .orderBy(asc(sql`spending_date`));

    const results = await query;
    
    return results.map(row => ({
      date: row.date,
      totalAmount: Number(row.totalAmount) || 0,
      transactionCount: Number(row.transactionCount) || 0,
    }));
  }

  /**
   * Get planned vs actual spending per budget
   * Joins budgets and expenses tables with aggregations
   */
  static async getBudgetPerformanceStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<BudgetPerformanceStats[]> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions for expenses
    const expenseConditions = [];
    if (startDate && endDate) {
      expenseConditions.push(sql`${expenses.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`);
    } else if (startDate) {
      expenseConditions.push(sql`${expenses.date} >= ${startDate.toISOString()}`);
    } else if (endDate) {
      expenseConditions.push(sql`${expenses.date} <= ${endDate.toISOString()}`);
    }

    // Get actual spending per budget
    const expenseQueryBuilder = db
      .select({
        budgetId: expenses.budgetId,
        actualAmount: sum(expenses.amount).as('actual_total')
      })
      .from(expenses);
    
    let expenseQuery = expenseConditions.length > 0 
      ? expenseQueryBuilder.where(sql.join(expenseConditions, sql.raw(' AND '))).groupBy(expenses.budgetId)
      : expenseQueryBuilder.groupBy(expenses.budgetId);

    // Get recurring expenses planned amounts per budget
    const recurringQuery = db
      .select({
        budgetId: recurringExpenses.budgetId,
        recurringPlannedAmount: sum(recurringExpenses.amount).as('recurring_planned')
      })
      .from(recurringExpenses)
      .where(sql`${recurringExpenses.isActive} = 1`)
      .groupBy(recurringExpenses.budgetId);

    // Get all budgets (use isArchived = 0 for active budgets)
    const budgetQuery = db
      .select({
        id: budgets.id,
        name: budgets.name,
        plannedAmount: budgets.income
      })
      .from(budgets)
      .where(sql`${budgets.isArchived} = 0`);

    const [expenseResults, recurringResults, budgetResults] = await Promise.all([
      expenseQuery,
      recurringQuery,
      budgetQuery
    ]);

    // Create maps for quick lookup
    const expenseMap = new Map(
      expenseResults.map(row => [row.budgetId, Number(row.actualAmount) || 0])
    );
    const recurringMap = new Map(
      recurringResults.map(row => [row.budgetId, Number(row.recurringPlannedAmount) || 0])
    );

    return budgetResults.map(budget => {
      const actualAmount = expenseMap.get(budget.id) || 0;
      const recurringPlannedAmount = recurringMap.get(budget.id) || 0;
      const plannedAmount = budget.plannedAmount;
      
      const variance = plannedAmount ? actualAmount - plannedAmount : actualAmount;
      const utilizationPercentage = plannedAmount && plannedAmount > 0 
        ? Math.round((actualAmount / plannedAmount) * 100) 
        : null;

      return {
        budgetId: budget.id,
        budgetName: budget.name,
        plannedAmount,
        actualAmount,
        recurringPlannedAmount,
        variance,
        utilizationPercentage,
      };
    });
  }

  /**
   * Get recurring vs non-recurring spending totals
   * Uses SUM() with conditional aggregation in SQL
   */
  static async getRecurringVsNonRecurringStats(
    startDate?: Date,
    endDate?: Date,
    budgetId?: string
  ): Promise<RecurringVsNonRecurringStats> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions array
    const whereConditions = [];
    if (startDate && endDate) {
      whereConditions.push(sql`${expenses.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`);
    } else if (startDate) {
      whereConditions.push(sql`${expenses.date} >= ${startDate.toISOString()}`);
    } else if (endDate) {
      whereConditions.push(sql`${expenses.date} <= ${endDate.toISOString()}`);
    }

    if (budgetId) {
      whereConditions.push(sql`${expenses.budgetId} = ${budgetId}`);
    }

    const queryBuilder = db
      .select({
        recurringTotal: sql<number>`SUM(CASE WHEN ${expenses.isRecurring} = 1 THEN ${expenses.amount} ELSE 0 END)`.as('recurring_total'),
        nonRecurringTotal: sql<number>`SUM(CASE WHEN ${expenses.isRecurring} = 0 OR ${expenses.isRecurring} IS NULL THEN ${expenses.amount} ELSE 0 END)`.as('non_recurring_total'),
        totalAmount: sum(expenses.amount).as('total_amount'),
        recurringCount: sql<number>`COUNT(CASE WHEN ${expenses.isRecurring} = 1 THEN 1 END)`.as('recurring_count'),
        nonRecurringCount: sql<number>`COUNT(CASE WHEN ${expenses.isRecurring} = 0 OR ${expenses.isRecurring} IS NULL THEN 1 END)`.as('non_recurring_count'),
      })
      .from(expenses);

    const query = whereConditions.length > 0 
      ? queryBuilder.where(sql.join(whereConditions, sql.raw(' AND ')))
      : queryBuilder;

    const [result] = await query;
    
    const recurringTotal = Number(result.recurringTotal) || 0;
    const nonRecurringTotal = Number(result.nonRecurringTotal) || 0;
    const totalAmount = Number(result.totalAmount) || 0;
    const recurringCount = Number(result.recurringCount) || 0;
    const nonRecurringCount = Number(result.nonRecurringCount) || 0;

    const recurringPercentage = totalAmount > 0 ? Math.round((recurringTotal / totalAmount) * 100) : 0;
    const nonRecurringPercentage = totalAmount > 0 ? Math.round((nonRecurringTotal / totalAmount) * 100) : 0;

    return {
      recurringTotal,
      nonRecurringTotal,
      totalAmount,
      recurringPercentage,
      nonRecurringPercentage,
      recurringCount,
      nonRecurringCount,
    };
  }

  /**
   * Get monthly spending statistics
   * Uses DATE functions and aggregations in SQL
   */
  static async getMonthlySpendingStats(
    year?: number
  ): Promise<MonthlySpendingStats[]> {
    const db = getDrizzleDb();
    
    const currentYear = year || new Date().getFullYear();
    
    const results = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${expenses.date})`.as('spending_month'),
        totalAmount: sum(expenses.amount).as('monthly_total'),
        transactionCount: count(expenses.id).as('monthly_count'),
        avgDailySpending: sql<number>`ROUND(SUM(${expenses.amount}) / COUNT(DISTINCT DATE(${expenses.date})), 2)`.as('avg_daily')
      })
      .from(expenses)
      .where(sql`strftime('%Y', ${expenses.date}) = ${currentYear.toString()}`)
      .groupBy(sql`strftime('%Y-%m', ${expenses.date})`)
      .orderBy(asc(sql`spending_month`));

    return results.map(row => ({
      month: row.month,
      totalAmount: Number(row.totalAmount) || 0,
      transactionCount: Number(row.transactionCount) || 0,
      avgDailySpending: Number(row.avgDailySpending) || 0,
    }));
  }

  /**
   * Get spending statistics for the current week
   * Uses DATE functions to filter current week and aggregate
   */
  static async getCurrentWeekStats(): Promise<{
    totalSpending: number;
    transactionCount: number;
    avgPerDay: number;
    topCategory: string | null;
    topCategoryAmount: number;
  }> {
    const db = getDrizzleDb();
    
    // Get start of current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get total stats for the week
    const [weeklyStats] = await db
      .select({
        totalSpending: sum(expenses.amount).as('weekly_total'),
        transactionCount: count(expenses.id).as('weekly_count'),
        avgPerDay: sql<number>`ROUND(SUM(${expenses.amount}) / 7, 2)`.as('avg_daily')
      })
      .from(expenses)
      .where(sql`${expenses.date} BETWEEN ${startOfWeek} AND ${endOfWeek}`);

    // Get top category for the week
    const topCategoryResults = await db
      .select({
        category: expenses.category,
        categoryTotal: sum(expenses.amount).as('category_total')
      })
      .from(expenses)
      .where(sql`${expenses.date} BETWEEN ${startOfWeek} AND ${endOfWeek} AND ${expenses.category} IS NOT NULL`)
      .groupBy(expenses.category)
      .orderBy(desc(sql`category_total`))
      .limit(1);

    const topCategory = topCategoryResults[0];

    return {
      totalSpending: Number(weeklyStats.totalSpending) || 0,
      transactionCount: Number(weeklyStats.transactionCount) || 0,
      avgPerDay: Number(weeklyStats.avgPerDay) || 0,
      topCategory: topCategory?.category || null,
      topCategoryAmount: Number(topCategory?.categoryTotal) || 0,
    };
  }

  /**
   * Get top spending categories for a given period
   * Uses SUM() with LIMIT for top N categories
   */
  static async getTopSpendingCategories(
    limit: number = 5,
    startDate?: Date,
    endDate?: Date,
    budgetId?: string
  ): Promise<CategorySpendingStats[]> {
    const db = getDrizzleDb();
    
    // Build WHERE conditions array
    const whereConditions = [sql`${expenses.category} IS NOT NULL`];
    
    if (startDate && endDate) {
      whereConditions.push(sql`${expenses.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`);
    } else if (startDate) {
      whereConditions.push(sql`${expenses.date} >= ${startDate.toISOString()}`);
    } else if (endDate) {
      whereConditions.push(sql`${expenses.date} <= ${endDate.toISOString()}`);
    }

    if (budgetId) {
      whereConditions.push(sql`${expenses.budgetId} = ${budgetId}`);
    }

    const query = db
      .select({
        category: expenses.category,
        totalAmount: sum(expenses.amount).as('total_amount'),
        transactionCount: count(expenses.id).as('transaction_count'),
        avgTransactionAmount: sql<number>`ROUND(AVG(${expenses.amount}), 2)`.as('avg_amount')
      })
      .from(expenses)
      .where(sql.join(whereConditions, sql.raw(' AND ')))
      .groupBy(expenses.category)
      .orderBy(desc(sql`total_amount`))
      .limit(limit);

    const results = await query;
    
    return results.map(row => ({
      category: row.category || 'Unknown',
      totalAmount: Number(row.totalAmount) || 0,
      transactionCount: Number(row.transactionCount) || 0,
      avgTransactionAmount: Number(row.avgTransactionAmount) || 0,
    }));
  }
}
