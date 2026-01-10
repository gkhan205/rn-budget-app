import { createId } from '@paralleldrive/cuid2';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { budgets } from './budgets';

/**
 * Budget Periods table - stores monthly/period-specific data for budgets
 * This allows tracking different limit amounts for each month/period
 */
export const budgetPeriods = sqliteTable('budget_periods', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  budgetId: text('budget_id')
    .notNull()
    .references(() => budgets.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(), // Year for this period
  month: integer('month').notNull(), // Month (1-12) for this period
  limitAmount: real('limit_amount').notNull().default(0), // Income/limit for this specific period
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(), // Start date of the period
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(), // End date of the period
  isNotified: integer('is_notified', { mode: 'boolean' })
    .notNull()
    .default(false), // Whether user was notified to set income
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

export type BudgetPeriod = typeof budgetPeriods.$inferSelect;
export type NewBudgetPeriod = typeof budgetPeriods.$inferInsert;
