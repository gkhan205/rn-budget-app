# Budget Store Usage Examples

This file demonstrates how to use the Zustand budget store in your React components.

## Basic Usage

```typescript
import { useBudgetStore, useActiveBudget, useActiveBudgets } from '../state';

// In a React component
function BudgetComponent() {
  const { budgets, addBudget, updateBudget, archiveBudget, setActiveBudget } = useBudgetStore();
  const activeBudget = useActiveBudget();
  const activeBudgets = useActiveBudgets();

  // Add a new budget
  const handleAddBudget = () => {
    addBudget({
      name: 'Monthly Budget',
      icon: '💰',
      color: '#4CAF50',
      limitAmount: 1000,
      periodType: 'monthly',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
  };

  // Update a budget
  const handleUpdateBudget = (id: string) => {
    updateBudget(id, {
      name: 'Updated Budget Name',
      limitAmount: 1500,
    });
  };

  // Archive a budget
  const handleArchiveBudget = (id: string) => {
    archiveBudget(id);
  };

  // Set active budget
  const handleSetActiveBudget = (id: string) => {
    setActiveBudget(id);
  };

  return (
    <div>
      <h2>Active Budget: {activeBudget?.name || 'None'}</h2>
      <ul>
        {activeBudgets.map(budget => (
          <li key={budget.id}>
            {budget.icon} {budget.name} - ${budget.limitAmount}
            <button onClick={() => handleSetActiveBudget(budget.id)}>
              Set Active
            </button>
            <button onClick={() => handleUpdateBudget(budget.id)}>
              Update
            </button>
            <button onClick={() => handleArchiveBudget(budget.id)}>
              Archive
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleAddBudget}>Add Budget</button>
    </div>
  );
}
```

## Realm Integration

```typescript
import { useEffect } from 'react';
import { useRealm, useQuery } from '@realm/react';
import { Budget } from '../db/models/Budget';
import { syncBudgetsFromRealm, subscribeToBudgetChanges, budgetDataToRealm } from '../state';

function BudgetRealmSync() {
  const realm = useRealm();
  const budgets = useQuery(Budget);

  // Sync budgets from Realm to Zustand store on mount and when budgets change
  useEffect(() => {
    syncBudgetsFromRealm(budgets);
  }, [budgets]);

  // Subscribe to Zustand store changes and sync back to Realm
  useEffect(() => {
    const unsubscribe = subscribeToBudgetChanges((budgets, activeBudgetId) => {
      // Here you can implement logic to sync changes back to Realm
      // This is just an example - you'd need proper Realm write operations
      realm.write(() => {
        budgets.forEach(budgetData => {
          const existingBudget = realm.objectForPrimaryKey(Budget, budgetData.id);
          if (existingBudget) {
            // Update existing budget
            Object.assign(existingBudget, budgetDataToRealm(budgetData));
          } else {
            // Create new budget
            realm.create(Budget, budgetDataToRealm(budgetData));
          }
        });
      });
    });

    return unsubscribe;
  }, [realm]);

  return null; // This component just handles syncing
}
```

## Advanced Usage

### Using Individual Selectors

```typescript
import { useBudgetStore } from '../state';

function BudgetSelector() {
  // Only re-render when the active budget changes
  const activeBudget = useBudgetStore(state => state.getActiveBudget());
  
  // Only re-render when budgets array changes
  const budgetCount = useBudgetStore(state => state.budgets.length);
  
  // Only re-render when active budget ID changes
  const activeBudgetId = useBudgetStore(state => state.activeBudgetId);

  return (
    <div>
      <p>Active Budget: {activeBudget?.name}</p>
      <p>Total Budgets: {budgetCount}</p>
      <p>Active Budget ID: {activeBudgetId}</p>
    </div>
  );
}
```

### Accessing Store Actions Outside Components

```typescript
import { useBudgetStore } from '../state';

// You can call store actions outside of React components
export const createDefaultBudget = () => {
  useBudgetStore.getState().addBudget({
    name: 'Default Budget',
    icon: '🏦',
    color: '#2196F3',
    limitAmount: null,
    periodType: 'noEndDate',
    startDate: new Date(),
    endDate: null,
  });
};
```

## Store Features

### State
- **budgets[]**: Array of all budgets
- **activeBudgetId**: ID of the currently active budget

### Actions
- **addBudget(budgetData)**: Add a new budget
- **updateBudget(id, updates)**: Update an existing budget
- **archiveBudget(id)**: Archive a budget (sets isArchived to true)
- **setActiveBudget(id)**: Set the active budget

### Selectors
- **getBudgetById(id)**: Get a specific budget by ID
- **getActiveBudget()**: Get the currently active budget
- **getActiveBudgets()**: Get all non-archived budgets
- **getArchivedBudgets()**: Get all archived budgets

### Convenience Hooks
- **useActiveBudget()**: Hook to get the active budget
- **useActiveBudgets()**: Hook to get all active budgets
- **useArchivedBudgets()**: Hook to get all archived budgets
- **useBudgetById(id)**: Hook to get a specific budget by ID
