import type { NewBudget } from '@/db/schema/budgets';
import { BudgetService } from '@/db/services/budgetService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

export interface BudgetFormData {
  budgetName: string;
  icon: string;
  color: string;
  income: string;
  period: 'Monthly' | 'Weekly' | 'Custom Range';
  isRecurring: boolean;
  recurringExpenses: RecurringExpense[];
  customStartDate?: Date;
  customEndDate?: Date;
}

export const useBudgetForm = (isEditMode = false, budgetId?: string, initialData?: Partial<BudgetFormData>) => {
  const router = useRouter();

  const [formData, setFormData] = useState<BudgetFormData>({
    budgetName: initialData?.budgetName || '',
    icon: initialData?.icon || 'creditcard.fill',
    color: initialData?.color || '#4A9EFF',
    period: initialData?.period || 'Monthly',
    isRecurring: initialData?.isRecurring ?? true,
    income: initialData?.income || '0.00',
    recurringExpenses: initialData?.recurringExpenses || [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const updateFormData = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for the field being updated
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validate budget name
    if (!formData.budgetName.trim()) {
      errors.budgetName = 'Budget name is required';
    } else if (formData.budgetName.trim().length < 2) {
      errors.budgetName = 'Budget name must be at least 2 characters';
    } else if (formData.budgetName.trim().length > 50) {
      errors.budgetName = 'Budget name must be less than 50 characters';
    }

    // Validate income amount
    const incomeStr = formData.income.replace(/[^0-9.]/g, '');
    const income = parseFloat(incomeStr);
    
    if (incomeStr && isNaN(income)) {
      errors.income = 'Please enter a valid amount';
    } else if (income < 0) {
      errors.income = 'Amount cannot be negative';
    } else if (income > 999999999) {
      errors.income = 'Amount is too large';
    }

    // Validate custom date range
    if (formData.period === 'Custom Range') {
      if (!formData.customStartDate) {
        errors.dateRange = 'Please select a start date';
      } else if (!formData.customEndDate) {
        errors.dateRange = 'Please select an end date';
      } else if (formData.customStartDate >= formData.customEndDate) {
        errors.dateRange = 'End date must be after start date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const transformFormData = (): NewBudget => {
    const incomeStr = formData.income.replace(/[^0-9.]/g, '');
    const income = incomeStr ? parseFloat(incomeStr) : 0;
    
    let startDate = new Date();
    let endDate: Date | undefined;
    
    const periodTypeMap = {
      'Monthly': 'monthly' as const,
      'Weekly': 'weekly' as const,
      'Custom Range': 'custom' as const,
    };

    if (formData.period === 'Custom Range') {
      if (formData.customStartDate) {
        startDate = formData.customStartDate;
      }
      if (formData.customEndDate) {
        endDate = formData.customEndDate;
      }
    } else if (formData.isRecurring) {
      if (formData.period === 'Monthly') {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (formData.period === 'Weekly') {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
      }
    }

    return {
      name: formData.budgetName.trim(),
      icon: formData.icon,
      color: formData.color,
      income: income,
      periodType: periodTypeMap[formData.period],
      startDate,
      endDate: endDate || null,
      isArchived: false,
    };
  };

  const addRecurringExpense = (expense: Omit<RecurringExpense, 'id'>) => {
    const newExpense: RecurringExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    updateFormData('recurringExpenses', [...formData.recurringExpenses, newExpense]);
  };

  const removeRecurringExpense = (id: string) => {
    updateFormData(
      'recurringExpenses',
      formData.recurringExpenses.filter(expense => expense.id !== id)
    );
  };

  const updateIncome = (income: number) => {
    updateFormData('income', income.toFixed(2));
  };

  const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
    if (startDate) {
      updateFormData('customStartDate', startDate);
    }
    if (endDate) {
      updateFormData('customEndDate', endDate);
    }
  };

  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const budgetData = transformFormData();
      
      let result;
      if (isEditMode && budgetId) {
        // Update existing budget
        result = await BudgetService.update(budgetId, budgetData);
        
        Alert.alert(
          'Success!',
          `Budget "${result?.name}" updated successfully.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // Create new budget
        result = await BudgetService.create(budgetData);
        
        Alert.alert(
          'Success!',
          `Budget "${result.name}" created successfully.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
      
      console.log(`Budget ${isEditMode ? 'updated' : 'created'} successfully:`, result);
      
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} budget:`, error);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} budget. Please try again.`;
      
      if (error instanceof Error) {
        if (error.message.includes('UNIQUE constraint')) {
          errorMessage = 'A budget with this name already exists.';
        } else if (error.message.includes('NOT NULL constraint')) {
          errorMessage = 'Please fill in all required fields.';
        }
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    validationErrors,
    isLoading,
    addRecurringExpense,
    removeRecurringExpense,
    updateIncome,
    handleDateRangeChange,
    submitForm,
    validateForm,
  };
};
