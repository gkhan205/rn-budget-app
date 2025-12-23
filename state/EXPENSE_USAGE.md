# Expense Store Usage Examples

This file demonstrates how to use the Zustand expense store optimized for large lists and offline-first usage.

## Basic Usage

```typescript
import { 
  useExpenseStore, 
  useExpensesByBudget, 
  useTodayExpenses,
  useThisMonthExpenses 
} from '../state';

// In a React component
function ExpenseComponent() {
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    isLoading,
    isInitialized 
  } = useExpenseStore();
  
  const todayExpenses = useTodayExpenses();
  const monthExpenses = useThisMonthExpenses();

  // Add a new expense
  const handleAddExpense = () => {
    const expenseId = addExpense({
      budgetId: 'budget-123',
      amount: 25.99,
      categoryId: 'food',
      date: new Date(),
      note: 'Coffee and pastry',
    });
    console.log('Created expense with ID:', expenseId);
  };

  // Update an expense
  const handleUpdateExpense = (id: string) => {
    updateExpense(id, {
      amount: 30.00,
      note: 'Updated: Coffee, pastry, and tip',
    });
  };

  // Delete an expense
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  if (!isInitialized) {
    return <div>Loading expenses...</div>;
  }

  return (
    <div>
      <h2>Today's Expenses: {todayExpenses.length}</h2>
      <h3>This Month's Total: ${monthExpenses.reduce((sum, e) => sum + e.amount, 0)}</h3>
      
      {isLoading && <div>Syncing...</div>}
      
      <ul>
        {todayExpenses.map(expense => (
          <li key={expense.id}>
            ${expense.amount} - {expense.note || 'No note'}
            <button onClick={() => handleUpdateExpense(expense.id)}>
              Edit
            </button>
            <button onClick={() => handleDeleteExpense(expense.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      <button onClick={handleAddExpense}>Add Expense</button>
    </div>
  );
}
```

## Budget-Specific Expenses

```typescript
import { useExpensesByBudget, useExpenseStore } from '../state';

function BudgetExpensesComponent({ budgetId }: { budgetId: string }) {
  const budgetExpenses = useExpensesByBudget(budgetId);
  const { getTotalByBudget } = useExpenseStore();
  
  const total = getTotalByBudget(budgetId);

  return (
    <div>
      <h3>Budget Total: ${total}</h3>
      <ul>
        {budgetExpenses.map(expense => (
          <li key={expense.id}>
            ${expense.amount} on {expense.date.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Date Range Filtering

```typescript
import { useExpenseStore } from '../state';

