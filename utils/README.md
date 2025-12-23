# Budget Calculation & Auto-Generation Utilities

This module provides TypeScript utility functions for performing budget calculations and automatically generating expenses from recurring expense templates in the budget tracking app.

## File Structure

- **`budgetCalculations.ts`** - Core budget calculation functions (totals, percentages, remaining amounts)
- **`expenseGenerator.ts`** - Auto-generation functions for creating expenses from recurring templates
- **`autoGenerateExpenses.example.ts`** - Real-world usage examples and workflow patterns
- **`index.ts`** - Barrel exports for easy importing

## Functions

### Auto-Generation Functions (from `expenseGenerator.ts`)

#### `autoGenerateExpenses(recurringExpenses, existingExpenses?, currentDate?, generateId?): CreateExpenseData[]`
Auto-generates Expense records from RecurringExpense items for a specific date.

- **Parameters**: 
  - `recurringExpenses`: Array of RecurringExpense objects
  - `existingExpenses`: Optional array of existing expenses (for duplicate checking)
  - `currentDate`: Optional date to check against (defaults to current date)
  - `generateId`: Optional function to generate unique IDs
- **Returns**: Array of newly created expense data objects
- **Rules**:
  - Only generates if `autoAdd = true`
  - Only generates if `isActive = true`
  - Only generates if the recurring expense is due on the specified date
  - Does not duplicate existing generated expenses
  - Links generated expense to `recurringId`

```typescript
const newExpenses = autoGenerateExpenses(
  recurringExpenses,
  existingExpenses,
  new Date(),
  () => 'unique-id-' + Date.now()
);

newExpenses.forEach(expense => {
  console.log(`Generated: ${expense.note} - $${expense.amount}`);
});
```

#### `autoGenerateExpensesForDateRange(recurringExpenses, existingExpenses?, startDate, endDate, generateId?): CreateExpenseData[]`
Auto-generates Expense records for a range of dates.

- **Parameters**: Same as above, plus start and end dates
- **Returns**: Array of all newly created expense data objects across the date range
- **Behavior**: Iterates through each day and generates expenses as needed

```typescript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');

const monthlyExpenses = autoGenerateExpensesForDateRange(
  recurringExpenses,
  existingExpenses,
  startDate,
  endDate
);

console.log(`Generated ${monthlyExpenses.length} expenses for January`);
```

### Core Calculation Functions (from `budgetCalculations.ts`)

#### `getTotalSpent(expenses: Expense[]): number`
Calculates the total amount spent from a list of expenses.

- **Parameters**: Array of Expense objects
- **Returns**: Total amount spent as a number
- **Safe for**: Empty arrays (returns 0)

```typescript
const expenses = [
  { amount: 50.75, ... },
  { amount: 125.50, ... }
];
const total = getTotalSpent(expenses); // 176.25
```

#### `getTotalPlanned(recurringExpenses: RecurringExpense[]): number`
Calculates the total planned amount from active recurring expenses.

- **Parameters**: Array of RecurringExpense objects
- **Returns**: Total planned amount from active recurring expenses
- **Behavior**: Ignores inactive recurring expenses (`isActive: false`)
- **Safe for**: Empty arrays (returns 0)

```typescript
const recurringExpenses = [
  { amount: 75.00, isActive: true, ... },
  { amount: 25.00, isActive: true, ... },
  { amount: 100.00, isActive: false, ... } // ignored
];
const total = getTotalPlanned(recurringExpenses); // 100.00
```

#### `getRemainingAmount(budget: Budget, totalSpent: number, totalPlanned: number): number | null`
Calculates the remaining amount in the budget.

- **Parameters**: Budget object, total spent, total planned
- **Returns**: Remaining amount or `null` for unlimited budgets
- **Behavior**: Returns `null` if budget has no limit (`limitAmount` is null or <= 0)

```typescript
const budget = { limitAmount: 500.00, ... };
const remaining = getRemainingAmount(budget, 200, 150); // 150.00

const unlimitedBudget = { limitAmount: null, ... };
const remaining2 = getRemainingAmount(unlimitedBudget, 200, 150); // null
```

#### `getProgressPercentage(budget: Budget, totalSpent: number, totalPlanned: number): number | null`
Calculates the progress percentage of budget usage.

- **Parameters**: Budget object, total spent, total planned
- **Returns**: Progress percentage (rounded to 2 decimal places) or `null` for unlimited budgets
- **Behavior**: Returns `null` if budget has no limit

```typescript
const budget = { limitAmount: 500.00, ... };
const progress = getProgressPercentage(budget, 200, 150); // 70.00
```

### Comprehensive Function

#### `calculateBudgetMetrics(budget: Budget, expenses?: Expense[], recurringExpenses?: RecurringExpense[]): BudgetCalculationResult`
Performs all budget calculations and returns a comprehensive result object.

- **Parameters**: Budget object, optional expenses array, optional recurring expenses array
- **Returns**: Object with all calculation results
- **Safe for**: Empty or undefined arrays

```typescript
const metrics = calculateBudgetMetrics(budget, expenses, recurringExpenses);
// Returns:
// {
//   totalSpent: 251.50,
//   totalPlanned: 100.00,
//   remainingAmount: 148.50, // or null for unlimited
//   progressPercentage: 70.30 // or null for unlimited
// }
```

### Helper Functions

#### `isBudgetOverLimit(budget: Budget, totalSpent: number, totalPlanned: number): boolean`
Checks if a budget has exceeded its limit.

- **Returns**: `true` if over limit, `false` otherwise (always `false` for unlimited budgets)

