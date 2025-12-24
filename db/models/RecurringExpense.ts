// TODO: SQLite RecurringExpense Model
// This will be replaced with SQLite table schema when SQLite is implemented

export type FrequencyType = 'monthly' | 'weekly' | 'yearly' | 'custom';

/**
 * RecurringExpense interface for TypeScript type safety
 * TODO: Convert to SQLite table schema
 */
export interface RecurringExpense {
  id: string;
  budgetId: string;
  name: string;
  amount: number;
  frequency: FrequencyType;
  dueDay: number | null;
  startDate: Date;
  endDate: Date | null;
  accountId: string | null;
  autoAdd: boolean;
  isActive: boolean;
}

/**
 * RecurringExpense database operations and business logic
 * TODO: Implement with SQLite queries
 */
export class RecurringExpenseService {
  /**
   * Helper function to check if the recurring expense is due on a given date
   */
  static isDueOnDate(recurringExpense: RecurringExpense, checkDate: Date): boolean {
    if (!recurringExpense.isActive) {
      return false;
    }

    const startDate = new Date(recurringExpense.startDate);
    const endDate = recurringExpense.endDate ? new Date(recurringExpense.endDate) : null;
    
    // Check if the check date is before the start date
    if (checkDate < startDate) {
      return false;
    }

    // Check if the check date is after the end date (if end date exists)
    if (endDate && checkDate > endDate) {
      return false;
    }

    switch (recurringExpense.frequency) {
      case 'monthly':
        return this.isMonthlyDue(recurringExpense, checkDate);
      case 'weekly':
        return this.isWeeklyDue(recurringExpense, checkDate, startDate);
      case 'yearly':
        return this.isYearlyDue(recurringExpense, checkDate);
      case 'custom':
        // TODO: Implement custom frequency logic
        return false;
      default:
        return false;
    }
  }

  /**
   * Helper function to check if monthly recurring expense is due
   */
  private static isMonthlyDue(recurringExpense: RecurringExpense, checkDate: Date): boolean {
    if (!recurringExpense.dueDay) {
      return false;
    }

    const dueDay = recurringExpense.dueDay;
    const checkDay = checkDate.getDate();
    
    // Handle months with fewer days than the due day
    const lastDayOfMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();
    const effectiveDueDay = Math.min(dueDay, lastDayOfMonth);
    
    return checkDay === effectiveDueDay;
  }

  /**
   * Helper function to check if weekly recurring expense is due
   */
  private static isWeeklyDue(recurringExpense: RecurringExpense, checkDate: Date, startDate: Date): boolean {
    const dayOfWeek = startDate.getDay();
    return checkDate.getDay() === dayOfWeek;
  }

  /**
   * Helper function to check if yearly recurring expense is due
   */
  private static isYearlyDue(recurringExpense: RecurringExpense, checkDate: Date): boolean {
    const startDate = new Date(recurringExpense.startDate);
    return checkDate.getMonth() === startDate.getMonth() && 
           checkDate.getDate() === startDate.getDate();
  }

  /**
   * Get the next due date for the recurring expense
   */
  static getNextDueDate(recurringExpense: RecurringExpense, fromDate?: Date): Date | null {
    if (!recurringExpense.isActive) {
      return null;
    }

    const currentDate = fromDate || new Date();
    const startDate = new Date(recurringExpense.startDate);
    const endDate = recurringExpense.endDate ? new Date(recurringExpense.endDate) : null;

    // Start checking from the later of currentDate or startDate
    let checkDate = new Date(Math.max(currentDate.getTime(), startDate.getTime()));

    // Look ahead up to 2 years to find the next due date
    const maxLookAhead = new Date(checkDate.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));

    while (checkDate <= maxLookAhead) {
      // Check if we've passed the end date
      if (endDate && checkDate > endDate) {
        return null;
      }

      if (this.isDueOnDate(recurringExpense, checkDate)) {
        return checkDate;
      }

      // Move to the next day
      checkDate.setDate(checkDate.getDate() + 1);
    }

    return null;
  }

  /**
   * Format the frequency as a human-readable string
   */
  static formatFrequency(recurringExpense: RecurringExpense): string {
    switch (recurringExpense.frequency) {
      case 'monthly':
        if (recurringExpense.dueDay) {
          return `Monthly on the ${this.getOrdinalNumber(recurringExpense.dueDay)}`;
        }
        return 'Monthly';
      case 'weekly':
        return 'Weekly';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  }

  /**
   * Convert number to ordinal (1st, 2nd, 3rd, etc.)
   */
  private static getOrdinalNumber(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  /**
   * Check if the recurring expense is currently active
   */
  static isCurrentlyActive(recurringExpense: RecurringExpense): boolean {
    if (!recurringExpense.isActive) {
      return false;
    }

    const now = new Date();
    const startDate = new Date(recurringExpense.startDate);
    const endDate = recurringExpense.endDate ? new Date(recurringExpense.endDate) : null;

    // Check if current date is after start date
    if (now < startDate) {
      return false;
    }

    // Check if current date is before end date (if exists)
    if (endDate && now > endDate) {
      return false;
    }

    return true;
  }

  /**
   * Format the amount as currency
   */
  static formatAmount(recurringExpense: RecurringExpense, currency = 'USD', locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(recurringExpense.amount);
  }
}

export default RecurringExpense;
