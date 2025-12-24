import { Expense } from '../db/models/Expense';
import { RecurringExpense, RecurringExpenseService } from '../db/models/RecurringExpense';

/**
 * Interface for creating a new expense
 */
export interface CreateExpenseData {
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

/**
 * Auto-generates Expense records from RecurringExpense items
 * @param recurringExpenses - Array of recurring expense objects
 * @param existingExpenses - Array of existing expense objects to check for duplicates
 * @param currentDate - The date to check against (defaults to current date)
 * @param generateId - Function to generate unique IDs for new expenses
 * @returns Array of newly created expense data objects
 */
export function autoGenerateExpenses(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[] = [],
  currentDate: Date = new Date(),
  generateId: () => string = () => Math.random().toString(36).substring(2, 15)
): CreateExpenseData[] {
  if (!recurringExpenses || recurringExpenses.length === 0) {
    return [];
  }

  const newExpenses: CreateExpenseData[] = [];

  // Create a map of existing generated expenses by recurring ID and date for quick lookup
  const existingGeneratedExpenses = new Map<string, Set<string>>();
  existingExpenses
    .filter(expense => expense.isGeneratedFromRecurring && expense.recurringId)
    .forEach(expense => {
      const dateKey = formatDateKey(expense.date);
      const recurringId = expense.recurringId!;
      
      if (!existingGeneratedExpenses.has(recurringId)) {
        existingGeneratedExpenses.set(recurringId, new Set());
      }
      existingGeneratedExpenses.get(recurringId)!.add(dateKey);
    });

  recurringExpenses.forEach(recurringExpense => {
    // Only process if autoAdd is true, is active, and is due
    if (!recurringExpense.autoAdd || !recurringExpense.isActive) {
      return;
    }

    // Check if the recurring expense is due on the current date
    if (!RecurringExpenseService.isDueOnDate(recurringExpense, currentDate)) {
      return;
    }

    // Calculate the correct due date based on frequency and dueDay
    const dueDate = calculateDueDate(recurringExpense, currentDate);
    const dateKey = formatDateKey(dueDate);

    // Check if we already have an expense generated for this recurring expense on this date
    const existingDatesForRecurring = existingGeneratedExpenses.get(recurringExpense.id);
    if (existingDatesForRecurring && existingDatesForRecurring.has(dateKey)) {
      return; // Already generated for this date
    }

    // Create the new expense
    const newExpense: CreateExpenseData = {
      id: generateId(),
      budgetId: recurringExpense.budgetId,
      amount: recurringExpense.amount,
      categoryId: 'default', // You might want to add categoryId to RecurringExpense model
      accountId: recurringExpense.accountId,
      date: dueDate,
      note: `Auto-generated from recurring expense: ${recurringExpense.name}`,
      isGeneratedFromRecurring: true,
      recurringId: recurringExpense.id,
    };

    newExpenses.push(newExpense);
  });

  return newExpenses;
}

/**
 * Generate expenses for a date range instead of just current date
 * @param recurringExpenses - Array of recurring expense objects
 * @param existingExpenses - Array of existing expense objects to check for duplicates
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param generateId - Function to generate unique IDs for new expenses
 * @returns Array of newly created expense data objects
 */
export function autoGenerateExpensesForDateRange(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[] = [],
  startDate: Date,
  endDate: Date,
  generateId: () => string = () => Math.random().toString(36).substring(2, 15)
): CreateExpenseData[] {
  if (!recurringExpenses || recurringExpenses.length === 0) {
    return [];
  }

  const allNewExpenses: CreateExpenseData[] = [];
  const currentDate = new Date(startDate);

  // Create a combined map of existing expenses for the entire range
  const existingGeneratedExpenses = new Map<string, Set<string>>();
  existingExpenses
    .filter(expense => expense.isGeneratedFromRecurring && expense.recurringId)
    .forEach(expense => {
      const dateKey = formatDateKey(expense.date);
      const recurringId = expense.recurringId!;
      
      if (!existingGeneratedExpenses.has(recurringId)) {
        existingGeneratedExpenses.set(recurringId, new Set());
      }
      existingGeneratedExpenses.get(recurringId)!.add(dateKey);
    });

  // Iterate through each day in the date range
  while (currentDate <= endDate) {
    recurringExpenses.forEach(recurringExpense => {
      // Only process if autoAdd is true, is active, and is due
      if (!recurringExpense.autoAdd || !recurringExpense.isActive) {
        return;
      }

      // Check if the recurring expense is due on the current date
      if (!RecurringExpenseService.isDueOnDate(recurringExpense, new Date(currentDate))) {
        return;
      }

      // Calculate the correct due date based on frequency and dueDay
      const dueDate = calculateDueDate(recurringExpense, new Date(currentDate));
      const dateKey = formatDateKey(dueDate);

      // Check if we already have an expense generated for this recurring expense on this date
      const existingDatesForRecurring = existingGeneratedExpenses.get(recurringExpense.id);
      if (existingDatesForRecurring && existingDatesForRecurring.has(dateKey)) {
        return; // Already generated for this date
      }

      // Also check if we already generated one in this session
      const alreadyGeneratedInSession = allNewExpenses.some(
        expense => expense.recurringId === recurringExpense.id && formatDateKey(expense.date) === dateKey
      );
      if (alreadyGeneratedInSession) {
        return;
      }

      // Create the new expense
      const newExpense: CreateExpenseData = {
        id: generateId(),
        budgetId: recurringExpense.budgetId,
        amount: recurringExpense.amount,
        categoryId: 'default', // You might want to add categoryId to RecurringExpense model
        accountId: recurringExpense.accountId,
        date: dueDate,
        note: `Auto-generated from recurring expense: ${recurringExpense.name}`,
        isGeneratedFromRecurring: true,
        recurringId: recurringExpense.id,
      };

      allNewExpenses.push(newExpense);

      // Add to our tracking map to prevent duplicates within this session
      if (!existingGeneratedExpenses.has(recurringExpense.id)) {
        existingGeneratedExpenses.set(recurringExpense.id, new Set());
      }
      existingGeneratedExpenses.get(recurringExpense.id)!.add(dateKey);
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allNewExpenses;
}

/**
 * Calculate the correct due date based on recurring expense frequency and dueDay
 * @param recurringExpense - The recurring expense object
 * @param referenceDate - The reference date to calculate from
 * @returns The calculated due date
 */
function calculateDueDate(recurringExpense: RecurringExpense, referenceDate: Date): Date {
  const dueDate = new Date(referenceDate);

  switch (recurringExpense.frequency) {
    case 'monthly':
      if (recurringExpense.dueDay !== null) {
        // Set to the specific day of the month
        const daysInMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        const effectiveDueDay = Math.min(recurringExpense.dueDay, daysInMonth);
        dueDate.setDate(effectiveDueDay);
      }
      break;

    case 'weekly':
      if (recurringExpense.dueDay !== null) {
        // Set to the specific day of the week (0 = Sunday, 1 = Monday, etc.)
        const currentDayOfWeek = dueDate.getDay();
        const daysUntilDue = (recurringExpense.dueDay - currentDayOfWeek + 7) % 7;
        if (daysUntilDue === 0 && currentDayOfWeek === recurringExpense.dueDay) {
          // Already on the correct day
        } else {
          dueDate.setDate(dueDate.getDate() + daysUntilDue);
        }
      }
      break;

    case 'yearly':
      // For yearly, use the same month and day as the start date
      const startDate = new Date(recurringExpense.startDate);
      dueDate.setMonth(startDate.getMonth());
      dueDate.setDate(startDate.getDate());
      break;

    case 'custom':
      // For custom frequency, use the dueDay as day of month if available
      if (recurringExpense.dueDay !== null) {
        const daysInMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        const effectiveDueDay = Math.min(recurringExpense.dueDay, daysInMonth);
        dueDate.setDate(effectiveDueDay);
      }
      break;
  }

  return dueDate;
}

/**
 * Format a date as a key for comparison (YYYY-MM-DD format)
 * @param date - The date to format
 * @returns Formatted date string
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}
