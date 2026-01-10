import type { Budget } from '@/db/schema/budgets';
import { BudgetPeriodService } from '@/db/services/budgetPeriodService';
import { BudgetService } from '@/db/services/budgetService';
import { useCallback, useEffect, useState } from 'react';

interface PendingIncome {
  budget: Budget;
  year: number;
  month: number;
  currentAmount: number;
}

export const useMonthlyIncomeNotification = () => {
  const [pendingIncomes, setPendingIncomes] = useState<PendingIncome[]>([]);
  const [currentIncomeModal, setCurrentIncomeModal] =
    useState<PendingIncome | null>(null);

  // Check for budgets that need income updates
  const checkForPendingIncomes = useCallback(
    async (year: number, month: number) => {
      try {
        // Get all active budgets
        const budgets = await BudgetService.getActive();
        const pending: PendingIncome[] = [];

        for (const budget of budgets) {
          // Get or create period for this budget
          const period = await BudgetPeriodService.getOrCreatePeriod(
            budget.id,
            year,
            month
          );

          // Check if we need to notify user (new month and not yet notified)
          if (!period.isNotified) {
            pending.push({
              budget,
              year,
              month,
              currentAmount: period.limitAmount,
            });
          }
        }

        setPendingIncomes(pending);

        // Show first pending income if any
        if (pending.length > 0) {
          setCurrentIncomeModal(pending[0]);
        }
      } catch (error) {
        console.error('Failed to check for pending incomes:', error);
      }
    },
    []
  );

  // Update income for a budget
  const updateIncome = useCallback(
    async (budgetId: string, amount: number) => {
      if (!currentIncomeModal) return;

      try {
        await BudgetPeriodService.updateLimitAmount(
          budgetId,
          currentIncomeModal.year,
          currentIncomeModal.month,
          amount
        );

        // Remove current from pending list
        const remaining = pendingIncomes.filter(
          (p) => p.budget.id !== budgetId
        );
        setPendingIncomes(remaining);

        // Show next pending income or close modal
        if (remaining.length > 0) {
          setCurrentIncomeModal(remaining[0]);
        } else {
          setCurrentIncomeModal(null);
        }
      } catch (error) {
        console.error('Failed to update income:', error);
        throw error;
      }
    },
    [currentIncomeModal, pendingIncomes]
  );

  // Skip current income update
  const skipIncome = useCallback(async () => {
    if (!currentIncomeModal) return;

    try {
      // Mark as notified even though user skipped
      await BudgetPeriodService.markAsNotified(
        currentIncomeModal.budget.id,
        currentIncomeModal.year,
        currentIncomeModal.month
      );

      // Remove current from pending list
      const remaining = pendingIncomes.filter(
        (p) => p.budget.id !== currentIncomeModal.budget.id
      );
      setPendingIncomes(remaining);

      // Show next pending income or close modal
      if (remaining.length > 0) {
        setCurrentIncomeModal(remaining[0]);
      } else {
        setCurrentIncomeModal(null);
      }
    } catch (error) {
      console.error('Failed to skip income:', error);
    }
  }, [currentIncomeModal, pendingIncomes]);

  // Close modal
  const closeModal = useCallback(() => {
    if (currentIncomeModal) {
      skipIncome();
    }
  }, [currentIncomeModal, skipIncome]);

  // Check for monthly notifications when component mounts or date changes
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Only check on the 1st of the month or first load
    const isFirstOfMonth = now.getDate() === 1;

    if (isFirstOfMonth) {
      checkForPendingIncomes(year, month);
    }
  }, [checkForPendingIncomes]);

  return {
    currentIncomeModal,
    pendingIncomes,
    updateIncome,
    closeModal,
    checkForPendingIncomes,
  };
};
