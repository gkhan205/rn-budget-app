import { Expense } from '../db/models/Expense';
import { ExpenseData, expenseToData, useExpenseStore } from './expenseStore';

/**
 * Utility functions for integrating the Zustand expense store with Realm database
 * Optimized for large datasets and offline-first usage
 */

/**
 * Syncs expenses from Realm to Zustand store
 * @param expenses - Array of Expense objects from Realm
 */
export const syncExpensesFromRealm = (expenses: Expense[]) => {
  const expenseData = expenses.map(expenseToData);
  useExpenseStore.getState().setExpenses(expenseData);
  useExpenseStore.getState().setInitialized(true);
  useExpenseStore.getState().updateLastSync();
};

/**
 * Converts ExpenseData to the format expected by Realm
 * @param expenseData - Expense data from Zustand store
 * @returns Object suitable for Realm creation/update
 */
export const expenseDataToRealm = (expenseData: ExpenseData) => ({
  id: expenseData.id,
  budgetId: expenseData.budgetId,
  amount: expenseData.amount,
  categoryId: expenseData.categoryId,
  accountId: expenseData.accountId,
  date: expenseData.date,
  note: expenseData.note,
  isGeneratedFromRecurring: expenseData.isGeneratedFromRecurring,
  recurringId: expenseData.recurringId,
});

/**
 * Helper to get expense changes that need to be synced to Realm
 * This can be used with Zustand's subscribe function to listen for changes
 */
export const subscribeToExpenseChanges = (
  callback: (expenses: ExpenseData[]) => void
) => {
  return useExpenseStore.subscribe(
    (state) => state.expenses,
    (current, previous) => {
      // Only call callback if expenses array actually changed
      if (current !== previous) {
        callback(current);
      }
    }
  );
};

/**
 * Batch sync function for better performance with large datasets
 * @param expenses - Large array of expenses from Realm
 * @param batchSize - Size of batches to process (default: 100)
 */
export const batchSyncExpensesFromRealm = async (
  expenses: Expense[], 
  batchSize: number = 100
) => {
  const store = useExpenseStore.getState();
  store.setLoading(true);
  
  try {
    // Clear existing data
    store.clearExpenses();
    
    // Process in batches to avoid blocking the UI
    for (let i = 0; i < expenses.length; i += batchSize) {
      const batch = expenses.slice(i, i + batchSize);
      const batchData = batch.map(expenseToData);
      
      // Use bulk add for better performance
      store.addExpensesBulk(batchData.map(expense => ({
        budgetId: expense.budgetId,
        amount: expense.amount,
        categoryId: expense.categoryId,
        accountId: expense.accountId,
        date: expense.date,
        note: expense.note,
        isGeneratedFromRecurring: expense.isGeneratedFromRecurring,
        recurringId: expense.recurringId,
      })));
      
      // Allow UI to update between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    store.setInitialized(true);
    store.updateLastSync();
  } finally {
    store.setLoading(false);
  }
};

/**
 * Optimized sync for incremental updates
 * Only syncs expenses that have changed since last sync
 * @param expenses - All expenses from Realm
 * @param lastSyncTimestamp - Timestamp of last successful sync
 */
export const incrementalSyncExpensesFromRealm = (
  expenses: Expense[],
  lastSyncTimestamp: number | null
) => {
  if (!lastSyncTimestamp) {
    // Full sync if no previous sync
    return syncExpensesFromRealm(expenses);
  }
  
  const store = useExpenseStore.getState();
  
  // Get current expense IDs for comparison
  const currentExpenseIds = new Set(store.expenses.map(e => e.id));
  const newOrUpdatedExpenses: ExpenseData[] = [];
  const allExpenseIds = new Set<string>();
  
  expenses.forEach(expense => {
    allExpenseIds.add(expense.id);
    
    // Check if expense is new or potentially updated
    // Note: You might want to add an updatedAt field to the Expense model for better tracking
    if (!currentExpenseIds.has(expense.id)) {
      newOrUpdatedExpenses.push(expenseToData(expense));
    }
  });
  
  // Find deleted expenses (in store but not in Realm)
  const deletedExpenseIds = Array.from(currentExpenseIds).filter(id => !allExpenseIds.has(id));
  
  // Apply changes
  if (newOrUpdatedExpenses.length > 0) {
    newOrUpdatedExpenses.forEach(expense => {
      if (currentExpenseIds.has(expense.id)) {
        // Update existing expense
        store.updateExpense(expense.id, {
          budgetId: expense.budgetId,
          amount: expense.amount,
          categoryId: expense.categoryId,
          accountId: expense.accountId,
          date: expense.date,
          note: expense.note,
          isGeneratedFromRecurring: expense.isGeneratedFromRecurring,
          recurringId: expense.recurringId,
        });
      } else {
        // Add new expense
        store.addExpense({
          budgetId: expense.budgetId,
          amount: expense.amount,
          categoryId: expense.categoryId,
          accountId: expense.accountId,
          date: expense.date,
          note: expense.note,
          isGeneratedFromRecurring: expense.isGeneratedFromRecurring,
          recurringId: expense.recurringId,
        });
      }
    });
  }
  
  // Delete removed expenses
  if (deletedExpenseIds.length > 0) {
    store.deleteExpensesBulk(deletedExpenseIds);
  }
  
  store.updateLastSync();
};

/**
 * Utility to get expenses that need to be uploaded to server/synced
 * Useful for offline-first apps where changes are made locally first
 * @returns Array of expenses that were modified locally
 */
export const getLocallyModifiedExpenses = (): ExpenseData[] => {
  const store = useExpenseStore.getState();
  const { expenses, lastSyncTimestamp } = store;
  
  if (!lastSyncTimestamp) {
    return expenses; // All expenses if never synced
  }
  
  // In a real implementation, you'd track which expenses were modified locally
  // For now, return all expenses (you might want to add a 'lastModified' field)
  return expenses;
};

/**
 * Clears all expense data and resets sync state
 * Useful for logout or data reset scenarios
 */
export const clearExpenseData = () => {
  const store = useExpenseStore.getState();
  store.clearExpenses();
  store.setInitialized(false);
  store.setLoading(false);
  useExpenseStore.setState({ lastSyncTimestamp: null });
};

/**
 * Performance optimization: Pre-warm the store with commonly accessed data
 * @param budgetIds - Array of budget IDs to pre-load expenses for
 */
export const preloadExpensesForBudgets = (budgetIds: string[]) => {
  const store = useExpenseStore.getState();
  
  // This will trigger index building for these specific budgets
  budgetIds.forEach(budgetId => {
    store.getExpensesByBudget(budgetId);
  });
};
