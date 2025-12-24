import { createId } from '@paralleldrive/cuid2';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Accounts table - represents user accounts (bank accounts, credit cards, cash, etc.)
 */
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  type: text('type', { 
    enum: ['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other'] 
  }).notNull(),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  icon: text('icon').notNull().default('💳'),
  color: text('color').notNull().default('#2196F3'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
