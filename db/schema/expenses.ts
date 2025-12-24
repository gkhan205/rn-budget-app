import { createId } from '@paralleldrive/cuid2';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from './accounts';
import { budgets } from './budgets';
import { categories } from './categories';

/**
 * Expenses table - represents individual transactions/expenses
 */
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  budgetId: text('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  accountId: text('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  category: text('category'), // Legacy field for backward compatibility
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  recurringExpenseId: text('recurring_expense_id'), // Reference to recurring expense if applicable
  tags: text('tags'), // JSON string array of tags
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  // Indexes for performance
  budgetIdIdx: index('expenses_budget_id_idx').on(table.budgetId),
  dateIdx: index('expenses_date_idx').on(table.date),
  accountIdIdx: index('expenses_account_id_idx').on(table.accountId),
  categoryIdIdx: index('expenses_category_id_idx').on(table.categoryId),
}));

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
