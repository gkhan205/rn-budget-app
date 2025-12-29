import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { income, type Income, type NewIncome } from '../schema/income';

export class IncomeService {
  /**
   * Create a new income record
   */
  static async create(incomeRecord: NewIncome): Promise<Income> {
    const db = getDrizzleDb();
    const [newIncome] = await db.insert(income).values({
      ...incomeRecord,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newIncome;
  }

  /**
   * Get all income records
   */
  static async getAll(): Promise<Income[]> {
    const db = getDrizzleDb();
    return await db.select().from(income).orderBy(desc(income.date));
  }

  /**
   * Get income records by budget ID
   */
  static async getByBudgetId(budgetId: string): Promise<Income[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(income)
      .where(eq(income.budgetId, budgetId))
      .orderBy(desc(income.date));
  }

  /**
   * Get income record by ID
   */
  static async getById(id: string): Promise<Income | null> {
    const db = getDrizzleDb();
    const [incomeRecord] = await db.select()
      .from(income)
      .where(eq(income.id, id))
      .limit(1);
    return incomeRecord || null;
  }

  /**
   * Update an income record
   */
  static async update(id: string, updates: Partial<NewIncome>): Promise<Income | null> {
    const db = getDrizzleDb();
    const [updatedIncome] = await db.update(income)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(income.id, id))
      .returning();
    return updatedIncome || null;
  }

  /**
   * Delete an income record
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db.delete(income)
      .where(eq(income.id, id));
    return result.changes > 0;
  }

  /**
   * Get income records by date range
   */
  static async getByDateRange(startDate: Date, endDate: Date): Promise<Income[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(income)
      .where(
        and(
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      )
      .orderBy(desc(income.date));
  }

  /**
   * Get income records by budget ID and date range
   */
  static async getByBudgetIdAndDateRange(
    budgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Income[]> {
    const db = getDrizzleDb();
    return await db.select()
      .from(income)
      .where(
        and(
          eq(income.budgetId, budgetId),
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      )
      .orderBy(desc(income.date));
  }

  /**
   * Get total income for a budget
   */
  static async getTotalByBudgetId(budgetId: string): Promise<number> {
    const records = await this.getByBudgetId(budgetId);
    return records.reduce((total, record) => total + record.amount, 0);
  }

  /**
   * Get total income for a budget within a date range
   */
  static async getTotalByBudgetIdAndDateRange(
    budgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const records = await this.getByBudgetIdAndDateRange(budgetId, startDate, endDate);
    return records.reduce((total, record) => total + record.amount, 0);
  }
}
