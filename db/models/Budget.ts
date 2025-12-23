import Realm from 'realm';

export type PeriodType = 'monthly' | 'weekly' | 'custom' | 'noEndDate';

export class Budget extends Realm.Object<Budget> {
  id!: string;
  name!: string;
  icon!: string;
  color!: string;
  limitAmount!: number | null;
  periodType!: PeriodType;
  startDate!: Date;
  endDate!: Date | null;
  isArchived!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Budget',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      icon: 'string',
      color: 'string',
      limitAmount: 'double?',
      periodType: 'string',
      startDate: 'date',
      endDate: 'date?',
      isArchived: { type: 'bool', default: false },
      createdAt: 'date',
      updatedAt: 'date',
    },
  };

  /**
   * Helper function to determine if the budget is currently active
   * A budget is active if:
   * - It's not archived
   * - The current date is after or equal to the start date
   * - For budgets with end dates: the current date is before or equal to the end date
   * - For 'noEndDate' period type: no end date restriction
   */
  isActive(): boolean {
    if (this.isArchived) {
      return false;
    }

    const now = new Date();
    const startDate = new Date(this.startDate);
    
    // Check if current date is after or equal to start date
    if (now < startDate) {
      return false;
    }

    // For budgets with no end date, they're active if not archived and started
    if (this.periodType === 'noEndDate' || !this.endDate) {
      return true;
    }

    const endDate = new Date(this.endDate);
    // Check if current date is before or equal to end date
    return now <= endDate;
  }

  /**
   * Helper function to get the remaining days in the budget period
   * Returns null for 'noEndDate' period type or if no end date is set
   */
  getRemainingDays(): number | null {
    if (this.periodType === 'noEndDate' || !this.endDate) {
      return null;
    }

    const now = new Date();
    const endDate = new Date(this.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return Math.max(0, daysDiff);
  }

  /**
   * Helper function to get the total days in the budget period
   * Returns null for 'noEndDate' period type or if no end date is set
   */
  getTotalDays(): number | null {
    if (this.periodType === 'noEndDate' || !this.endDate) {
      return null;
    }

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return Math.max(1, daysDiff);
  }

  /**
   * Helper function to get the progress percentage of the budget period
   * Returns null for 'noEndDate' period type or if no end date is set
   */
  getPeriodProgress(): number | null {
    const totalDays = this.getTotalDays();
    const remainingDays = this.getRemainingDays();

    if (totalDays === null || remainingDays === null) {
      return null;
    }

    const elapsedDays = totalDays - remainingDays;
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  }
}

export default Budget;
