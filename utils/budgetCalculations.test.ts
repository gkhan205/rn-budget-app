import { Budget } from '../db/models/Budget';
import { Expense } from '../db/models/Expense';
import { RecurringExpense } from '../db/models/RecurringExpense';
import {
    calculateBudgetMetrics,
    formatCurrency,
    getProgressPercentage,
    getRemainingAmount,
    getTotalPlanned,
    getTotalSpent,
    isBudgetAtRisk,
    isBudgetOverLimit,
} from '../utils/budgetCalculations';
import {
    autoGenerateExpenses,
    autoGenerateExpensesForDateRange,
    CreateExpenseData,
} from '../utils/expenseGenerator';

// Mock data for testing
const mockBudgetWithLimit: Partial<Budget> = {
  id: 'budget-1',
  name: 'Monthly Groceries',
  limitAmount: 500.00,
  periodType: 'monthly',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  isArchived: false,
};

const mockBudgetWithoutLimit: Partial<Budget> = {
  id: 'budget-2',
  name: 'Unlimited Budget',
  limitAmount: null,
  periodType: 'noEndDate',
  startDate: new Date('2024-01-01'),
  endDate: null,
  isArchived: false,
};

const mockExpenses: Partial<Expense>[] = [
  {
    id: 'expense-1',
    budgetId: 'budget-1',
    amount: 50.75,
    date: new Date('2024-01-15'),
    isGeneratedFromRecurring: false,
  },
  {
    id: 'expense-2',
    budgetId: 'budget-1',
    amount: 125.50,
    date: new Date('2024-01-20'),
    isGeneratedFromRecurring: false,
  },
  {
    id: 'expense-3',
    budgetId: 'budget-1',
    amount: 75.25,
    date: new Date('2024-01-25'),
    isGeneratedFromRecurring: true,
    recurringId: 'recurring-1',
  },
];

const mockRecurringExpenses: Partial<RecurringExpense>[] = [
  {
    id: 'recurring-1',
    budgetId: 'budget-1',
    name: 'Weekly Groceries',
    amount: 75.00,
    frequency: 'weekly',
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'recurring-2',
    budgetId: 'budget-1',
    name: 'Monthly Subscription',
    amount: 25.00,
    frequency: 'monthly',
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'recurring-3',
    budgetId: 'budget-1',
    name: 'Inactive Expense',
    amount: 100.00,
    frequency: 'monthly',
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: false, // This should be ignored
  },
];

// Test functions
console.log('=== Budget Calculation Tests ===\n');

// Test 1: getTotalSpent
console.log('Test 1: getTotalSpent');
const totalSpent = getTotalSpent(mockExpenses as Expense[]);
console.log(`Total spent: $${totalSpent.toFixed(2)}`); // Should be 251.50
console.log(`Empty array test: $${getTotalSpent([]).toFixed(2)}`); // Should be 0.00
console.log();

// Test 2: getTotalPlanned
console.log('Test 2: getTotalPlanned');
const totalPlanned = getTotalPlanned(mockRecurringExpenses as RecurringExpense[]);
console.log(`Total planned: $${totalPlanned.toFixed(2)}`); // Should be 100.00 (75 + 25, ignoring inactive)
console.log(`Empty array test: $${getTotalPlanned([]).toFixed(2)}`); // Should be 0.00
console.log();

// Test 3: getRemainingAmount
console.log('Test 3: getRemainingAmount');
const remainingWithLimit = getRemainingAmount(mockBudgetWithLimit as Budget, totalSpent, totalPlanned);
console.log(`Remaining amount (limited budget): ${remainingWithLimit !== null ? '$' + remainingWithLimit.toFixed(2) : 'null'}`);

const remainingWithoutLimit = getRemainingAmount(mockBudgetWithoutLimit as Budget, totalSpent, totalPlanned);
console.log(`Remaining amount (unlimited budget): ${remainingWithoutLimit !== null ? '$' + remainingWithoutLimit.toFixed(2) : 'null'}`);
console.log();

