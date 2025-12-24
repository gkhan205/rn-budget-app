// TODO: SQLite Expense Model
// This will be replaced with SQLite table schema when SQLite is implemented

/**
 * Expense interface for TypeScript type safety
 * TODO: Convert to SQLite table schema
 */
export interface Expense {
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
 * Expense database operations and business logic
 * TODO: Implement with SQLite queries
 */
export class ExpenseService {
  /**
   * Helper function to format the expense date
   * @param expense - The expense object
   * @param format - The format style ('short', 'long', 'medium', 'relative')
   * @returns string - Formatted date string
   */
  static formatDate(expense: Expense, format: 'short' | 'long' | 'medium' | 'relative' = 'medium'): string {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    
    switch (format) {
      case 'short':
        return expenseDate.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      
      case 'long':
        return expenseDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      case 'medium':
        return expenseDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      
      case 'relative':
        const timeDiff = now.getTime() - expenseDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff === 0) {
          return 'Today';
        } else if (daysDiff === 1) {
          return 'Yesterday';
        } else if (daysDiff < 7) {
          return `${daysDiff} days ago`;
        } else if (daysDiff < 30) {
          const weeksDiff = Math.floor(daysDiff / 7);
          return weeksDiff === 1 ? '1 week ago' : `${weeksDiff} weeks ago`;
        } else if (daysDiff < 365) {
          const monthsDiff = Math.floor(daysDiff / 30);
          return monthsDiff === 1 ? '1 month ago' : `${monthsDiff} months ago`;
        } else {
          const yearsDiff = Math.floor(daysDiff / 365);
          return yearsDiff === 1 ? '1 year ago' : `${yearsDiff} years ago`;
        }
      
      default:
        return expenseDate.toLocaleDateString();
    }
  }

  /**
   * Helper function to format the expense amount as currency
   */
  static formatAmount(expense: Expense, currency = 'USD', locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(expense.amount);
  }

  /**
   * Helper function to check if the expense was made today
   */
  static isToday(expense: Expense): boolean {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    
    return expenseDate.getDate() === today.getDate() &&
           expenseDate.getMonth() === today.getMonth() &&
           expenseDate.getFullYear() === today.getFullYear();
  }

  /**
   * Helper function to check if the expense was made in the current month
   */
  static isThisMonth(expense: Expense): boolean {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    
    return expenseDate.getMonth() === today.getMonth() &&
           expenseDate.getFullYear() === today.getFullYear();
  }

  /**
   * Helper function to check if this expense is auto-generated from a recurring expense
   */
  static isFromRecurring(expense: Expense): boolean {
    return expense.isGeneratedFromRecurring && !!expense.recurringId;
  }
}

export default Expense;
