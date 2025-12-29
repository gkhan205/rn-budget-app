// TODO: SQLite Budget Model
// This will be replaced with SQLite table schema when SQLite is implemented

export type PeriodType = 'monthly' | 'weekly' | 'custom' | 'noEndDate';

/**
 * Budget interface for TypeScript type safety
 * TODO: Convert to SQLite table schema
 */
export interface Budget {
  id: string;
  name: string;
  icon: string;
  color: string;
  income: number; // Monthly/period income for the budget
  periodType: PeriodType;
  startDate: Date;
  endDate: Date | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Budget database operations and business logic
 * TODO: Implement with SQLite queries
 */
export class BudgetService {
  /**
   * Helper function to determine if the budget is currently active
   * TODO: Could be implemented as SQLite query or helper function
   */
  static isActive(budget: Budget): boolean {
    if (budget.isArchived) {
      return false;
    }

    const now = new Date();
    const startDate = new Date(budget.startDate);
    
    // Check if current date is after or equal to start date
    if (now < startDate) {
      return false;
    }

    // For budgets with no end date, they're active if not archived and started
    if (budget.periodType === 'noEndDate' || !budget.endDate) {
      return true;
    }

    const endDate = new Date(budget.endDate);
    // Check if current date is before or equal to end date
    return now <= endDate;
  }

  /**
   * Helper function to get the remaining days in the budget period
   * Returns null for 'noEndDate' period type or if no end date is set
   */
  static getRemainingDays(budget: Budget): number | null {
    if (budget.periodType === 'noEndDate' || !budget.endDate) {
      return null;
    }

    const now = new Date();
    const endDate = new Date(budget.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return Math.max(0, daysDiff);
  }

  /**
   * Helper function to get the total days in the budget period
   * Returns null for 'noEndDate' period type or if no end date is set
   */
  static getTotalDays(budget: Budget): number | null {
    if (budget.periodType === 'noEndDate' || !budget.endDate) {
      return null;
    }

    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return Math.max(1, daysDiff);
  }

  /**
   * Helper function to get the progress percentage of the budget period
   * Returns null for 'noEndDate' period type or if no end date is set
   */
  static getPeriodProgress(budget: Budget): number | null {
    const totalDays = this.getTotalDays(budget);
    const remainingDays = this.getRemainingDays(budget);

    if (totalDays === null || remainingDays === null) {
      return null;
    }

    const elapsedDays = totalDays - remainingDays;
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  }
}

export default Budget;
