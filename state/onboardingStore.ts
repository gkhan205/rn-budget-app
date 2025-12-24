import { create } from 'zustand';

/**
 * Temporary onboarding state store
 * Manages onboarding flow data before saving to SQLite
 */

export interface MoneyStyle {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface SelectedAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan' | 'other';
  initialBalance: number;
  color: string;
  icon: string;
}

export interface FirstBudget {
  name: string;
  icon: string;
  color: string;
  limitAmount: number | null;
  periodType: 'monthly' | 'weekly' | 'custom' | 'noEndDate';
  startDate: Date;
  endDate: Date | null;
}

export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  autoAdd: boolean;
}

export interface OnboardingState {
  // Current step in the onboarding flow
  currentStep: number;
  
  // Money management style selection
  moneyStyle: MoneyStyle | null;
  
  // Account setup
  selectedAccounts: SelectedAccount[];
  
  // First budget creation
  firstBudget: FirstBudget | null;
  
  // Recurring items setup
  recurringItems: RecurringItem[];
  
  // Completion state
  isCompleted: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setMoneyStyle: (style: MoneyStyle) => void;
  addAccount: (account: SelectedAccount) => void;
  removeAccount: (accountId: string) => void;
  updateAccount: (accountId: string, updates: Partial<SelectedAccount>) => void;
  setFirstBudget: (budget: FirstBudget) => void;
  addRecurringItem: (item: RecurringItem) => void;
  removeRecurringItem: (itemId: string) => void;
  updateRecurringItem: (itemId: string, updates: Partial<RecurringItem>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 0,
  moneyStyle: null,
  selectedAccounts: [],
  firstBudget: null,
  recurringItems: [],
  isCompleted: false,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  // Navigation actions
  setCurrentStep: (step: number) => set({ currentStep: step }),

  // Money style actions
  setMoneyStyle: (style: MoneyStyle) => set({ moneyStyle: style }),

  // Account management actions
  addAccount: (account: SelectedAccount) => 
    set((state) => ({
      selectedAccounts: [...state.selectedAccounts, account]
    })),

  removeAccount: (accountId: string) =>
    set((state) => ({
      selectedAccounts: state.selectedAccounts.filter(acc => acc.id !== accountId)
    })),

  updateAccount: (accountId: string, updates: Partial<SelectedAccount>) =>
    set((state) => ({
      selectedAccounts: state.selectedAccounts.map(acc =>
        acc.id === accountId ? { ...acc, ...updates } : acc
      )
    })),

  // Budget management actions
  setFirstBudget: (budget: FirstBudget) => set({ firstBudget: budget }),

  // Recurring items management actions
  addRecurringItem: (item: RecurringItem) =>
    set((state) => ({
      recurringItems: [...state.recurringItems, item]
    })),

  removeRecurringItem: (itemId: string) =>
    set((state) => ({
      recurringItems: state.recurringItems.filter(item => item.id !== itemId)
    })),

  updateRecurringItem: (itemId: string, updates: Partial<RecurringItem>) =>
    set((state) => ({
      recurringItems: state.recurringItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    })),

  // Completion actions
  completeOnboarding: () => set({ isCompleted: true }),

  resetOnboarding: () => set(initialState),
}));

/**
 * Helper function to validate onboarding completion
 */
export const validateOnboardingCompletion = (state: OnboardingState): boolean => {
  return !!(
    state.moneyStyle &&
    state.selectedAccounts.length > 0 &&
    state.firstBudget
    // recurringItems are optional
  );
};

/**
 * Helper function to get onboarding progress percentage
 */
export const getOnboardingProgress = (state: OnboardingState): number => {
  const totalSteps = 4; // welcome, money-style, accounts, budget, recurring, complete
  const completedSteps = [
    !!state.moneyStyle,
    state.selectedAccounts.length > 0,
    !!state.firstBudget,
    state.isCompleted
  ].filter(Boolean).length;
  
  return Math.round((completedSteps / totalSteps) * 100);
};

/**
 * Helper function to get current onboarding step status
 */
export const getStepStatus = (state: OnboardingState, step: number): 'completed' | 'current' | 'pending' => {
  if (step < state.currentStep) return 'completed';
  if (step === state.currentStep) return 'current';
  return 'pending';
};

/**
 * Predefined money management styles for selection
 */
export const MONEY_STYLES: MoneyStyle[] = [
  {
    id: 'budgeter',
    title: 'The Budgeter',
    description: 'I like to plan every dollar and stick to detailed budgets',
    icon: 'chart.bar.fill',
    color: '#4A9EFF',
  },
  {
    id: 'tracker',
    title: 'The Tracker',
    description: 'I prefer to track my spending and see where my money goes',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#2ECC71',
  },
  {
    id: 'saver',
    title: 'The Saver',
    description: 'I focus on saving money and reaching financial goals',
    icon: 'banknote.fill',
    color: '#F39C12',
  },
  {
    id: 'investor',
    title: 'The Investor',
    description: 'I want to grow my wealth through smart investments',
    icon: 'chart.line.uptrend.xyaxis.circle.fill',
    color: '#9B59B6',
  },
];

/**
 * Predefined account types for quick setup
 */
export const ACCOUNT_TEMPLATES = [
  {
    type: 'checking' as const,
    name: 'Checking Account',
    icon: 'creditcard.fill',
    color: '#4A9EFF',
  },
  {
    type: 'savings' as const,
    name: 'Savings Account',
    icon: 'banknote.fill',
    color: '#2ECC71',
  },
  {
    type: 'credit_card' as const,
    name: 'Credit Card',
    icon: 'creditcard.circle.fill',
    color: '#E74C3C',
  },
  {
    type: 'cash' as const,
    name: 'Cash',
    icon: 'dollarsign.circle.fill',
    color: '#F39C12',
  },
  {
    type: 'investment' as const,
    name: 'Investment Account',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#9B59B6',
  },
];

/**
 * Common recurring expense categories
 */
export const RECURRING_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food & Dining',
  'Utilities',
  'Insurance',
  'Subscriptions',
  'Entertainment',
  'Personal Care',
  'Healthcare',
  'Education',
  'Savings',
  'Other',
];
