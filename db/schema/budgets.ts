import { createId } from '@paralleldrive/cuid2';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Budgets table - represents spending budgets with limits and time periods
 */
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  income: real('income').notNull().default(0), // Monthly/period income for the budget
  periodType: text('period_type', { enum: ['monthly', 'weekly', 'custom', 'noEndDate'] }).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
