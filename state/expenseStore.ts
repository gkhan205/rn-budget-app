import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Expense } from '../db/models/Expense';

// Interface for the Expense data (without Realm object methods)
export interface ExpenseData {
  id: string;
  budgetId: string;
  amount: number;
  categoryId: string;
  accountId: string | null;
  date: Date;
  note: string | null;
  isGeneratedFromRecurring: boolean;
  recurringId: string | null;
}

// Interface for creating a new expense
export interface CreateExpenseData {
  budgetId: string;
  amount: number;
  categoryId: string;
  accountId?: string | null;
  date: Date;
  note?: string | null;
  isGeneratedFromRecurring?: boolean;
  recurringId?: string | null;
}

// Interface for updating an existing expense
export interface UpdateExpenseData {
  budgetId?: string;
  amount?: number;
  categoryId?: string;
  accountId?: string | null;
  date?: Date;
  note?: string | null;
  isGeneratedFromRecurring?: boolean;
  recurringId?: string | null;
}

// Interface for date range filtering
export interface DateRange {
  start: Date;
  end: Date;
}

// Store state interface
interface ExpenseState {
  expenses: ExpenseData[];
  // Cached indexes for performance optimization
  expensesByBudget: Map<string, string[]>; // budgetId -> expense IDs
  expensesByDate: Map<string, string[]>; // YYYY-MM-DD -> expense IDs
  expensesByCategory: Map<string, string[]>; // categoryId -> expense IDs
  // Loading states for offline-first usage
  isLoading: boolean;
  isInitialized: boolean;
  lastSyncTimestamp: number | null;
}

// Store actions interface
interface ExpenseActions {
  addExpense: (expenseData: CreateExpenseData) => string;
  updateExpense: (id: string, updates: UpdateExpenseData) => void;
  deleteExpense: (id: string) => void;
  setExpenses: (expenses: ExpenseData[]) => void;
  getExpensesByBudget: (budgetId: string) => ExpenseData[];
  getExpensesByDateRange: (startDate: Date, endDate: Date) => ExpenseData[];
  getExpensesByCategory: (categoryId: string) => ExpenseData[];
  getExpenseById: (id: string) => ExpenseData | undefined;
  clearExpenses: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  updateLastSync: () => void;
  // Bulk operations for performance
  addExpensesBulk: (expenses: CreateExpenseData[]) => void;
  updateExpensesBulk: (updates: { id: string; updates: UpdateExpenseData }[]) => void;
  deleteExpensesBulk: (ids: string[]) => void;
  // Advanced filtering
  getRecentExpenses: (days?: number) => ExpenseData[];
  getTodayExpenses: () => ExpenseData[];
  getThisMonthExpenses: () => ExpenseData[];
  // Statistics helpers
  getTotalByBudget: (budgetId: string) => number;
  getTotalByCategory: (categoryId: string) => number;
  getTotalByDateRange: (startDate: Date, endDate: Date) => number;
}

// Combined store interface
export interface ExpenseStore extends ExpenseState, ExpenseActions {}

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

// Helper function to format date as YYYY-MM-DD for indexing
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to convert Expense Realm object to ExpenseData
export const expenseToData = (expense: Expense): ExpenseData => ({
  id: expense.id,
  budgetId: expense.budgetId,
  amount: expense.amount,
  categoryId: expense.categoryId,
  accountId: expense.accountId,
  date: expense.date,
  note: expense.note,
  isGeneratedFromRecurring: expense.isGeneratedFromRecurring,
  recurringId: expense.recurringId,
});

// Helper function to rebuild indexes for performance
const rebuildIndexes = (expenses: ExpenseData[]): {
  expensesByBudget: Map<string, string[]>;
  expensesByDate: Map<string, string[]>;
  expensesByCategory: Map<string, string[]>;
} => {
  const expensesByBudget = new Map<string, string[]>();
  const expensesByDate = new Map<string, string[]>();
  const expensesByCategory = new Map<string, string[]>();

  expenses.forEach(expense => {
    // Index by budget
    const budgetExpenses = expensesByBudget.get(expense.budgetId) || [];
    budgetExpenses.push(expense.id);
    expensesByBudget.set(expense.budgetId, budgetExpenses);

    // Index by date
    const dateKey = formatDateKey(expense.date);
    const dateExpenses = expensesByDate.get(dateKey) || [];
    dateExpenses.push(expense.id);
    expensesByDate.set(dateKey, dateExpenses);

    // Index by category
    const categoryExpenses = expensesByCategory.get(expense.categoryId) || [];
    categoryExpenses.push(expense.id);
    expensesByCategory.set(expense.categoryId, categoryExpenses);
  });

  return { expensesByBudget, expensesByDate, expensesByCategory };
};

