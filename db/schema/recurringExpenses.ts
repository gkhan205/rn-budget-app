import { createId } from '@paralleldrive/cuid2';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { accounts } from './accounts';
import { budgets } from './budgets';
import { categories } from './categories';

/**
 * Recurring expenses table - templates for automatic expense generation
 */
export const recurringExpenses = sqliteTable(
  'recurring_expenses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    budgetId: text('budget_id').references(() => budgets.id, {
      onDelete: 'cascade',
    }),
    accountId: text('account_id').references(() => accounts.id, {
      onDelete: 'set null',
    }),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    amount: real('amount').notNull(),
    frequency: text('frequency', {
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    }).notNull(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(), // When recurring should start
    nextDueDate: integer('next_due_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }), // Optional end date for recurring
    category: text('category'), // Legacy field for backward compatibility
    description: text('description'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    autoAdd: integer('auto_add', { mode: 'boolean' }).notNull().default(false), // Auto-generate expenses
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => ({
    // Indexes for performance
    budgetIdIdx: index('recurring_expenses_budget_id_idx').on(table.budgetId),
    nextDueDateIdx: index('recurring_expenses_next_due_date_idx').on(
      table.nextDueDate
    ),
    accountIdIdx: index('recurring_expenses_account_id_idx').on(
      table.accountId
    ),
    categoryIdIdx: index('recurring_expenses_category_id_idx').on(
      table.categoryId
    ),
  })
);

export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type NewRecurringExpense = typeof recurringExpenses.$inferInsert;
