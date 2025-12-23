import Realm from 'realm';

export type FrequencyType = 'monthly' | 'weekly' | 'yearly' | 'custom';

export class RecurringExpense extends Realm.Object<RecurringExpense> {
  id!: string;
  budgetId!: string;
  name!: string;
  amount!: number;
  frequency!: FrequencyType;
  dueDay!: number | null;
  startDate!: Date;
  endDate!: Date | null;
  accountId!: string | null;
  autoAdd!: boolean;
  isActive!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'RecurringExpense',
    primaryKey: 'id',
    properties: {
      id: 'string',
      budgetId: 'string',
      name: 'string',
      amount: 'double',
      frequency: 'string',
      dueDay: 'int?',
      startDate: 'date',
      endDate: 'date?',
      accountId: 'string?',
      autoAdd: { type: 'bool', default: false },
      isActive: { type: 'bool', default: true },
    },
  };

  /**
   * Helper function to check if the recurring expense is due on a given date
   * @param checkDate - The date to check against
   * @returns boolean - true if the expense is due on the given date
   */
  isDueOnDate(checkDate: Date): boolean {
    if (!this.isActive) {
      return false;
    }

    const startDate = new Date(this.startDate);
    const endDate = this.endDate ? new Date(this.endDate) : null;
    
    // Check if the check date is before the start date
    if (checkDate < startDate) {
      return false;
    }

    // Check if the check date is after the end date (if end date exists)
    if (endDate && checkDate > endDate) {
      return false;
    }

    // Check based on frequency
    switch (this.frequency) {
      case 'monthly':
        return this.isMonthlyDue(checkDate);
      
      case 'weekly':
        return this.isWeeklyDue(checkDate);
      
      case 'yearly':
        return this.isYearlyDue(checkDate);
      
      case 'custom':
        return this.isCustomDue(checkDate);
      
      default:
        return false;
    }
  }

  /**
   * Check if expense is due for monthly frequency
   */
  private isMonthlyDue(checkDate: Date): boolean {
    if (this.dueDay === null) {
      return false;
    }

    const checkDay = checkDate.getDate();
    const daysInMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();
    
    // Handle cases where dueDay is greater than days in current month (e.g., 31st in February)
    const effectiveDueDay = Math.min(this.dueDay, daysInMonth);
    
    return checkDay === effectiveDueDay;
  }

  /**
   * Check if expense is due for weekly frequency
   */
  private isWeeklyDue(checkDate: Date): boolean {
    if (this.dueDay === null) {
      return false;
    }

    // dueDay represents day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const checkDayOfWeek = checkDate.getDay();
    return checkDayOfWeek === this.dueDay;
  }

  /**
   * Check if expense is due for yearly frequency
   */
  private isYearlyDue(checkDate: Date): boolean {
    const startDate = new Date(this.startDate);
    const checkMonth = checkDate.getMonth();
    const checkDay = checkDate.getDate();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();

    // Check if it's the same month and day as the start date
    if (checkMonth === startMonth) {
      // Handle leap year edge case for February 29th
      if (startMonth === 1 && startDay === 29) { // February 29th
        const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const checkYear = checkDate.getFullYear();
        
        if (!isLeapYear(checkYear)) {
          // If current year is not a leap year, use February 28th
          return checkDay === 28;
        }
      }
      
      return checkDay === startDay;
    }
    
    return false;
  }

  /**
   * Check if expense is due for custom frequency
   * For custom frequency, you might want to implement your own logic
   * This is a placeholder implementation
   */
  private isCustomDue(checkDate: Date): boolean {
    // Placeholder for custom frequency logic
    // You can implement custom logic based on your requirements
    // For example, every X days, specific dates, etc.
    
    // Default implementation: check if it matches the start date's day of month
    if (this.dueDay !== null) {
      return this.isMonthlyDue(checkDate);
    }
    
    return false;
  }

  /**
   * Get the next due date after the given date
   * @param fromDate - The date to calculate from (defaults to today)
   * @returns Date | null - The next due date or null if no future due date
   */
  getNextDueDate(fromDate: Date = new Date()): Date | null {
    if (!this.isActive) {
      return null;
    }

    const startDate = new Date(this.startDate);
    const endDate = this.endDate ? new Date(this.endDate) : null;
    
    // If fromDate is before start date, return start date if it matches the pattern
    if (fromDate < startDate) {
      if (this.isDueOnDate(startDate)) {
        return startDate;
      }
      fromDate = new Date(startDate);
    }

    // Search for the next due date (limit search to avoid infinite loops)
    const maxDaysToCheck = this.frequency === 'yearly' ? 400 : 60;
    let checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + 1); // Start from tomorrow
    
    for (let i = 0; i < maxDaysToCheck; i++) {
      if (endDate && checkDate > endDate) {
        return null;
      }
      
      if (this.isDueOnDate(checkDate)) {
        return new Date(checkDate);
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return null;
  }

  /**
   * Get all due dates within a date range
   * @param startRange - Start of the date range
   * @param endRange - End of the date range
   * @returns Date[] - Array of due dates within the range
   */
  getDueDatesInRange(startRange: Date, endRange: Date): Date[] {
    const dueDates: Date[] = [];
    const checkDate = new Date(startRange);
    
    while (checkDate <= endRange) {
      if (this.isDueOnDate(checkDate)) {
        dueDates.push(new Date(checkDate));
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return dueDates;
  }
}

export default RecurringExpense;