// Create the Zustand store with immer for immutable updates
export const useExpenseStore = create<ExpenseStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      expenses: [],
      expensesByBudget: new Map(),
      expensesByDate: new Map(),
      expensesByCategory: new Map(),
      isLoading: false,
      isInitialized: false,
      lastSyncTimestamp: null,

      // Actions
      addExpense: (expenseData: CreateExpenseData) => {
        let newId = '';
        set((state) => {
          newId = generateId();
          const newExpense: ExpenseData = {
            ...expenseData,
            id: newId,
            accountId: expenseData.accountId || null,
            note: expenseData.note || null,
            isGeneratedFromRecurring: expenseData.isGeneratedFromRecurring || false,
            recurringId: expenseData.recurringId || null,
          };
          
          state.expenses.push(newExpense);
          
          // Update indexes
          const { expensesByBudget, expensesByDate, expensesByCategory } = 
            rebuildIndexes(state.expenses);
          state.expensesByBudget = expensesByBudget;
          state.expensesByDate = expensesByDate;
          state.expensesByCategory = expensesByCategory;
        });
        return newId;
      },

      updateExpense: (id: string, updates: UpdateExpenseData) => {
        set((state) => {
          const expenseIndex = state.expenses.findIndex((expense: ExpenseData) => expense.id === id);
          if (expenseIndex !== -1) {
            state.expenses[expenseIndex] = {
              ...state.expenses[expenseIndex],
              ...updates,
            };
            
            // Rebuild indexes since data might have changed budget/category/date
            const { expensesByBudget, expensesByDate, expensesByCategory } = 
              rebuildIndexes(state.expenses);
            state.expensesByBudget = expensesByBudget;
            state.expensesByDate = expensesByDate;
            state.expensesByCategory = expensesByCategory;
          }
        });
      },

      deleteExpense: (id: string) => {
        set((state) => {
          state.expenses = state.expenses.filter((expense: ExpenseData) => expense.id !== id);
          
          // Rebuild indexes
          const { expensesByBudget, expensesByDate, expensesByCategory } = 
            rebuildIndexes(state.expenses);
          state.expensesByBudget = expensesByBudget;
          state.expensesByDate = expensesByDate;
          state.expensesByCategory = expensesByCategory;
        });
      },

      setExpenses: (expenses: ExpenseData[]) => {
        set((state) => {
          state.expenses = expenses;
          
          // Rebuild indexes
          const { expensesByBudget, expensesByDate, expensesByCategory } = 
            rebuildIndexes(expenses);
          state.expensesByBudget = expensesByBudget;
          state.expensesByDate = expensesByDate;
          state.expensesByCategory = expensesByCategory;
        });
      },

      // Bulk operations for performance
      addExpensesBulk: (expensesData: CreateExpenseData[]) => {
        set((state) => {
          const newExpenses = expensesData.map((expenseData) => ({
            ...expenseData,
            id: generateId(),
            accountId: expenseData.accountId || null,
            note: expenseData.note || null,
            isGeneratedFromRecurring: expenseData.isGeneratedFromRecurring || false,
            recurringId: expenseData.recurringId || null,
          }));
          
          state.expenses.push(...newExpenses);
          
          // Rebuild indexes
          const { expensesByBudget, expensesByDate, expensesByCategory } = 
            rebuildIndexes(state.expenses);
          state.expensesByBudget = expensesByBudget;
          state.expensesByDate = expensesByDate;
          state.expensesByCategory = expensesByCategory;
        });
      },

      updateExpensesBulk: (updates: { id: string; updates: UpdateExpenseData }[]) => {
        set((state) => {
          updates.forEach(({ id, updates: updateData }) => {
            const expenseIndex = state.expenses.findIndex((expense: ExpenseData) => expense.id === id);
            if (expenseIndex !== -1) {
              state.expenses[expenseIndex] = {
                ...state.expenses[expenseIndex],
                ...updateData,
              };
            }
          });
          
          // Rebuild indexes
          const { expensesByBudget, expensesByDate, expensesByCategory } = 
            rebuildIndexes(state.expenses);
          state.expensesByBudget = expensesByBudget;
          state.expensesByDate = expensesByDate;
          state.expensesByCategory = expensesByCategory;
        });
      },

      deleteExpensesBulk: (ids: string[]) => {
        set((state) => {
          const idsSet = new Set(ids);
          state.expenses = state.expenses.filter((expense: ExpenseData) => !idsSet.has(expense.id));
          
          // Rebuild indexes
          const { expensesByBudget, expensesByDate, expensesByCategory } = 
            rebuildIndexes(state.expenses);
          state.expensesByBudget = expensesByBudget;
          state.expensesByDate = expensesByDate;
          state.expensesByCategory = expensesByCategory;
        });
      },

      // Selector functions - optimized for large lists
      getExpensesByBudget: (budgetId: string) => {
        const state = get();
        const expenseIds = state.expensesByBudget.get(budgetId) || [];
        return expenseIds
          .map(id => state.expenses.find((expense: ExpenseData) => expense.id === id))
          .filter(Boolean) as ExpenseData[];
      },

      getExpensesByDateRange: (startDate: Date, endDate: Date) => {
        const state = get();
        return state.expenses.filter((expense: ExpenseData) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate <= endDate;
        });
      },

      getExpensesByCategory: (categoryId: string) => {
        const state = get();
        const expenseIds = state.expensesByCategory.get(categoryId) || [];
        return expenseIds
          .map(id => state.expenses.find((expense: ExpenseData) => expense.id === id))
          .filter(Boolean) as ExpenseData[];
      },

      getExpenseById: (id: string) => {
        return get().expenses.find((expense: ExpenseData) => expense.id === id);
      },

      getRecentExpenses: (days: number = 7) => {
        const state = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return state.expenses.filter((expense: ExpenseData) => 
          new Date(expense.date) >= cutoffDate
        );
      },

      getTodayExpenses: () => {
        const state = get();
        const today = formatDateKey(new Date());
        const expenseIds = state.expensesByDate.get(today) || [];
        return expenseIds
          .map(id => state.expenses.find((expense: ExpenseData) => expense.id === id))
          .filter(Boolean) as ExpenseData[];
      },

      getThisMonthExpenses: () => {
        const state = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return state.expenses.filter((expense: ExpenseData) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
        });
      },

      // Statistics helpers
      getTotalByBudget: (budgetId: string) => {
        const expenses = get().getExpensesByBudget(budgetId);
        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      getTotalByCategory: (categoryId: string) => {
        const expenses = get().getExpensesByCategory(categoryId);
        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      getTotalByDateRange: (startDate: Date, endDate: Date) => {
        const expenses = get().getExpensesByDateRange(startDate, endDate);
        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      // Utility actions
      clearExpenses: () => {
        set((state) => {
          state.expenses = [];
          state.expensesByBudget = new Map();
          state.expensesByDate = new Map();
          state.expensesByCategory = new Map();
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setInitialized: (initialized: boolean) => {
        set((state) => {
          state.isInitialized = initialized;
        });
      },

      updateLastSync: () => {
        set((state) => {
          state.lastSyncTimestamp = Date.now();
        });
      },
    }))
  )
);

// Convenience hooks for common selections
export const useExpensesByBudget = (budgetId: string) => {
  return useExpenseStore(state => state.getExpensesByBudget(budgetId));
};

export const useExpensesByDateRange = (startDate: Date, endDate: Date) => {
  return useExpenseStore(state => state.getExpensesByDateRange(startDate, endDate));
};

export const useExpensesByCategory = (categoryId: string) => {
  return useExpenseStore(state => state.getExpensesByCategory(categoryId));
};

export const useExpenseById = (id: string) => {
  return useExpenseStore(state => state.getExpenseById(id));
};

export const useTodayExpenses = () => {
  return useExpenseStore(state => state.getTodayExpenses());
};

export const useThisMonthExpenses = () => {
  return useExpenseStore(state => state.getThisMonthExpenses());
};

export const useRecentExpenses = (days: number = 7) => {
  return useExpenseStore(state => state.getRecentExpenses(days));
};

// Loading state hooks for offline-first usage
export const useExpenseLoading = () => {
  return useExpenseStore(state => state.isLoading);
};

export const useExpenseInitialized = () => {
  return useExpenseStore(state => state.isInitialized);
};

export const useExpenseLastSync = () => {
  return useExpenseStore(state => state.lastSyncTimestamp);
};