function ExpenseDateRangeComponent() {
  const { getExpensesByDateRange, getTotalByDateRange } = useExpenseStore();
  
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');
  
  const expenses = getExpensesByDateRange(startDate, endDate);
  const total = getTotalByDateRange(startDate, endDate);

  return (
    <div>
      <h3>January Expenses: ${total}</h3>
      <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.date.toDateString()}: ${expense.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Bulk Operations for Performance

```typescript
import { useExpenseStore } from '../state';

function BulkExpenseOperations() {
  const { addExpensesBulk, updateExpensesBulk, deleteExpensesBulk } = useExpenseStore();

  // Add multiple expenses at once (better performance)
  const handleBulkAdd = () => {
    addExpensesBulk([
      {
        budgetId: 'budget-123',
        amount: 10.00,
        categoryId: 'food',
        date: new Date(),
        note: 'Snack 1',
      },
      {
        budgetId: 'budget-123',
        amount: 15.00,
        categoryId: 'food',
        date: new Date(),
        note: 'Snack 2',
      },
      // ... more expenses
    ]);
  };

  // Update multiple expenses
  const handleBulkUpdate = () => {
    updateExpensesBulk([
      { id: 'expense-1', updates: { amount: 12.00 } },
      { id: 'expense-2', updates: { amount: 18.00 } },
    ]);
  };

  // Delete multiple expenses
  const handleBulkDelete = () => {
    deleteExpensesBulk(['expense-1', 'expense-2', 'expense-3']);
  };

  return (
    <div>
      <button onClick={handleBulkAdd}>Add Multiple Expenses</button>
      <button onClick={handleBulkUpdate}>Update Multiple</button>
      <button onClick={handleBulkDelete}>Delete Multiple</button>
    </div>
  );
}
```

## Realm Integration

```typescript
import { useEffect } from 'react';
import { useRealm, useQuery } from '@realm/react';
import { Expense } from '../db/models/Expense';
import { 
  syncExpensesFromRealm, 
  batchSyncExpensesFromRealm,
  subscribeToExpenseChanges,
  preloadExpensesForBudgets 
} from '../state';

function ExpenseRealmSync() {
  const realm = useRealm();
  const expenses = useQuery(Expense);

  // Initial sync from Realm
  useEffect(() => {
    if (expenses.length > 1000) {
      // Use batch sync for large datasets
      batchSyncExpensesFromRealm(expenses, 200);
    } else {
      // Regular sync for smaller datasets
      syncExpensesFromRealm(expenses);
    }
  }, [expenses]);

  // Subscribe to Zustand store changes and sync back to Realm
  useEffect(() => {
    const unsubscribe = subscribeToExpenseChanges((expenses) => {
      // Implement your Realm write logic here
      // This is just an example
      realm.write(() => {
        expenses.forEach(expenseData => {
          const existing = realm.objectForPrimaryKey(Expense, expenseData.id);
          if (existing) {
            Object.assign(existing, expenseData);
          } else {
            realm.create(Expense, expenseData);
          }
        });
      });
    });

    return unsubscribe;
  }, [realm]);

  // Preload expenses for active budgets
  useEffect(() => {
    preloadExpensesForBudgets(['budget-1', 'budget-2']);
  }, []);

  return null;
}
```

## Performance Optimization for Large Lists

```typescript
import { useMemo } from 'react';
import { useExpenseStore, useExpensesByBudget } from '../state';

function OptimizedExpenseList({ budgetId }: { budgetId: string }) {
  const expenses = useExpensesByBudget(budgetId);
  
  // Memoize expensive calculations
  const sortedExpenses = useMemo(() => {
    return expenses
      .slice() // Create copy to avoid mutating store data
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  return (
    <div>
      <h3>Expenses by Category</h3>
      {Object.entries(expensesByCategory).map(([categoryId, total]) => (
        <div key={categoryId}>
          {categoryId}: ${total.toFixed(2)}
        </div>
      ))}
      
      <h3>Recent Expenses</h3>
      {sortedExpenses.slice(0, 50).map(expense => (
        <div key={expense.id}>
          {expense.date.toDateString()}: ${expense.amount}
        </div>
      ))}
    </div>
  );
}
```

## Offline-First Usage

```typescript
import { useExpenseStore, useExpenseLoading, useExpenseLastSync } from '../state';

function OfflineExpenseManager() {
  const { isInitialized } = useExpenseStore();
  const isLoading = useExpenseLoading();
  const lastSync = useExpenseLastSync();
  
  const syncAge = lastSync ? Date.now() - lastSync : null;
  const isStale = syncAge && syncAge > 5 * 60 * 1000; // 5 minutes

  return (
    <div>
      <div>
        Status: {!isInitialized ? 'Not loaded' : isLoading ? 'Syncing' : 'Ready'}
      </div>
      
      {isStale && (
        <div style={{ color: 'orange' }}>
          Data may be outdated (last sync: {new Date(lastSync!).toLocaleTimeString()})
        </div>
      )}
      
      {!navigator.onLine && (
        <div style={{ color: 'red' }}>
          Offline - changes will sync when connection is restored
        </div>
      )}
    </div>
  );
}
```

## Store Features

### State
- **expenses[]**: Array of all expenses
- **expensesByBudget**: Map for O(1) budget lookups
- **expensesByDate**: Map for O(1) date lookups  
- **expensesByCategory**: Map for O(1) category lookups
- **isLoading**: Loading state for sync operations
- **isInitialized**: Whether data has been loaded
- **lastSyncTimestamp**: Track when data was last synced

### Performance Actions
- **addExpensesBulk()**: Add multiple expenses efficiently
- **updateExpensesBulk()**: Update multiple expenses
- **deleteExpensesBulk()**: Delete multiple expenses

### Query Actions (Optimized)
- **getExpensesByBudget()**: Uses index for fast lookup
- **getExpensesByDateRange()**: Efficient date filtering
- **getExpensesByCategory()**: Uses index for fast lookup
- **getTodayExpenses()**: Uses date index
- **getRecentExpenses()**: Configurable recent window

### Statistics
- **getTotalByBudget()**: Sum expenses by budget
- **getTotalByCategory()**: Sum expenses by category
- **getTotalByDateRange()**: Sum expenses in date range

The store is optimized for:
- **Large datasets** (10k+ expenses) with indexed lookups
- **Offline-first usage** with sync state tracking
- **Bulk operations** to avoid UI blocking
- **Memory efficiency** with Map-based indexes
