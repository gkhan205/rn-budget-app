import { createId } from '@paralleldrive/cuid2';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from './accounts';
import { budgets } from './budgets';

/**
 * Income table - represents individual income transactions
 */
export const income = sqliteTable('income', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  budgetId: text('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  accountId: text('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  amount: real('amount').notNull(), // Always positive for income
  description: text('description').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  source: text('source'), // Source of income (salary, freelance, etc.)
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  recurringIncomeId: text('recurring_income_id'), // Reference to recurring income if applicable
  tags: text('tags'), // JSON string array of tags
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  // Indexes for performance
  budgetIdIdx: index('income_budget_id_idx').on(table.budgetId),
  dateIdx: index('income_date_idx').on(table.date),
  accountIdIdx: index('income_account_id_idx').on(table.accountId),
}));

export type Income = typeof income.$inferSelect;
export type NewIncome = typeof income.$inferInsert;
