import Realm from 'realm';

export class Expense extends Realm.Object<Expense> {
  id!: string;
  budgetId!: string;
  amount!: number;
  categoryId!: string;
  accountId!: string | null;
  date!: Date;
  note!: string | null;
  isGeneratedFromRecurring!: boolean;
  recurringId!: string | null;

  static schema: Realm.ObjectSchema = {
    name: 'Expense',
    primaryKey: 'id',
    properties: {
      id: 'string',
      budgetId: 'string',
      amount: 'double',
      categoryId: 'string',
      accountId: 'string?',
      date: 'date',
      note: 'string?',
      isGeneratedFromRecurring: { type: 'bool', default: false },
      recurringId: 'string?',
    },
  };

  /**
   * Helper function to format the expense date
   * @param format - The format style ('short', 'long', 'medium', 'relative')
   * @returns string - Formatted date string
   */
  formatDate(format: 'short' | 'long' | 'medium' | 'relative' = 'medium'): string {
    const expenseDate = new Date(this.date);
    const now = new Date();
    
    switch (format) {
      case 'short':
        // Format: MM/DD/YYYY
        return expenseDate.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      
      case 'long':
        // Format: Monday, January 23, 2025
        return expenseDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      case 'medium':
        // Format: Jan 23, 2025
        return expenseDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      
      case 'relative':
        // Format: Today, Yesterday, X days ago, etc.
        return this.getRelativeDateString(expenseDate, now);
      
      default:
        return expenseDate.toLocaleDateString();
    }
  }

  /**
   * Helper function to get relative date string
   */
  private getRelativeDateString(expenseDate: Date, now: Date): string {
    const diffTime = now.getTime() - expenseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if it's today
    const isToday = expenseDate.toDateString() === now.toDateString();
    if (isToday) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = expenseDate.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return 'Yesterday';
    }
    
    // Check if it's tomorrow (for future expenses)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = expenseDate.toDateString() === tomorrow.toDateString();
    if (isTomorrow) {
      return 'Tomorrow';
    }
    
    // Check if it's within this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    if (expenseDate >= startOfWeek && expenseDate <= endOfWeek) {
      return expenseDate.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // For other dates
    if (diffDays > 0) {
      if (diffDays === 1) {
        return '1 day ago';
      } else if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
      }
    } else {
      const futureDays = Math.abs(diffDays);
      if (futureDays === 1) {
        return 'Tomorrow';
      } else if (futureDays < 30) {
        return `In ${futureDays} days`;
      } else if (futureDays < 365) {
        const months = Math.floor(futureDays / 30);
        return months === 1 ? 'In 1 month' : `In ${months} months`;
      } else {
        const years = Math.floor(futureDays / 365);
        return years === 1 ? 'In 1 year' : `In ${years} years`;
      }
    }
  }

  /**
   * Helper function to check if the expense is editable
   * @param allowEditDays - Number of days after creation that editing is allowed (default: 30)
   * @returns boolean - true if the expense can be edited
   */
  isEditable(allowEditDays: number = 30): boolean {
    // If the expense was generated from a recurring expense, it might have different edit rules
    if (this.isGeneratedFromRecurring) {
      // You might want to implement different logic for recurring-generated expenses
      // For example, only allow editing if it's recent or within a certain timeframe
      return this.isWithinEditWindow(allowEditDays);
    }
    
    // For manually created expenses, check if it's within the edit window
    return this.isWithinEditWindow(allowEditDays);
  }

  /**
   * Check if the expense is within the editable time window
   */
  private isWithinEditWindow(allowEditDays: number): boolean {
    const now = new Date();
    const expenseDate = new Date(this.date);
    const diffTime = now.getTime() - expenseDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Allow editing if the expense is not older than the specified days
    return diffDays <= allowEditDays;
  }

  /**
   * Helper function to check if expense is from today
   */
  isToday(): boolean {
    const today = new Date();
    const expenseDate = new Date(this.date);
    
    return expenseDate.toDateString() === today.toDateString();
  }

  /**
   * Helper function to check if expense is from this month
   */
  isThisMonth(): boolean {
    const today = new Date();
    const expenseDate = new Date(this.date);
    
    return expenseDate.getMonth() === today.getMonth() && 
           expenseDate.getFullYear() === today.getFullYear();
  }

  /**
   * Helper function to check if expense is from this year
   */
  isThisYear(): boolean {
    const today = new Date();
    const expenseDate = new Date(this.date);
    
    return expenseDate.getFullYear() === today.getFullYear();
  }

  /**
   * Helper function to get the expense's age in days
   */
  getAgeInDays(): number {
    const now = new Date();
    const expenseDate = new Date(this.date);
    const diffTime = now.getTime() - expenseDate.getTime();
    
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper function to format amount with currency
   * @param currency - Currency symbol (default: '$')
   * @param locale - Locale for formatting (default: 'en-US')
   */
  formatAmount(currency: string = '$', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === '$' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.amount);
  }

  /**
   * Helper function to create a summary string for the expense
   */
  getSummary(): string {
    const amount = this.formatAmount();
    const date = this.formatDate('relative');
    const noteSnippet = this.note ? ` - ${this.note.substring(0, 30)}${this.note.length > 30 ? '...' : ''}` : '';
    
    return `${amount} on ${date}${noteSnippet}`;
  }
}

export default Expense;
