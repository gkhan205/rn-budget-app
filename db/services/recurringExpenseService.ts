import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { getDrizzleDb } from '../config';
import { expenses, type Expense, type NewExpense } from '../schema/expenses';
import {
  recurringExpenses,
  type NewRecurringExpense,
  type RecurringExpense,
} from '../schema/recurringExpenses';

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export class RecurringExpenseService {
  /**
   * Create a new recurring expense
   */
  static async create(
    recurringExpense: NewRecurringExpense
  ): Promise<RecurringExpense> {
    const db = getDrizzleDb();
    const [newRecurringExpense] = await db
      .insert(recurringExpenses)
      .values({
        ...recurringExpense,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newRecurringExpense;
  }

  /**
   * Get all recurring expenses
   */
  static async getAll(): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(recurringExpenses)
      .orderBy(desc(recurringExpenses.createdAt));
  }

  /**
   * Get active recurring expenses
   */
  static async getActive(): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(recurringExpenses)
      .where(eq(recurringExpenses.isActive, true))
      .orderBy(desc(recurringExpenses.createdAt));
  }

  /**
   * Get unassigned active recurring expenses (not assigned to any budget)
   */
  static async getUnassigned(): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(recurringExpenses)
      .where(
        and(
          eq(recurringExpenses.isActive, true),
          isNull(recurringExpenses.budgetId)
        )
      )
      .orderBy(desc(recurringExpenses.createdAt));
  }

  /**
   * Get recurring expenses by budget ID
   */
  static async getByBudgetId(budgetId: string): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(recurringExpenses)
      .where(eq(recurringExpenses.budgetId, budgetId))
      .orderBy(desc(recurringExpenses.createdAt));
  }

  /**
   * Get recurring expense by ID
   */
  static async getById(id: string): Promise<RecurringExpense | null> {
    const db = getDrizzleDb();
    const [recurringExpense] = await db
      .select()
      .from(recurringExpenses)
      .where(eq(recurringExpenses.id, id))
      .limit(1);
    return recurringExpense || null;
  }

  /**
   * Update a recurring expense
   */
  static async update(
    id: string,
    updates: Partial<NewRecurringExpense>
  ): Promise<RecurringExpense | null> {
    const db = getDrizzleDb();
    const [updatedRecurringExpense] = await db
      .update(recurringExpenses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(recurringExpenses.id, id))
      .returning();
    return updatedRecurringExpense || null;
  }

  /**
   * Delete a recurring expense
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const result = await db
      .delete(recurringExpenses)
      .where(eq(recurringExpenses.id, id));
    return result.changes > 0;
  }

  /**
   * Deactivate a recurring expense
   */
  static async deactivate(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const [deactivatedRecurringExpense] = await db
      .update(recurringExpenses)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(recurringExpenses.id, id))
      .returning();
    return !!deactivatedRecurringExpense;
  }

  /**
   * Get due recurring expenses (next due date <= current date)
   */
  static async getDue(): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    const now = new Date();
    return await db
      .select()
      .from(recurringExpenses)
      .where(
        and(
          eq(recurringExpenses.isActive, true),
          lte(recurringExpenses.nextDueDate, now)
        )
      )
      .orderBy(recurringExpenses.nextDueDate);
  }

  /**
   * Update next due date for a recurring expense
   */
  static async updateNextDueDate(
    id: string,
    nextDueDate: Date
  ): Promise<boolean> {
    const db = getDrizzleDb();
    const [updatedRecurringExpense] = await db
      .update(recurringExpenses)
      .set({
        nextDueDate,
        updatedAt: new Date(),
      })
      .where(eq(recurringExpenses.id, id))
      .returning();
    return !!updatedRecurringExpense;
  }

  /**
   * Calculate next due date based on frequency
   */
  static calculateNextDueDate(
    currentDate: Date,
    frequency: FrequencyType
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  /**
   * Process due recurring expenses and update their next due dates
   */
  static async processDueExpenses(): Promise<RecurringExpense[]> {
    const dueExpenses = await this.getDue();
    const processedExpenses: RecurringExpense[] = [];

    for (const expense of dueExpenses) {
      // Check if expense has ended
      if (expense.endDate && new Date() > new Date(expense.endDate)) {
        await this.deactivate(expense.id);
        continue;
      }

      const nextDueDate = this.calculateNextDueDate(
        new Date(expense.nextDueDate),
        expense.frequency
      );

      await this.updateNextDueDate(expense.id, nextDueDate);
      processedExpenses.push(expense);
    }

    return processedExpenses;
  }

  /**
   * Get upcoming recurring expenses (within next N days)
   */
  static async getUpcoming(days: number = 7): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return await db
      .select()
      .from(recurringExpenses)
      .where(
        and(
          eq(recurringExpenses.isActive, true),
          gte(recurringExpenses.nextDueDate, now),
          lte(recurringExpenses.nextDueDate, futureDate)
        )
      )
      .orderBy(recurringExpenses.nextDueDate);
  }

  /**
   * Get recurring expenses that are ready for auto-generation
   * Rules:
   * - Only active recurring expenses
   * - Only those with autoAdd = true
   * - Due date has passed or is current
   * - Start date has passed
   * - End date hasn't passed (if set)
   */
  static async getDueForAutoGeneration(): Promise<RecurringExpense[]> {
    const db = getDrizzleDb();
    const now = new Date();

    return await db
      .select()
      .from(recurringExpenses)
      .where(
        and(
          eq(recurringExpenses.isActive, true),
          eq(recurringExpenses.autoAdd, true),
          lte(recurringExpenses.nextDueDate, now),
          lte(recurringExpenses.startDate, now)
        )
      )
      .orderBy(recurringExpenses.nextDueDate);
  }

  /**
   * Check if an expense has already been generated for a specific recurring expense and cycle
   * This prevents duplicate generation within the same recurrence cycle
   */
  static async hasExpenseForCycle(
    recurringExpenseId: string,
    cycleDate: Date
  ): Promise<boolean> {
    const db = getDrizzleDb();

    // Calculate the cycle boundaries based on the cycle date
    const cycleStart = new Date(cycleDate);
    const cycleEnd = new Date(cycleDate);

    // For simplicity, we check if any expense exists for this recurring expense
    // within a reasonable time window around the cycle date (±24 hours)
    cycleStart.setHours(0, 0, 0, 0);
    cycleEnd.setHours(23, 59, 59, 999);

    const existingExpenses = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.recurringExpenseId, recurringExpenseId),
          gte(expenses.date, cycleStart),
          lte(expenses.date, cycleEnd)
        )
      )
      .limit(1);

    return existingExpenses.length > 0;
  }

  /**
   * Auto-generate expenses from due recurring expenses
   * Returns list of newly created expenses
   *
   * Rules:
   * - Only generate if auto_add = true
   * - Generate once per recurrence cycle
   * - Use recurring_id to avoid duplicates
   * - Respect start_date and end_date
   * - Insert generated expenses inside a transaction
   */
  static async autoGenerateExpenses(): Promise<Expense[]> {
    const db = getDrizzleDb();
    const generatedExpenses: Expense[] = [];

    // Get all recurring expenses due for auto-generation
    const dueRecurringExpenses = await this.getDueForAutoGeneration();

    if (dueRecurringExpenses.length === 0) {
      return generatedExpenses;
    }

    // Process each recurring expense in a transaction
    return await db.transaction(async (tx) => {
      const transactionExpenses: Expense[] = [];

      for (const recurringExpense of dueRecurringExpenses) {
        try {
          // Skip if no budget is assigned
          if (!recurringExpense.budgetId) {
            console.log(
              `Skipping auto-generation for "${recurringExpense.name}" - no budget assigned`
            );
            continue;
          }

          // Check if end date has passed
          if (
            recurringExpense.endDate &&
            new Date() > new Date(recurringExpense.endDate)
          ) {
            // Deactivate expired recurring expense
            await tx
              .update(recurringExpenses)
              .set({
                isActive: false,
                updatedAt: new Date(),
              })
              .where(eq(recurringExpenses.id, recurringExpense.id));
            continue;
          }

          // Check if expense already generated for this cycle
          const alreadyGenerated = await this.hasExpenseForCycle(
            recurringExpense.id,
            new Date(recurringExpense.nextDueDate)
          );

          if (alreadyGenerated) {
            // Just update the next due date without generating
            const nextDueDate = this.calculateNextDueDate(
              new Date(recurringExpense.nextDueDate),
              recurringExpense.frequency
            );

            await tx
              .update(recurringExpenses)
              .set({
                nextDueDate,
                updatedAt: new Date(),
              })
              .where(eq(recurringExpenses.id, recurringExpense.id));
            continue;
          }

          // Generate the expense
          const newExpenseData: NewExpense = {
            budgetId: recurringExpense.budgetId!, // We know it's not null due to the check above
            accountId: recurringExpense.accountId,
            categoryId: recurringExpense.categoryId,
            amount: recurringExpense.amount,
            description: `${recurringExpense.name} (Auto-generated)`,
            date: new Date(recurringExpense.nextDueDate),
            category: recurringExpense.category, // Legacy field
            isRecurring: true,
            recurringExpenseId: recurringExpense.id,
            notes: recurringExpense.description,
          };

          const [generatedExpense] = await tx
            .insert(expenses)
            .values({
              ...newExpenseData,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          transactionExpenses.push(generatedExpense);

          // Update next due date for the recurring expense
          const nextDueDate = this.calculateNextDueDate(
            new Date(recurringExpense.nextDueDate),
            recurringExpense.frequency
          );

          await tx
            .update(recurringExpenses)
            .set({
              nextDueDate,
              updatedAt: new Date(),
            })
            .where(eq(recurringExpenses.id, recurringExpense.id));
        } catch (error) {
          console.error(
            `Failed to generate expense for recurring expense ${recurringExpense.id}:`,
            error
          );
          // Continue with next recurring expense rather than failing the entire transaction
        }
      }

      return transactionExpenses;
    });
  }

  /**
   * Enable auto-generation for a recurring expense
   */
  static async enableAutoGeneration(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const [updated] = await db
      .update(recurringExpenses)
      .set({
        autoAdd: true,
        updatedAt: new Date(),
      })
      .where(eq(recurringExpenses.id, id))
      .returning();
    return !!updated;
  }

  /**
   * Disable auto-generation for a recurring expense
   */
  static async disableAutoGeneration(id: string): Promise<boolean> {
    const db = getDrizzleDb();
    const [updated] = await db
      .update(recurringExpenses)
      .set({
        autoAdd: false,
        updatedAt: new Date(),
      })
      .where(eq(recurringExpenses.id, id))
      .returning();
    return !!updated;
  }

  /**
   * Get all auto-generated expenses for a specific recurring expense
   */
  static async getGeneratedExpenses(
    recurringExpenseId: string
  ): Promise<Expense[]> {
    const db = getDrizzleDb();
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.recurringExpenseId, recurringExpenseId),
          eq(expenses.isRecurring, true)
        )
      )
      .orderBy(desc(expenses.date));
  }
}
