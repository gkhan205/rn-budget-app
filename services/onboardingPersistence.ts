import { AccountService } from '@/db/services/accountService';
import { AppSettingsService } from '@/db/services/appSettingsService';
import { BudgetService } from '@/db/services/budgetService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import type { OnboardingState } from '@/state/onboardingStore';
import { router } from 'expo-router';

/**
 * Service to persist onboarding data to SQLite database
 * This service takes the temporary onboarding state and saves it to the database
 */
export class OnboardingPersistenceService {
  /**
   * Save all onboarding data to the database and complete onboarding
   * This should be called when the user completes the onboarding flow
   */
  static async saveOnboardingData(onboardingState: OnboardingState): Promise<void> {
    try {
      console.log('Starting onboarding data persistence...');
      
      // 1. Save accounts first (they might be referenced by budgets/expenses)
      const createdAccounts = await this.saveAccounts(onboardingState);
      console.log(`Created ${createdAccounts.length} accounts`);
      
      // 2. Save the first budget
      const createdBudget = await this.saveBudget(onboardingState);
      console.log('Created budget:', createdBudget?.name);
      
      // 3. Save recurring items (if any)
      if (createdBudget && onboardingState.recurringItems.length > 0) {
        const createdRecurringItems = await this.saveRecurringItems(
          onboardingState, 
          createdBudget.id
        );
        console.log(`Created ${createdRecurringItems.length} recurring items`);
      }
      
      // 4. Mark onboarding as complete
      await this.markOnboardingComplete(onboardingState);
      console.log('✅ Onboarding marked as complete');
      
      console.log('✅ Onboarding data saved successfully');
      
    } catch (error) {
      console.error('❌ Failed to save onboarding data:', error);
      throw new Error('Failed to save onboarding data. Please try again.');
    }
  }

