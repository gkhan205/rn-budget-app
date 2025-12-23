import { Budget } from '../db/models/Budget';
import { BudgetData, budgetToData, useBudgetStore } from './budgetStore';

/**
 * Utility functions for integrating the Zustand budget store with Realm database
 */

/**
 * Syncs budgets from Realm to Zustand store
 * @param budgets - Array of Budget objects from Realm
 */
export const syncBudgetsFromRealm = (budgets: Budget[]) => {
  const budgetData = budgets.map(budgetToData);
  useBudgetStore.getState().setBudgets(budgetData);
};

/**
 * Converts BudgetData to the format expected by Realm
 * @param budgetData - Budget data from Zustand store
 * @returns Object suitable for Realm creation/update
 */
export const budgetDataToRealm = (budgetData: BudgetData) => ({
  id: budgetData.id,
  name: budgetData.name,
  icon: budgetData.icon,
  color: budgetData.color,
  limitAmount: budgetData.limitAmount,
  periodType: budgetData.periodType,
  startDate: budgetData.startDate,
  endDate: budgetData.endDate,
  isArchived: budgetData.isArchived,
  createdAt: budgetData.createdAt,
  updatedAt: budgetData.updatedAt,
});

/**
 * Helper to get budget changes that need to be synced to Realm
 * This can be used with Zustand's subscribe function to listen for changes
 */
export const subscribeToBudgetChanges = (
  callback: (budgets: BudgetData[], activeBudgetId: string | null) => void
) => {
  return useBudgetStore.subscribe(
    (state) => ({ budgets: state.budgets, activeBudgetId: state.activeBudgetId }),
    (current, previous) => {
      // Only call callback if budgets or activeBudgetId actually changed
      if (
        current.budgets !== previous.budgets || 
        current.activeBudgetId !== previous.activeBudgetId
      ) {
        callback(current.budgets, current.activeBudgetId);
      }
    }
  );
};
