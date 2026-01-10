import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { expenses, type Expense, type NewExpense } from '../schema/expenses';

export class ExpenseService {
  /**
   * Create a new expense
   */
  static async create(expense: NewExpense): Promise<Expense> {
    const db = getDrizzleDb();
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...expense,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newExpense;
  }

  /**
   * Get all expenses
   */
  static async getAll(): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  /**
   * Get expenses by budget ID
   */
  static async getByBudgetId(budgetId: string): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.budgetId, budgetId))
      .orderBy(desc(expenses.date));
  }

  /**
   * Get expense by ID
   */
  static async getById(id: string): Promise<Expense | null> {
    const db = getDrizzleDb();
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    return expense || null;
  }

  /**
   * Get expenses by account ID
   */
  static async getByAccount(accountId: string): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.accountId, accountId))
      .orderBy(desc(expenses.date));
  }

  /**
   * Update an expense
   */
  static async update(
    id: string,
    updates: Partial<NewExpense>
  ): Promise<Expense | null> {
    const db = getDrizzleDb();
    const [updatedExpense] = await db
      .update(expenses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense || null;
  }

  /**
   * Delete an expense
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.changes > 0;
  }

  /**
   * Get expenses by date range
   */
  static async getByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(expenses)
      .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
      .orderBy(desc(expenses.date));
  }

  /**
   * Get expenses by budget ID and date range
   */
  static async getByBudgetAndDateRange(
    budgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.budgetId, budgetId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .orderBy(desc(expenses.date));
  }

  /**
   * Get total amount spent for a budget
   */
  static async getTotalByBudgetId(budgetId: string): Promise<number> {
    const budgetExpenses = await this.getByBudgetId(budgetId);
    return budgetExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * Get total amount spent for a budget in date range
   */
  static async getTotalByBudgetAndDateRange(
    budgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const budgetExpenses = await this.getByBudgetAndDateRange(
      budgetId,
      startDate,
      endDate
    );
    return budgetExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * Get expenses by category
   */
  static async getByCategory(category: string): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.category, category))
      .orderBy(desc(expenses.date));
  }

  /**
   * Get recent expenses (last N days)
   */
  static async getRecent(days: number = 7): Promise<Expense[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return await this.getByDateRange(startDate, endDate);
  }

  /**
   * Search expenses by description
   */
  static async search(query: string): Promise<Expense[]> {
    const db = getDrizzleDb();
    // Note: This is a simple implementation. For better search, consider using FTS
    const allExpenses = await db.select().from(expenses);
    return allExpenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(query.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get expenses grouped by month
   */
  static async getExpensesByMonth(
    year?: number
  ): Promise<Record<string, Expense[]>> {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const yearExpenses = await this.getByDateRange(startDate, endDate);

    const groupedByMonth: Record<string, Expense[]> = {};

    yearExpenses.forEach((expense) => {
      const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(expense);
    });

    return groupedByMonth;
  }
}
