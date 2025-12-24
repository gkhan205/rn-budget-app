import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { budgets, type Budget, type NewBudget } from '../schema/budgets';

export type PeriodType = 'monthly' | 'weekly' | 'custom' | 'noEndDate';

export class BudgetService {
  /**
   * Create a new budget
   */
  static async create(budget: NewBudget): Promise<Budget> {
    const db = getDrizzleDb();
    const [newBudget] = await db.insert(budgets).values({
      ...budget,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newBudget;
  }

  /**
   * Get all budgets
   */
  static async getAll(): Promise<Budget[]> {
    const db = getDrizzleDb();
    return await db.select().from(budgets).orderBy(desc(budgets.createdAt));
  }

  /**
   * Get active (non-archived) budgets
   */
  static async getActive(): Promise<Budget[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(budgets)
      .where(eq(budgets.isArchived, false))
      .orderBy(desc(budgets.createdAt));
  }

  /**
   * Get budget by ID
   */
  static async getById(id: string): Promise<Budget | null> {
    const db = getDrizzleDb();
    const [budget] = await db.select()
      .from(budgets)
      .where(eq(budgets.id, id))
      .limit(1);
    return budget || null;
  }

  /**
   * Update a budget
   */
  static async update(id: string, updates: Partial<NewBudget>): Promise<Budget | null> {
    const db = getDrizzleDb();
    const [updatedBudget] = await db.update(budgets)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, id))
      .returning();
    return updatedBudget || null;
  }

  /**
   * Delete a budget (soft delete by archiving)
   */
  static async archive(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const [archivedBudget] = await db.update(budgets)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, id))
      .returning();
    return !!archivedBudget;
  }

  /**
   * Permanently delete a budget
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db.delete(budgets)
      .where(eq(budgets.id, id));
    return result.changes > 0;
  }

  /**
   * Get budgets by date range
   */
  static async getByDateRange(startDate: Date, endDate: Date): Promise<Budget[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(budgets)
      .where(
        and(
          gte(budgets.startDate, startDate),
          lte(budgets.startDate, endDate),
          eq(budgets.isArchived, false)
        )
      )
      .orderBy(desc(budgets.createdAt));
  }

  /**
   * Helper function to determine if the budget is currently active
   */
  static isActive(budget: Budget): boolean {
    if (budget.isArchived) {
      return false;
    }

    const now = new Date();
    const startDate = new Date(budget.startDate);
    
    // Check if current date is after or equal to start date
    if (now < startDate) {
      return false;
    }

    // For budgets with no end date, they're active if not archived and started
    if (budget.periodType === 'noEndDate' || !budget.endDate) {
      return true;
    }

    // Check if current date is before or equal to end date
    const endDate = new Date(budget.endDate);
    return now <= endDate;
  }

  /**
   * Get current active budget period for a budget
   */
  static getCurrentPeriod(budget: Budget): { start: Date; end: Date | null } {
    const now = new Date();
    const startDate = new Date(budget.startDate);

    switch (budget.periodType) {
      case 'weekly': {
        const weekStart = new Date(startDate);
        const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeksComplete = Math.floor(daysSinceStart / 7);
        weekStart.setDate(startDate.getDate() + (weeksComplete * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return { start: weekStart, end: weekEnd };
      }
      
      case 'monthly': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), startDate.getDate());
        if (monthStart > now) {
          monthStart.setMonth(monthStart.getMonth() - 1);
        }
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(monthStart.getDate() - 1);
        
        return { start: monthStart, end: monthEnd };
      }
      
      case 'custom':
        return { 
          start: startDate, 
          end: budget.endDate ? new Date(budget.endDate) : null 
        };
        
      case 'noEndDate':
        return { start: startDate, end: null };
        
      default:
        return { start: startDate, end: null };
    }
  }
}
