import type { Budget } from '@/db/schema/budgets';
import type { Expense } from '@/db/schema/expenses';
import type { RecurringExpense } from '@/db/schema/recurringExpenses';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { calculateBudgetMetrics } from '@/utils/budgetCalculations';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

export interface CategorySpend {
  name: string;
  percentage: number;
  color: string;
  amount: number;
}

export interface BudgetDetailData {
  budget: Budget;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  totalSpent: number;
  totalPlanned: number;
  remaining: number | null;
  percentage: number | null;
  todaysSpend: number;
  weekSpend: number;
  categorySpending: CategorySpend[];
  periodData: {
    start: Date;
    end?: Date;
    daysRemaining: number;
  };
}

export const useBudgetDetail = (budgetId: string) => {
  const [budgetDetail, setBudgetDetail] = useState<BudgetDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to map expenses for UI display
  const mapExpenseForCalculation = (expense: Expense) => ({
    id: expense.id,
    budgetId: expense.budgetId,
    amount: expense.amount,
    categoryId: expense.categoryId || 'default',
    accountId: expense.accountId || 'default',
    date: expense.date,
    note: expense.notes,
    isGeneratedFromRecurring: expense.isRecurring || false,
    recurringId: expense.recurringExpenseId,
  });

  // Helper function to map recurring expenses for UI display
  const mapRecurringExpenseForCalculation = (recurringExpense: RecurringExpense) => ({
    id: recurringExpense.id,
    budgetId: recurringExpense.budgetId,
    name: recurringExpense.name,
    amount: recurringExpense.amount,
    frequency: recurringExpense.frequency === 'daily' ? 'custom' as const : recurringExpense.frequency,
    dueDay: null,
    startDate: recurringExpense.startDate,
    endDate: recurringExpense.endDate,
    accountId: recurringExpense.accountId || 'default',
    autoAdd: recurringExpense.autoAdd || false,
    isActive: recurringExpense.isActive,
  });

  // Calculate category spending from expenses
  const calculateCategorySpending = (expenses: Expense[], totalSpent: number): CategorySpend[] => {
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(expense => {
      const categoryName = expense.category || 'General';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + expense.amount);
    });

    const categories: CategorySpend[] = [];
    const colors = ['#4A9EFF', '#2ECC71', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C'];
    let colorIndex = 0;

    categoryMap.forEach((amount, name) => {
      const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
      categories.push({
        name,
        percentage,
        amount,
        color: colors[colorIndex % colors.length],
      });
      colorIndex++;
    });

    return categories.sort((a, b) => b.amount - a.amount);
  };

  // Calculate days remaining in the budget period
  const calculateDaysRemaining = (budget: Budget): number => {
    const now = new Date();
    const period = BudgetService.getCurrentPeriod(budget);
    
    if (!period.end) {
      return 0; // No end date
    }

    const diffTime = period.end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Load budget detail data
  const loadBudgetDetail = useCallback(async () => {
    if (!budgetId) {
      setError('Budget ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load budget data
      const budget = await BudgetService.getById(budgetId);
      if (!budget) {
        setError('Budget not found');
        return;
      }

      // Get current budget period
      const period = BudgetService.getCurrentPeriod(budget);

      // Load expenses and recurring expenses
      const [expenses, recurringExpenses] = await Promise.all([
        period.end 
          ? ExpenseService.getByBudgetAndDateRange(budget.id, period.start, period.end)
          : ExpenseService.getByBudgetId(budget.id),
        RecurringExpenseService.getByBudgetId(budget.id)
      ]);

      // Calculate metrics
      const budgetForCalculation = {
        ...budget,
        createdAt: budget.createdAt || new Date(),
        updatedAt: budget.updatedAt || new Date(),
      } as any;

      const mappedExpenses = expenses.map(mapExpenseForCalculation);
      const mappedRecurringExpenses = recurringExpenses.map(mapRecurringExpenseForCalculation);

      const metrics = calculateBudgetMetrics(budgetForCalculation, mappedExpenses, mappedRecurringExpenses);

      // Calculate today's and this week's spending
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

      const todaysSpend = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= today && expenseDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      const weekSpend = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= now;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate category spending
      const categorySpending = calculateCategorySpending(expenses, metrics.totalSpent);

      // Calculate days remaining
      const daysRemaining = calculateDaysRemaining(budget);

      setBudgetDetail({
        budget,
        expenses,
        recurringExpenses,
        totalSpent: metrics.totalSpent,
        totalPlanned: metrics.totalPlanned,
        remaining: metrics.remainingAmount,
        percentage: metrics.progressPercentage,
        todaysSpend,
        weekSpend,
        categorySpending,
        periodData: {
          start: period.start,
          end: period.end || undefined,
          daysRemaining,
        },
      });

    } catch (err) {
      console.error('Failed to load budget detail:', err);
      setError('Failed to load budget details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [budgetId]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadBudgetDetail();
    }, [loadBudgetDetail])
  );

  return {
    budgetDetail,
    isLoading,
    error,
    refetch: loadBudgetDetail,
  };
};
