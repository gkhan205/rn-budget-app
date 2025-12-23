import { Expense } from '../db/models/Expense';
import { RecurringExpense } from '../db/models/RecurringExpense';
import { autoGenerateExpenses, autoGenerateExpensesForDateRange, CreateExpenseData } from './expenseGenerator';

/**
 * Example usage of the auto-generation functionality
 * This demonstrates how to use the functions in a real application
 */

// Example function to generate a unique ID (you might use uuid or similar in production)
function generateUniqueId(): string {
  return 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Example: Auto-generate expenses for today
 */
export function generateExpensesForToday(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[]
): CreateExpenseData[] {
  const today = new Date();
  
  return autoGenerateExpenses(
    recurringExpenses,
    existingExpenses,
    today,
    generateUniqueId
  );
}

/**
 * Example: Auto-generate expenses for the current month
 */
export function generateExpensesForCurrentMonth(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[]
): CreateExpenseData[] {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return autoGenerateExpensesForDateRange(
    recurringExpenses,
    existingExpenses,
    startOfMonth,
    endOfMonth,
    generateUniqueId
  );
}

/**
 * Example: Auto-generate expenses for the next 30 days
 */
export function generateExpensesForNext30Days(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[]
): CreateExpenseData[] {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  return autoGenerateExpensesForDateRange(
    recurringExpenses,
    existingExpenses,
    today,
    thirtyDaysFromNow,
    generateUniqueId
  );
}

/**
 * Example: Process and save generated expenses
 * This shows how you might integrate with your database/storage layer
 */
export async function processGeneratedExpenses(
  newExpenses: CreateExpenseData[],
  saveExpenseCallback: (expense: CreateExpenseData) => Promise<boolean>
): Promise<{ success: CreateExpenseData[]; failed: CreateExpenseData[] }> {
  const success: CreateExpenseData[] = [];
  const failed: CreateExpenseData[] = [];
  
  for (const expense of newExpenses) {
    try {
      const saved = await saveExpenseCallback(expense);
      if (saved) {
        success.push(expense);
        console.log(`✅ Generated expense: ${expense.note} - $${expense.amount}`);
      } else {
        failed.push(expense);
        console.log(`❌ Failed to save: ${expense.note}`);
      }
    } catch (error) {
      failed.push(expense);
      console.error(`❌ Error saving expense: ${expense.note}`, error);
    }
  }
  
  return { success, failed };
}

/**
 * Example: Complete workflow for daily expense generation
 */
export async function dailyExpenseGenerationWorkflow(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[],
  saveExpenseCallback: (expense: CreateExpenseData) => Promise<boolean>
): Promise<number> {
  console.log('🔄 Starting daily expense generation...');
  
  // Generate expenses for today
  const newExpenses = generateExpensesForToday(recurringExpenses, existingExpenses);
  
  if (newExpenses.length === 0) {
    console.log('ℹ️ No new expenses to generate today.');
    return 0;
  }
  
  console.log(`📝 Generated ${newExpenses.length} new expenses for today:`);
  newExpenses.forEach(expense => {
    console.log(`   • ${expense.note}: $${expense.amount.toFixed(2)}`);
  });
  
  // Process and save the expenses
  const { success, failed } = await processGeneratedExpenses(newExpenses, saveExpenseCallback);
  
  console.log(`✅ Successfully created: ${success.length} expenses`);
  if (failed.length > 0) {
    console.log(`❌ Failed to create: ${failed.length} expenses`);
  }
  
  return success.length;
}

/**
 * Example usage in a cron job or scheduled task
 */
export function exampleUsage() {
  console.log('=== Auto-Generation Examples ===\n');
  
  // Example recurring expenses (you would get these from your database)
  const recurringExpenses: Partial<RecurringExpense>[] = [
    {
      id: 'rent-1',
      budgetId: 'budget-housing',
      name: 'Monthly Rent',
      amount: 1500.00,
      frequency: 'monthly',
      dueDay: 1,
      startDate: new Date('2024-01-01'),
      endDate: null,
      accountId: 'bank-checking',
      autoAdd: true,
      isActive: true,
      isDueOnDate: (date: Date) => date.getDate() === 1,
    },
    {
      id: 'groceries-1',
      budgetId: 'budget-food',
      name: 'Weekly Groceries',
      amount: 120.00,
      frequency: 'weekly',
      dueDay: 0, // Sunday
      startDate: new Date('2024-01-01'),
      endDate: null,
      accountId: 'bank-checking',
      autoAdd: true,
      isActive: true,
      isDueOnDate: (date: Date) => date.getDay() === 0,
    },
  ];
  
  // Example existing expenses (you would get these from your database)
  const existingExpenses: Partial<Expense>[] = [];
  
  // Generate for today
  const todayExpenses = generateExpensesForToday(
    recurringExpenses as RecurringExpense[],
    existingExpenses as Expense[]
  );
  
  console.log('Generated for today:', todayExpenses.length, 'expenses');
  
  // Generate for current month
  const monthExpenses = generateExpensesForCurrentMonth(
    recurringExpenses as RecurringExpense[],
    existingExpenses as Expense[]
  );
  
  console.log('Generated for current month:', monthExpenses.length, 'expenses');
  
  // Example of how you might save to database
  const mockSaveFunction = async (expense: CreateExpenseData): Promise<boolean> => {
    // This is where you would save to your actual database
    // For example, with Realm:
    // const realm = await Realm.open(...);
    // realm.write(() => {
    //   realm.create('Expense', expense);
    // });
    console.log(`💾 Saving: ${expense.note}`);
    return true; // Simulate successful save
  };
  
  // Run the complete workflow
  dailyExpenseGenerationWorkflow(
    recurringExpenses as RecurringExpense[],
    existingExpenses as Expense[],
    mockSaveFunction
  ).then(count => {
    console.log(`\n🎉 Workflow completed: ${count} expenses created`);
  });
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage();
}