// Test 4: getProgressPercentage
console.log('Test 4: getProgressPercentage');
const progressWithLimit = getProgressPercentage(mockBudgetWithLimit as Budget, totalSpent, totalPlanned);
console.log(`Progress percentage (limited budget): ${progressWithLimit !== null ? progressWithLimit.toFixed(2) + '%' : 'null'}`);

const progressWithoutLimit = getProgressPercentage(mockBudgetWithoutLimit as Budget, totalSpent, totalPlanned);
console.log(`Progress percentage (unlimited budget): ${progressWithoutLimit !== null ? progressWithoutLimit.toFixed(2) + '%' : 'null'}`);
console.log();

// Test 5: calculateBudgetMetrics
console.log('Test 5: calculateBudgetMetrics (comprehensive)');
const metricsWithLimit = calculateBudgetMetrics(
  mockBudgetWithLimit as Budget,
  mockExpenses as Expense[],
  mockRecurringExpenses as RecurringExpense[]
);
console.log('Limited Budget Metrics:', {
  totalSpent: `$${metricsWithLimit.totalSpent.toFixed(2)}`,
  totalPlanned: `$${metricsWithLimit.totalPlanned.toFixed(2)}`,
  remainingAmount: metricsWithLimit.remainingAmount !== null ? `$${metricsWithLimit.remainingAmount.toFixed(2)}` : 'null',
  progressPercentage: metricsWithLimit.progressPercentage !== null ? `${metricsWithLimit.progressPercentage.toFixed(2)}%` : 'null',
});

const metricsWithoutLimit = calculateBudgetMetrics(
  mockBudgetWithoutLimit as Budget,
  mockExpenses as Expense[],
  mockRecurringExpenses as RecurringExpense[]
);
console.log('Unlimited Budget Metrics:', {
  totalSpent: `$${metricsWithoutLimit.totalSpent.toFixed(2)}`,
  totalPlanned: `$${metricsWithoutLimit.totalPlanned.toFixed(2)}`,
  remainingAmount: metricsWithoutLimit.remainingAmount !== null ? `$${metricsWithoutLimit.remainingAmount.toFixed(2)}` : 'null',
  progressPercentage: metricsWithoutLimit.progressPercentage !== null ? `${metricsWithoutLimit.progressPercentage.toFixed(2)}%` : 'null',
});
console.log();

// Test 6: Edge cases
console.log('Test 6: Edge Cases');
const emptyMetrics = calculateBudgetMetrics(
  mockBudgetWithLimit as Budget,
  [], // Empty expenses
  []  // Empty recurring expenses
);
console.log('Empty arrays test:', {
  totalSpent: `$${emptyMetrics.totalSpent.toFixed(2)}`,
  totalPlanned: `$${emptyMetrics.totalPlanned.toFixed(2)}`,
  remainingAmount: emptyMetrics.remainingAmount !== null ? `$${emptyMetrics.remainingAmount.toFixed(2)}` : 'null',
  progressPercentage: emptyMetrics.progressPercentage !== null ? `${emptyMetrics.progressPercentage.toFixed(2)}%` : 'null',
});
console.log();

// Test 7: Budget status checks
console.log('Test 7: Budget Status Checks');
console.log(`Budget over limit: ${isBudgetOverLimit(mockBudgetWithLimit as Budget, totalSpent, totalPlanned)}`);
console.log(`Budget at risk (80% threshold): ${isBudgetAtRisk(mockBudgetWithLimit as Budget, totalSpent, totalPlanned, 80)}`);
console.log(`Budget at risk (60% threshold): ${isBudgetAtRisk(mockBudgetWithLimit as Budget, totalSpent, totalPlanned, 60)}`);
console.log();

// Test 8: Currency formatting
console.log('Test 8: Currency Formatting');
console.log(`Positive amount: ${formatCurrency(123.45)}`);
console.log(`Negative amount: ${formatCurrency(-123.45)}`);
console.log(`With sign (positive): ${formatCurrency(123.45, '$', true)}`);
console.log(`With sign (negative): ${formatCurrency(-123.45, '$', true)}`);
console.log(`Different currency: ${formatCurrency(123.45, '€')}`);
console.log();

// Test 9: Auto-generate expenses functionality
console.log('Test 9: Auto-Generate Expenses');