#### `isBudgetAtRisk(budget: Budget, totalSpent: number, totalPlanned: number, warningThreshold?: number): boolean`
Checks if a budget is at risk of exceeding its limit.

- **Parameters**: Budget, totals, optional warning threshold (default: 80%)
- **Returns**: `true` if usage is above threshold, `false` otherwise

#### `formatCurrency(amount: number, currency?: string, showSign?: boolean): string`
Formats amounts as currency strings.

- **Parameters**: Amount, optional currency symbol (default: '$'), optional sign display
- **Returns**: Formatted currency string

```typescript
formatCurrency(123.45); // "$123.45"
formatCurrency(-123.45, '€', true); // "-€123.45"
formatCurrency(123.45, '$', true); // "+$123.45"
```

## Types

### `BudgetCalculationResult`
```typescript
interface BudgetCalculationResult {
  totalSpent: number;
  totalPlanned: number;
  remainingAmount: number | null;
  progressPercentage: number | null;
}
```

### `CreateExpenseData`
```typescript
interface CreateExpenseData {
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
```

## Key Features

### Auto-Generation Features
- **Smart Duplicate Prevention**: Won't create duplicate expenses for the same recurring expense on the same date
- **Configurable Date Assignment**: Correctly calculates due dates based on frequency and dueDay
- **Flexible ID Generation**: Allows custom ID generation functions
- **Batch Processing**: Can generate expenses for single dates or date ranges
- **Safe for Production**: Only generates when explicitly enabled (`autoAdd: true`)

### Handles Unlimited Budgets
- Functions gracefully handle budgets without limits (`limitAmount: null` or `<= 0`)
- Returns `null` for calculations that don't apply to unlimited budgets

### Ignores Inactive Items
- Only includes active recurring expenses (`isActive: true`)
- Properly filters out inactive items from calculations

### Safe for Empty Data
- All functions handle empty arrays gracefully
- Returns appropriate default values (0 for amounts, null for percentages)

### Precise Calculations
- Percentages rounded to 2 decimal places
- Handles floating-point arithmetic safely

## Usage Examples

### Basic Usage
```typescript
import { calculateBudgetMetrics } from './utils/budgetCalculations';

const budget = { limitAmount: 1000.00, ... };
const expenses = [...]; // Array of expenses
const recurring = [...]; // Array of recurring expenses

const metrics = calculateBudgetMetrics(budget, expenses, recurring);

console.log(`Spent: $${metrics.totalSpent}`);
console.log(`Planned: $${metrics.totalPlanned}`);
console.log(`Remaining: ${metrics.remainingAmount ? '$' + metrics.remainingAmount : 'Unlimited'}`);
console.log(`Progress: ${metrics.progressPercentage ? metrics.progressPercentage + '%' : 'N/A'}`);
```

### Individual Function Usage
```typescript
import { getTotalSpent, getTotalPlanned, getRemainingAmount } from './utils/budgetCalculations';

const totalSpent = getTotalSpent(expenses);
const totalPlanned = getTotalPlanned(recurringExpenses);
const remaining = getRemainingAmount(budget, totalSpent, totalPlanned);
```

### Auto-Generation Usage
```typescript
import { autoGenerateExpenses, autoGenerateExpensesForDateRange } from './utils/expenseGenerator';

// Generate expenses for today
const newExpenses = autoGenerateExpenses(recurringExpenses, existingExpenses);

// Process the generated expenses
newExpenses.forEach(expense => {
  console.log(`📝 Generated: ${expense.note} - $${expense.amount.toFixed(2)}`);
  console.log(`   Due: ${expense.date.toDateString()}`);
  console.log(`   From recurring: ${expense.recurringId}`);
});

// Generate for a month
const monthStart = new Date('2024-01-01');
const monthEnd = new Date('2024-01-31');
const monthlyExpenses = autoGenerateExpensesForDateRange(
  recurringExpenses,
  existingExpenses,
  monthStart,
  monthEnd
);

// Save to database (example with async processing)
for (const expense of newExpenses) {
  try {
    await saveExpenseToDatabase(expense);
    console.log(`✅ Saved: ${expense.note}`);
  } catch (error) {
    console.error(`❌ Failed to save: ${expense.note}`, error);
  }
}
```

### Daily Auto-Generation Workflow
```typescript
import { autoGenerateExpenses, CreateExpenseData } from './utils/expenseGenerator';

// Example daily cron job or scheduled task
async function dailyExpenseGeneration() {
  console.log('🔄 Starting daily expense generation...');
  
  // Fetch data from your database
  const recurringExpenses = await getActiveRecurringExpenses();
  const existingExpenses = await getTodaysExpenses();
  
  // Generate new expenses for today
  const newExpenses = autoGenerateExpenses(
    recurringExpenses,
    existingExpenses,
    new Date(),
    () => generateUUID() // Use your preferred ID generation
  );
  
  if (newExpenses.length === 0) {
    console.log('ℹ️ No expenses to generate today');
    return;
  }
  
  // Save to database
  const results = await Promise.allSettled(
    newExpenses.map(expense => saveExpenseToDatabase(expense))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`✅ Generated ${successful}/${newExpenses.length} expenses`);
  
  // Send notifications if needed
  if (successful > 0) {
    await sendNotification(`Generated ${successful} automatic expenses for today`);
  }
}
```

### Status Checking
```typescript
import { isBudgetOverLimit, isBudgetAtRisk } from './utils/budgetCalculations';

if (isBudgetOverLimit(budget, totalSpent, totalPlanned)) {
  console.log('⚠️ Budget exceeded!');
} else if (isBudgetAtRisk(budget, totalSpent, totalPlanned, 80)) {
  console.log('⚠️ Budget at risk (>80% used)');
}
```
