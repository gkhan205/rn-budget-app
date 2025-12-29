import type { Account } from '@/db/schema/accounts';
import type { Budget } from '@/db/schema/budgets';
import type { Expense } from '@/db/schema/expenses';
import type { Income } from '@/db/schema/income';
import { AccountService } from '@/db/services/accountService';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { IncomeService } from '@/db/services/incomeService';
import { useCallback, useEffect, useState } from 'react';

export interface TransactionItem {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  account: string;
  budgetName: string;
  icon: string;
  iconColor: string;
  date: Date;
  notes?: string;
  budgetId: string;
  accountId: string | null;
}

export interface TransactionGroup {
  date: string;
  displayDate: string;
  transactions: TransactionItem[];
  totalAmount: number;
}

export interface FilterOptions {
  budgetId: string | null;
  accountId: string | null;
  category: string | null;
}

export interface TransactionsData {
  transactionGroups: TransactionGroup[];
  budgets: Budget[];
  accounts: Account[];
  categories: string[];
  totalExpense: number;
  totalIncome: number;
  isLoading: boolean;
  error: string | null;
}

const useTransactions = (initialFilters: FilterOptions = {
  budgetId: null,
  accountId: null,
  category: null,
}) => {
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  
  // Data state
  const [data, setData] = useState<TransactionsData>({
    transactionGroups: [],
    budgets: [],
    accounts: [],
    categories: [],
    totalExpense: 0,
    totalIncome: 0,
    isLoading: true,
    error: null,
  });

  // Helper function to get transaction icon based on category
  const getTransactionIcon = useCallback((category: string): { icon: string; iconColor: string } => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('groceries')) {
      return { icon: 'cart.fill', iconColor: '#FF8A4A' };
    } else if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('fuel')) {
      return { icon: 'car.fill', iconColor: '#E74C3C' };
    } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie') || categoryLower.includes('fun')) {
      return { icon: 'gamecontroller.fill', iconColor: '#9B59B6' };
    } else if (categoryLower.includes('subscription') || categoryLower.includes('netflix') || categoryLower.includes('spotify')) {
      return { icon: 'play.rectangle.fill', iconColor: '#E50914' };
    } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('pharmacy')) {
      return { icon: 'cross.fill', iconColor: '#FF6B6B' };
    } else {
      return { icon: 'creditcard.fill', iconColor: '#4A9EFF' };
    }
  }, []);

  // Helper function to group transactions by date
  const groupTransactionsByDate = useCallback((transactions: (Expense | Income)[], budgetsMap: Map<string, Budget>, accountsMap: Map<string, Account>): TransactionGroup[] => {
    const groups: Record<string, TransactionGroup> = {};
    
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dateKey = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Format display date
      let displayDate: string;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      if (dateKey === today.toISOString().split('T')[0]) {
        displayDate = 'Today';
      } else if (dateKey === yesterday.toISOString().split('T')[0]) {
        displayDate = 'Yesterday';
      } else {
        displayDate = transactionDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: transactionDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
        });
      }

      const budget = budgetsMap.get(transaction.budgetId);
      const account = accountsMap.get(transaction.accountId || '');
      
      // Check if this is an income or expense transaction
      const isIncome = 'source' in transaction;
      const category = isIncome ? (transaction as Income).source || 'Income' : (transaction as Expense).category || 'Other';
      const { icon, iconColor } = getTransactionIcon(category);

      const transactionItem: TransactionItem = {
        id: transaction.id,
        name: transaction.description,
        amount: transaction.amount,
        type: isIncome ? 'income' : 'expense',
        category,
        account: account?.name || 'Cash',
        budgetName: budget?.name || 'Unknown Budget',
        icon,
        iconColor,
        date: transactionDate,
        notes: transaction.notes || undefined,
        budgetId: transaction.budgetId,
        accountId: transaction.accountId,
      };

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          displayDate,
          transactions: [],
          totalAmount: 0,
        };
      }

      groups[dateKey].transactions.push(transactionItem);
      groups[dateKey].totalAmount += transaction.amount;
    });

    // Convert to array and sort by date descending
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [getTransactionIcon]);

  // Get filtered expenses based on current filters
  const getFilteredExpenses = useCallback(async (budgetsMap: Map<string, Budget>, accountsMap: Map<string, Account>): Promise<Expense[]> => {
    try {
      let expenses: Expense[] = [];

      // Apply filters based on what's selected
      if (filters.budgetId && filters.accountId && filters.category) {
        // All three filters applied - get all and filter in memory
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.budgetId === filters.budgetId &&
          expense.accountId === filters.accountId &&
          expense.category === filters.category
        );
      } else if (filters.budgetId && filters.accountId) {
        // Budget and account filters
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.budgetId === filters.budgetId &&
          expense.accountId === filters.accountId
        );
      } else if (filters.budgetId && filters.category) {
        // Budget and category filters
        const budgetExpenses = await ExpenseService.getByBudgetId(filters.budgetId);
        expenses = budgetExpenses.filter(expense => expense.category === filters.category);
      } else if (filters.accountId && filters.category) {
        // Account and category filters
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.accountId === filters.accountId &&
          expense.category === filters.category
        );
      } else if (filters.budgetId) {
        // Only budget filter
        expenses = await ExpenseService.getByBudgetId(filters.budgetId);
      } else if (filters.category) {
        // Only category filter
        expenses = await ExpenseService.getByCategory(filters.category);
      } else if (filters.accountId) {
        // Only account filter - get all and filter by account
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => expense.accountId === filters.accountId);
      } else {
        // No filters - get all expenses
        expenses = await ExpenseService.getAll();
      }

      return expenses;
    } catch (error) {
      console.error('Error filtering expenses:', error);
      return [];
    }
  }, [filters]);

  // Get filtered income based on current filters  
  const getFilteredIncome = useCallback(async (budgetsMap: Map<string, Budget>, accountsMap: Map<string, Account>): Promise<Income[]> => {
    try {
      let incomeRecords: Income[] = [];

      // Apply filters based on what's selected
      if (filters.budgetId && filters.accountId) {
        // Budget and account filters
        const allIncome = await IncomeService.getAll();
        incomeRecords = allIncome.filter(income => 
          income.budgetId === filters.budgetId &&
          income.accountId === filters.accountId
        );
      } else if (filters.budgetId) {
        // Only budget filter
        incomeRecords = await IncomeService.getByBudgetId(filters.budgetId);
      } else if (filters.accountId) {
        // Only account filter - get all and filter by account
        const allIncome = await IncomeService.getAll();
        incomeRecords = allIncome.filter(income => income.accountId === filters.accountId);
      } else {
        // No filters - get all income
        incomeRecords = await IncomeService.getAll();
      }

      return incomeRecords;
    } catch (error) {
      console.error('Error filtering income:', error);
      return [];
    }
  }, [filters]);

  // Load transactions and filter data
  const loadTransactions = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Load budgets and accounts for mapping
      const [budgetsData, accountsData] = await Promise.all([
        BudgetService.getAll(),
        AccountService.getAll(),
      ]);

      // Create maps for quick lookup
      const budgetsMap = new Map(budgetsData.map(budget => [budget.id, budget]));
      const accountsMap = new Map(accountsData.map(account => [account.id, account]));

      // Get filtered expenses and income
      const [expenses, incomeRecords] = await Promise.all([
        getFilteredExpenses(budgetsMap, accountsMap),
        getFilteredIncome(budgetsMap, accountsMap),
      ]);

      // Combine and group transactions by date
      const allTransactions = [...expenses, ...incomeRecords];
      const groupedTransactions = groupTransactionsByDate(allTransactions, budgetsMap, accountsMap);

      // Calculate totals
      const totalExpense = expenses.reduce((sum: number, expense: Expense) => sum + Math.abs(expense.amount), 0);
      const totalIncome = incomeRecords.reduce((sum: number, income: Income) => sum + income.amount, 0);

      // Extract unique categories from all expenses (not just filtered)
      const allExpenses = await ExpenseService.getAll();
      const uniqueCategories = Array.from(new Set(allExpenses.map(e => e.category).filter((cat): cat is string => Boolean(cat))));

      setData({
        transactionGroups: groupedTransactions,
        budgets: budgetsData,
        accounts: accountsData,
        categories: uniqueCategories,
        totalExpense,
        totalIncome,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Failed to load transactions:', err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load transactions. Please try again.',
      }));
    }
  }, [getFilteredExpenses, getFilteredIncome, groupTransactionsByDate]);

  // Update filters
  const updateFilter = useCallback((key: keyof FilterOptions, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      budgetId: null,
      accountId: null,
      category: null,
    });
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    data,
    filters,
    updateFilter,
    clearFilters,
    refresh: loadTransactions,
  };
};

export default useTransactions;