// Mock recurring expenses for testing auto-generation
const mockRecurringForAutoGen: Partial<RecurringExpense>[] = [
  {
    id: 'recurring-auto-1',
    budgetId: 'budget-1',
    name: 'Monthly Rent',
    amount: 1200.00,
    frequency: 'monthly',
    dueDay: 1, // 1st of every month
    startDate: new Date('2024-01-01'),
    endDate: null,
    accountId: null,
    autoAdd: true,  // Should be auto-generated
    isActive: true,
    isDueOnDate: (date: Date) => date.getDate() === 1, // Mock implementation
  },
  {
    id: 'recurring-auto-2',
    budgetId: 'budget-1',
    name: 'Weekly Groceries',
    amount: 150.00,
    frequency: 'weekly',
    dueDay: 1, // Mondays (1 = Monday)
    startDate: new Date('2024-01-01'),
    endDate: null,
    accountId: null,
    autoAdd: true,  // Should be auto-generated
    isActive: true,
    isDueOnDate: (date: Date) => date.getDay() === 1, // Mock implementation
  },
  {
    id: 'recurring-auto-3',
    budgetId: 'budget-1',
    name: 'Manual Subscription',
    amount: 50.00,
    frequency: 'monthly',
    dueDay: 15,
    startDate: new Date('2024-01-01'),
    endDate: null,
    accountId: null,
    autoAdd: false, // Should NOT be auto-generated
    isActive: true,
    isDueOnDate: (date: Date) => date.getDate() === 15, // Mock implementation
  },
  {
    id: 'recurring-auto-4',
    budgetId: 'budget-1',
    name: 'Inactive Expense',
    amount: 75.00,
    frequency: 'monthly',
    dueDay: 1,
    startDate: new Date('2024-01-01'),
    endDate: null,
    accountId: null,
    autoAdd: true,
    isActive: false, // Should NOT be auto-generated (inactive)
    isDueOnDate: (date: Date) => date.getDate() === 1, // Mock implementation
  },
];

// Existing generated expenses to test duplicate prevention
const existingGeneratedExpenses: Partial<Expense>[] = [
  {
    id: 'existing-1',
    budgetId: 'budget-1',
    amount: 1200.00,
    date: new Date('2024-01-01'), // Already generated for this date
    isGeneratedFromRecurring: true,
    recurringId: 'recurring-auto-1',
  },
];

// Test for January 1st, 2024 (Monday)
const testDate = new Date('2024-01-01');
console.log(`Testing auto-generation for: ${testDate.toDateString()}`);

const generatedExpenses = autoGenerateExpenses(
  mockRecurringForAutoGen as RecurringExpense[],
  existingGeneratedExpenses as Expense[],
  testDate,
  () => 'test-id-' + Math.random().toString(36).substring(2, 8)
);

console.log(`Generated ${generatedExpenses.length} new expenses:`);
generatedExpenses.forEach((expense: CreateExpenseData) => {
  console.log(`- ${expense.note}: $${expense.amount.toFixed(2)} on ${expense.date.toDateString()}`);
  console.log(`  Recurring ID: ${expense.recurringId}, Auto-generated: ${expense.isGeneratedFromRecurring}`);
});

// Test for date range generation
console.log('\nTesting date range generation (Jan 1-7, 2024):');
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-07');

const rangeGeneratedExpenses = autoGenerateExpensesForDateRange(
  mockRecurringForAutoGen as RecurringExpense[],
  existingGeneratedExpenses as Expense[],
  startDate,
  endDate,
  () => 'range-test-id-' + Math.random().toString(36).substring(2, 8)
);

console.log(`Generated ${rangeGeneratedExpenses.length} expenses for date range:`);
rangeGeneratedExpenses.forEach((expense: CreateExpenseData) => {
  console.log(`- ${expense.date.toDateString()}: ${expense.note} - $${expense.amount.toFixed(2)}`);
});

// Test empty arrays
console.log('\nTesting with empty arrays:');
const emptyGenerated = autoGenerateExpenses([], []);
console.log(`Empty arrays result: ${emptyGenerated.length} expenses generated`);

console.log();

console.log('=== All Tests Complete ===');