  /**
   * Complete onboarding and navigate to budgets screen
   */
  static async completeOnboarding(onboardingState: OnboardingState): Promise<void> {
    try {
      // Save all onboarding data to database
      await this.saveOnboardingData(onboardingState);
      
      // Navigate to budgets screen
      router.replace('/(tabs)/budgets');
      
      console.log('🎉 Onboarding completed successfully!');
      
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Save selected accounts to the database
   */
  private static async saveAccounts(onboardingState: OnboardingState) {
    const createdAccounts = [];
    
    for (const account of onboardingState.selectedAccounts) {
      try {
        const newAccount = await AccountService.create({
          name: account.name,
          type: account.type,
          balance: account.initialBalance,
          color: account.color,
          icon: account.icon,
        });
        
        createdAccounts.push(newAccount);
      } catch (error) {
        console.error(`Failed to create account ${account.name}:`, error);
        throw error;
      }
    }
    
    return createdAccounts;
  }
  
  /**
   * Save the first budget to the database
   */
  private static async saveBudget(onboardingState: OnboardingState) {
    if (!onboardingState.firstBudget) {
      return null;
    }
    
    const budget = onboardingState.firstBudget;
    
    try {
      const newBudget = await BudgetService.create({
        name: budget.name,
        icon: budget.icon,
        color: budget.color,
        limitAmount: budget.limitAmount,
        periodType: budget.periodType,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
      
      return newBudget;
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  }
  
  /**
   * Save recurring items to the database
   */
  private static async saveRecurringItems(
    onboardingState: OnboardingState,
    budgetId: string
  ) {
    const createdItems = [];
    
    for (const item of onboardingState.recurringItems) {
      try {
        // Find the first account to associate with recurring items
        // In a more complex setup, users might choose specific accounts per item
        const firstAccountId = onboardingState.selectedAccounts[0]?.id;
        
        const newRecurringItem = await RecurringExpenseService.create({
          budgetId,
          accountId: firstAccountId, // Optional - users can update later
          name: item.name,
          amount: item.amount,
          frequency: item.frequency,
          startDate: item.startDate,
          nextDueDate: this.calculateNextDueDate(item.startDate, item.frequency),
          endDate: item.endDate,
          category: item.category, // Legacy field for backward compatibility
          description: item.description,
          autoAdd: item.autoAdd,
          isActive: true,
        });
        
        createdItems.push(newRecurringItem);
      } catch (error) {
        console.error(`Failed to create recurring item ${item.name}:`, error);
        throw error;
      }
    }
    
    return createdItems;
  }
  
  /**
   * Calculate the next due date for a recurring item based on frequency
   */
  private static calculateNextDueDate(startDate: Date, frequency: string): Date {
    const nextDate = new Date(startDate);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        // Default to monthly if frequency is unknown
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  }

  /**
   * Mark onboarding as complete in app settings
   */
  private static async markOnboardingComplete(onboardingState: OnboardingState): Promise<void> {
    try {
      // Set onboarding_complete flag to true
      await AppSettingsService.setValue('onboarding_complete', 'true', {
        type: 'boolean',
        description: 'Indicates whether the user has completed the onboarding flow',
        category: 'onboarding',
        isSystem: true,
      });

      // Store the selected money style as a preference
      if (onboardingState.moneyStyle) {
        await AppSettingsService.setValue('money_management_style', onboardingState.moneyStyle.id, {
          type: 'string',
          description: 'User\'s preferred money management style',
          category: 'preferences',
          isSystem: false,
        });
      }

      // Store onboarding completion timestamp
      await AppSettingsService.setValue('onboarding_completed_at', new Date().toISOString(), {
        type: 'string',
        description: 'Timestamp when onboarding was completed',
        category: 'onboarding',
        isSystem: true,
      });

      console.log('✅ Onboarding completion status saved to database');
    } catch (error) {
      console.error('❌ Failed to mark onboarding as complete:', error);
      throw error;
    }
  }
  
  /**
   * Validate onboarding data before saving
   */
  static validateOnboardingData(onboardingState: OnboardingState): string[] {
    const errors: string[] = [];
    
    // Check if money style is selected
    if (!onboardingState.moneyStyle) {
      errors.push('Money management style must be selected');
    }
    
    // Check if at least one account is added
    if (onboardingState.selectedAccounts.length === 0) {
      errors.push('At least one account must be added');
    }
    
    // Validate account data
    onboardingState.selectedAccounts.forEach((account, index) => {
      if (!account.name.trim()) {
        errors.push(`Account ${index + 1} must have a name`);
      }
      if (typeof account.initialBalance !== 'number') {
        errors.push(`Account ${index + 1} must have a valid initial balance`);
      }
    });
    
    // Check if first budget is created
    if (!onboardingState.firstBudget) {
      errors.push('First budget must be created');
    } else {
      // Validate budget data
      if (!onboardingState.firstBudget.name.trim()) {
        errors.push('Budget must have a name');
      }
      if (!onboardingState.firstBudget.startDate) {
        errors.push('Budget must have a start date');
      }
    }
    
    // Validate recurring items (optional but if present, must be valid)
    onboardingState.recurringItems.forEach((item, index) => {
      if (!item.name.trim()) {
        errors.push(`Recurring item ${index + 1} must have a name`);
      }
      if (typeof item.amount !== 'number' || item.amount <= 0) {
        errors.push(`Recurring item ${index + 1} must have a valid amount`);
      }
      if (!item.startDate) {
        errors.push(`Recurring item ${index + 1} must have a start date`);
      }
    });
    
    return errors;
  }
  
  /**
   * Get a preview of what will be created during onboarding save
   */
  static getOnboardingPreview(onboardingState: OnboardingState) {
    return {
      moneyStyle: onboardingState.moneyStyle?.title || 'Not selected',
      accountCount: onboardingState.selectedAccounts.length,
      accounts: onboardingState.selectedAccounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.initialBalance,
      })),
      budget: onboardingState.firstBudget ? {
        name: onboardingState.firstBudget.name,
        limit: onboardingState.firstBudget.limitAmount,
        period: onboardingState.firstBudget.periodType,
      } : null,
      recurringItemCount: onboardingState.recurringItems.length,
      recurringItems: onboardingState.recurringItems.map(item => ({
        name: item.name,
        amount: item.amount,
        frequency: item.frequency,
      })),
    };
  }
}

/**
 * Helper functions for onboarding status
 */
export const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const setting = await AppSettingsService.getByKey('onboarding_complete');
    return setting?.value === 'true';
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
};

/**
 * Get user's money management style preference
 */
export const getMoneyManagementStyle = async (): Promise<string | null> => {
  try {
    const setting = await AppSettingsService.getByKey('money_management_style');
    return setting?.value || null;
  } catch (error) {
    console.error('Failed to get money management style:', error);
    return null;
  }
};

/**
 * Reset onboarding status (for testing purposes)
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AppSettingsService.setValue('onboarding_complete', 'false', {
      type: 'boolean',
      description: 'Indicates whether the user has completed the onboarding flow',
      category: 'onboarding',
      isSystem: true,
    });
    console.log('✅ Onboarding status reset');
  } catch (error) {
    console.error('Failed to reset onboarding status:', error);
    throw error;
  }
};

/**
 * Hook to use onboarding persistence with error handling
 */
export const useOnboardingPersistence = () => {
  const saveOnboarding = async (onboardingState: OnboardingState) => {
    // Validate data first
    const validationErrors = OnboardingPersistenceService.validateOnboardingData(onboardingState);
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Save to database
    await OnboardingPersistenceService.saveOnboardingData(onboardingState);
  };

  const completeOnboarding = async (onboardingState: OnboardingState) => {
    // Validate data first
    const validationErrors = OnboardingPersistenceService.validateOnboardingData(onboardingState);
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Complete onboarding (save data and navigate)
    await OnboardingPersistenceService.completeOnboarding(onboardingState);
  };
  
  const getPreview = (onboardingState: OnboardingState) => {
    return OnboardingPersistenceService.getOnboardingPreview(onboardingState);
  };
  
  const validate = (onboardingState: OnboardingState) => {
    return OnboardingPersistenceService.validateOnboardingData(onboardingState);
  };
  
  return {
    saveOnboarding,
    completeOnboarding,
    getPreview,
    validate,
  };
};
