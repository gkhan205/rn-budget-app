import { relations } from "drizzle-orm/relations";
import { accounts, income, budgets, categories, recurringExpenses, budgetPeriods, expenses } from "./schema";

export const incomeRelations = relations(income, ({one}) => ({
	account: one(accounts, {
		fields: [income.accountId],
		references: [accounts.id]
	}),
	budget: one(budgets, {
		fields: [income.budgetId],
		references: [budgets.id]
	}),
}));

export const accountsRelations = relations(accounts, ({many}) => ({
	incomes: many(income),
	recurringExpenses: many(recurringExpenses),
	expenses: many(expenses),
}));

export const budgetsRelations = relations(budgets, ({many}) => ({
	incomes: many(income),
	recurringExpenses: many(recurringExpenses),
	budgetPeriods: many(budgetPeriods),
	expenses: many(expenses),
}));

export const recurringExpensesRelations = relations(recurringExpenses, ({one}) => ({
	category: one(categories, {
		fields: [recurringExpenses.categoryId],
		references: [categories.id]
	}),
	account: one(accounts, {
		fields: [recurringExpenses.accountId],
		references: [accounts.id]
	}),
	budget: one(budgets, {
		fields: [recurringExpenses.budgetId],
		references: [budgets.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	recurringExpenses: many(recurringExpenses),
	expenses: many(expenses),
}));

export const budgetPeriodsRelations = relations(budgetPeriods, ({one}) => ({
	budget: one(budgets, {
		fields: [budgetPeriods.budgetId],
		references: [budgets.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	category: one(categories, {
		fields: [expenses.categoryId],
		references: [categories.id]
	}),
	account: one(accounts, {
		fields: [expenses.accountId],
		references: [accounts.id]
	}),
	budget: one(budgets, {
		fields: [expenses.budgetId],
		references: [budgets.id]
	}),
}));