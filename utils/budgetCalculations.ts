import { Budget } from '../db/models/Budget';
import { Expense } from '../db/models/Expense';
import { RecurringExpense } from '../db/models/RecurringExpense';

/**
 * Utility functions for budget calculations
 */

export interface BudgetCalculationResult {
  totalSpent: number;
  totalPlanned: number;
  remainingAmount: number | null;
  progressPercentage: number | null;
}

/**
 * Calculates the total amount spent from a list of expenses
 * @param expenses - Array of expense objects
 * @returns Total amount spent
 */
export function getTotalSpent(expenses: Expense[]): number {
  if (!expenses || expenses.length === 0) {
    return 0;
  }

  return expenses.reduce((total, expense) => {
    return total + (expense.amount || 0);
  }, 0);
}

/**
 * Calculates the total planned amount from active recurring expenses
 * This includes all active recurring expenses regardless of whether they've been converted to actual expenses
 * @param recurringExpenses - Array of recurring expense objects
 * @returns Total planned amount from active recurring expenses
 */
export function getTotalPlanned(recurringExpenses: RecurringExpense[]): number {
  if (!recurringExpenses || recurringExpenses.length === 0) {
    return 0;
  }

  return recurringExpenses.reduce((total, recurringExpense) => {
    // Only include active recurring expenses
    if (!recurringExpense.isActive) {
      return total;
    }

    return total + (recurringExpense.amount || 0);
  }, 0);
}

/**
 * Calculates the remaining amount in the budget
 * @param budget - Budget object
 * @param totalSpent - Total amount already spent
 * @param totalPlanned - Total planned amount from recurring expenses
 * @returns Remaining amount (null if budget has no limit)
 */
export function getRemainingAmount(
  budget: Budget,
  totalSpent: number,
  totalPlanned: number
): number | null {
  // If budget has no limit, return null
  if (!budget.limitAmount || budget.limitAmount <= 0) {
    return null;
  }

  const totalAllocated = totalSpent + totalPlanned;
  return budget.limitAmount - totalAllocated;
}

/**
 * Calculates the progress percentage of budget usage
 * @param budget - Budget object
 * @param totalSpent - Total amount already spent
 * @param totalPlanned - Total planned amount from recurring expenses
 * @returns Progress percentage (null if budget has no limit)
 */
export function getProgressPercentage(
  budget: Budget,
  totalSpent: number,
  totalPlanned: number
): number | null {
  // If budget has no limit, return null
  if (!budget.limitAmount || budget.limitAmount <= 0) {
    return null;
  }

  const totalAllocated = totalSpent + totalPlanned;
  const percentage = (totalAllocated / budget.limitAmount) * 100;
  
  // Return percentage rounded to 2 decimal places
  return Math.round(percentage * 100) / 100;
}

/**
 * Comprehensive budget calculation function that returns all metrics
 * @param budget - Budget object
 * @param expenses - Array of expense objects
 * @param recurringExpenses - Array of recurring expense objects
 * @returns Object containing all budget calculation metrics
 */
export function calculateBudgetMetrics(
  budget: Budget,
  expenses: Expense[] = [],
  recurringExpenses: RecurringExpense[] = []
): BudgetCalculationResult {
  const totalSpent = getTotalSpent(expenses);
  const totalPlanned = getTotalPlanned(recurringExpenses);
  const remainingAmount = getRemainingAmount(budget, totalSpent, totalPlanned);
  const progressPercentage = getProgressPercentage(budget, totalSpent, totalPlanned);

  return {
    totalSpent,
    totalPlanned,
    remainingAmount,
    progressPercentage,
  };
}

/**
 * Helper function to check if a budget is over the limit
 * @param budget - Budget object
 * @param totalSpent - Total amount already spent
 * @param totalPlanned - Total planned amount from recurring expenses
 * @returns True if budget is over limit, false otherwise (always false for unlimited budgets)
 */
export function isBudgetOverLimit(
  budget: Budget,
  totalSpent: number,
  totalPlanned: number
): boolean {
  // If budget has no limit, it can't be over limit
  if (!budget.limitAmount || budget.limitAmount <= 0) {
    return false;
  }

  const totalAllocated = totalSpent + totalPlanned;
  return totalAllocated > budget.limitAmount;
}

/**
 * Helper function to check if a budget is at risk of going over limit
 * @param budget - Budget object
 * @param totalSpent - Total amount already spent
 * @param totalPlanned - Total planned amount from recurring expenses
 * @param warningThreshold - Percentage threshold for warning (default: 80%)
 * @returns True if budget usage is above the warning threshold
 */
export function isBudgetAtRisk(
  budget: Budget,
  totalSpent: number,
  totalPlanned: number,
  warningThreshold: number = 80
): boolean {
  const progressPercentage = getProgressPercentage(budget, totalSpent, totalPlanned);
  
  // If no limit or no progress percentage, not at risk
  if (progressPercentage === null) {
    return false;
  }

  return progressPercentage >= warningThreshold;
}

/**
 * Helper function to format currency amounts
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: '$')
 * @param showSign - Whether to show + or - sign (default: false)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = '$',
  showSign: boolean = false
): string {
  const absAmount = Math.abs(amount);
  const formattedAmount = absAmount.toFixed(2);
  
  if (showSign && amount !== 0) {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${currency}${formattedAmount}`;
  }
  
  return `${currency}${formattedAmount}`;
}
