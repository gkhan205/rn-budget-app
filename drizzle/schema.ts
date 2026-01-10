import { sqliteTable, AnySQLiteColumn, text, integer, real, uniqueIndex, index, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const budgets = sqliteTable("budgets", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	icon: text().notNull(),
	color: text().notNull(),
	periodType: text("period_type").notNull(),
	startDate: integer("start_date").notNull(),
	endDate: integer("end_date"),
	isArchived: integer("is_archived").default(false).notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
	income: real().notNull(),
});

export const accounts = sqliteTable("accounts", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	balance: real().notNull(),
	currency: text().default("USD").notNull(),
	icon: text().default("💳").notNull(),
	color: text().default("#2196F3").notNull(),
	description: text(),
	isActive: integer("is_active").default(true).notNull(),
	isArchived: integer("is_archived").default(false).notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
});

export const appSettings = sqliteTable("app_settings", {
	id: text().primaryKey().notNull(),
	key: text().notNull(),
	value: text(),
	type: text().default("string").notNull(),
	description: text(),
	isSystem: integer("is_system").default(false).notNull(),
	category: text().default("general").notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
},
(table) => [
	uniqueIndex("app_settings_key_unique").on(table.key),
]);

export const categories = sqliteTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	icon: text().default("📂").notNull(),
	color: text().default("#9E9E9E").notNull(),
	type: text().default("expense").notNull(),
	parentId: text("parent_id"),
	description: text(),
	isDefault: integer("is_default").default(false).notNull(),
	isActive: integer("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
});

export const income = sqliteTable("income", {
	id: text().primaryKey().notNull(),
	budgetId: text("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" } ),
	accountId: text("account_id").references(() => accounts.id, { onDelete: "set null" } ),
	amount: real().notNull(),
	description: text().notNull(),
	date: integer().notNull(),
	source: text(),
	isRecurring: integer("is_recurring").default(false).notNull(),
	recurringIncomeId: text("recurring_income_id"),
	tags: text(),
	notes: text(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
},
(table) => [
	index("income_account_id_idx").on(table.accountId),
	index("income_date_idx").on(table.date),
	index("income_budget_id_idx").on(table.budgetId),
]);

export const recurringExpenses = sqliteTable("recurring_expenses", {
	id: text().primaryKey().notNull(),
	budgetId: text("budget_id").references(() => budgets.id, { onDelete: "cascade" } ),
	accountId: text("account_id").references(() => accounts.id, { onDelete: "set null" } ),
	categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" } ),
	name: text().notNull(),
	amount: real().notNull(),
	frequency: text().notNull(),
	startDate: integer("start_date").notNull(),
	nextDueDate: integer("next_due_date").notNull(),
	endDate: integer("end_date"),
	category: text(),
	description: text(),
	isActive: integer("is_active").default(true).notNull(),
	autoAdd: integer("auto_add").default(false).notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
},
(table) => [
	index("recurring_expenses_category_id_idx").on(table.categoryId),
	index("recurring_expenses_account_id_idx").on(table.accountId),
	index("recurring_expenses_next_due_date_idx").on(table.nextDueDate),
	index("recurring_expenses_budget_id_idx").on(table.budgetId),
]);

export const budgetPeriods = sqliteTable("budget_periods", {
	id: text().primaryKey().notNull(),
	budgetId: text("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" } ),
	year: integer().notNull(),
	month: integer().notNull(),
	limitAmount: real("limit_amount").notNull(),
	periodStart: integer("period_start").notNull(),
	periodEnd: integer("period_end").notNull(),
	isNotified: integer("is_notified").default(false).notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
});

export const expenses = sqliteTable("expenses", {
	id: text().primaryKey().notNull(),
	budgetId: text("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" } ),
	accountId: text("account_id").references(() => accounts.id, { onDelete: "set null" } ),
	categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" } ),
	amount: real().notNull(),
	description: text().notNull(),
	date: integer().notNull(),
	category: text(),
	isRecurring: integer("is_recurring").default(false).notNull(),
	recurringExpenseId: text("recurring_expense_id"),
	tags: text(),
	notes: text(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
},
(table) => [
	index("expenses_category_id_idx").on(table.categoryId),
	index("expenses_account_id_idx").on(table.accountId),
	index("expenses_date_idx").on(table.date),
	index("expenses_budget_id_idx").on(table.budgetId),
]);

