import { and, desc, eq } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import {
  budgetPeriods,
  type BudgetPeriod,
  type NewBudgetPeriod,
} from '../schema/budgetPeriods';
import { budgets } from '../schema/budgets';

export class BudgetPeriodService {
  /**
   * Get or create a budget period for a specific month/year
   */
  static async getOrCreatePeriod(
    budgetId: string,
    year: number,
    month: number
  ): Promise<BudgetPeriod> {
    const db = getDrizzleDb();

    // Check if period already exists
    const existingPeriod = await db
      .select()
      .from(budgetPeriods)
      .where(
        and(
          eq(budgetPeriods.budgetId, budgetId),
          eq(budgetPeriods.year, year),
          eq(budgetPeriods.month, month)
        )
      )
      .limit(1);

    if (existingPeriod.length > 0) {
      return existingPeriod[0];
    }

    // Create new period
    const periodStart = new Date(year, month - 1, 1); // month - 1 because Date months are 0-indexed
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    // Get the budget to copy the default income
    const budget = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, budgetId))
      .limit(1);

    const defaultLimitAmount = budget.length > 0 ? budget[0].income : 0;

    const newPeriod: NewBudgetPeriod = {
      budgetId,
      year,
      month,
      limitAmount: defaultLimitAmount,
      periodStart,
      periodEnd,
      isNotified: false,
    };

    const result = await db.insert(budgetPeriods).values(newPeriod).returning();
    return result[0];
  }

  /**
   * Update the limit amount for a specific budget period
   */
  static async updateLimitAmount(
    budgetId: string,
    year: number,
    month: number,
    limitAmount: number
  ): Promise<void> {
    const db = getDrizzleDb();
    await db
      .update(budgetPeriods)
      .set({
        limitAmount,
        updatedAt: new Date(),
        isNotified: true, // Mark as notified when user updates
      })
      .where(
        and(
          eq(budgetPeriods.budgetId, budgetId),
          eq(budgetPeriods.year, year),
          eq(budgetPeriods.month, month)
        )
      );
  }

  /**
   * Get budget period for a specific month/year
   */
  static async getPeriod(
    budgetId: string,
    year: number,
    month: number
  ): Promise<BudgetPeriod | null> {
    const db = getDrizzleDb();
    const result = await db
      .select()
      .from(budgetPeriods)
      .where(
        and(
          eq(budgetPeriods.budgetId, budgetId),
          eq(budgetPeriods.year, year),
          eq(budgetPeriods.month, month)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get all periods for a budget
   */
  static async getPeriodsByBudget(budgetId: string): Promise<BudgetPeriod[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(budgetPeriods)
      .where(eq(budgetPeriods.budgetId, budgetId))
      .orderBy(desc(budgetPeriods.year), desc(budgetPeriods.month));
  }

  /**
   * Check if any budgets need income notification for the current month
   */
  static async getBudgetsNeedingNotification(
    year: number,
    month: number
  ): Promise<BudgetPeriod[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(budgetPeriods)
      .innerJoin(budgets, eq(budgetPeriods.budgetId, budgets.id))
      .where(
        and(
          eq(budgetPeriods.year, year),
          eq(budgetPeriods.month, month),
          eq(budgetPeriods.isNotified, false),
          eq(budgets.isArchived, false)
        )
      )
      .then((results: any[]) => results.map((r: any) => r.budget_periods));
  }

  /**
   * Mark period as notified
   */
  static async markAsNotified(
    budgetId: string,
    year: number,
    month: number
  ): Promise<void> {
    const db = getDrizzleDb();
    await db
      .update(budgetPeriods)
      .set({
        isNotified: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(budgetPeriods.budgetId, budgetId),
          eq(budgetPeriods.year, year),
          eq(budgetPeriods.month, month)
        )
      );
  }

  /**
   * Delete all periods for a budget (when budget is deleted)
   */
  static async deleteByBudgetId(budgetId: string): Promise<void> {
    const db = getDrizzleDb();
    await db.delete(budgetPeriods).where(eq(budgetPeriods.budgetId, budgetId));
  }

  /**
   * Get current month's period for all active budgets
   */
  static async getCurrentMonthPeriods(
    year: number,
    month: number
  ): Promise<(BudgetPeriod & { budget: any })[]> {
    const db = getDrizzleDb();
    const result = await db
      .select()
      .from(budgetPeriods)
      .innerJoin(budgets, eq(budgetPeriods.budgetId, budgets.id))
      .where(
        and(
          eq(budgetPeriods.year, year),
          eq(budgetPeriods.month, month),
          eq(budgets.isArchived, false)
        )
      );

    return result.map((r: any) => ({
      ...r.budget_periods,
      budget: r.budgets,
    }));
  }
}
