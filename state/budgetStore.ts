import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Budget, PeriodType } from '../db/models/Budget';

// Interface for the Budget data (without Realm object methods)
export interface BudgetData {
  id: string;
  name: string;
  icon: string;
  color: string;
  limitAmount: number | null;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for creating a new budget
export interface CreateBudgetData {
  name: string;
  icon: string;
  color: string;
  limitAmount: number | null;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date | null;
}

// Interface for updating an existing budget
export interface UpdateBudgetData {
  name?: string;
  icon?: string;
  color?: string;
  limitAmount?: number | null;
  periodType?: PeriodType;
  startDate?: Date;
  endDate?: Date | null;
}

// Store state interface
interface BudgetState {
  budgets: BudgetData[];
  activeBudgetId: string | null;
}

// Store actions interface
interface BudgetActions {
  addBudget: (budgetData: CreateBudgetData) => void;
  updateBudget: (id: string, updates: UpdateBudgetData) => void;
  archiveBudget: (id: string) => void;
  setActiveBudget: (id: string | null) => void;
  setBudgets: (budgets: BudgetData[]) => void;
  getBudgetById: (id: string) => BudgetData | undefined;
  getActiveBudget: () => BudgetData | undefined;
  getActiveBudgets: () => BudgetData[];
  getArchivedBudgets: () => BudgetData[];
}

// Combined store interface
export interface BudgetStore extends BudgetState, BudgetActions {}

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

// Helper function to convert Budget Realm object to BudgetData
export const budgetToData = (budget: Budget): BudgetData => ({
  id: budget.id,
  name: budget.name,
  icon: budget.icon,
  color: budget.color,
  limitAmount: budget.income, // Map income to limitAmount for compatibility
  periodType: budget.periodType,
  startDate: budget.startDate,
  endDate: budget.endDate,
  isArchived: budget.isArchived,
  createdAt: budget.createdAt,
  updatedAt: budget.updatedAt,
});

// Create the Zustand store with immer for immutable updates
export const useBudgetStore = create<BudgetStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      budgets: [],
      activeBudgetId: null,

      // Actions
      addBudget: (budgetData: CreateBudgetData) => {
        set((state) => {
          const now = new Date();
          const newBudget: BudgetData = {
            ...budgetData,
            id: generateId(),
            isArchived: false,
            createdAt: now,
            updatedAt: now,
          };
          state.budgets.push(newBudget);
          
          // If no active budget is set, make this the active one
          if (!state.activeBudgetId) {
            state.activeBudgetId = newBudget.id;
          }
        });
      },

      updateBudget: (id: string, updates: UpdateBudgetData) => {
        set((state) => {
          const budgetIndex = state.budgets.findIndex((budget: BudgetData) => budget.id === id);
          if (budgetIndex !== -1) {
            const existingBudget = state.budgets[budgetIndex];
            state.budgets[budgetIndex] = {
              ...existingBudget,
              ...updates,
              updatedAt: new Date(),
            };
          }
        });
      },

      archiveBudget: (id: string) => {
        set((state) => {
          const budgetIndex = state.budgets.findIndex((budget: BudgetData) => budget.id === id);
          if (budgetIndex !== -1) {
            state.budgets[budgetIndex].isArchived = true;
            state.budgets[budgetIndex].updatedAt = new Date();
            
            // If this was the active budget, clear the active budget ID
            if (state.activeBudgetId === id) {
              state.activeBudgetId = null;
            }
          }
        });
      },

      setActiveBudget: (id: string | null) => {
        set((state) => {
          // Validate that the budget exists and is not archived
          if (id !== null) {
            const budget = state.budgets.find((b: BudgetData) => b.id === id);
            if (!budget || budget.isArchived) {
              return; // Don't set active if budget doesn't exist or is archived
            }
          }
          state.activeBudgetId = id;
        });
      },

      setBudgets: (budgets: BudgetData[]) => {
        set((state) => {
          state.budgets = budgets;
          
          // If active budget doesn't exist in the new budgets or is archived, clear it
          if (state.activeBudgetId) {
            const activeBudget = budgets.find(b => b.id === state.activeBudgetId);
            if (!activeBudget || activeBudget.isArchived) {
              state.activeBudgetId = null;
            }
          }
        });
      },

      // Selector functions
      getBudgetById: (id: string) => {
        return get().budgets.find(budget => budget.id === id);
      },

      getActiveBudget: () => {
        const { budgets, activeBudgetId } = get();
        if (!activeBudgetId) return undefined;
        return budgets.find(budget => budget.id === activeBudgetId);
      },

      getActiveBudgets: () => {
        return get().budgets.filter(budget => !budget.isArchived);
      },

      getArchivedBudgets: () => {
        return get().budgets.filter(budget => budget.isArchived);
      },
    }))
  )
);

// Convenience hooks for common selections
export const useActiveBudget = () => {
  return useBudgetStore(state => state.getActiveBudget());
};

export const useActiveBudgets = () => {
  return useBudgetStore(state => state.getActiveBudgets());
};

export const useArchivedBudgets = () => {
  return useBudgetStore(state => state.getArchivedBudgets());
};

export const useBudgetById = (id: string) => {
  return useBudgetStore(state => state.getBudgetById(id));
};
