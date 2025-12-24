import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert } from 'react-native';
import { ExpenseExportService, type ExportOptions } from '../services/expenseExportService';

export interface UseExpenseExportReturn {
  isExporting: boolean;
  exportToCSV: (options?: ExportOptions) => Promise<void>;
  exportCurrentMonth: () => Promise<void>;
  exportLastMonth: () => Promise<void>;
  exportCurrentYear: () => Promise<void>;
  exportSummaryByCategory: (options?: ExportOptions) => Promise<void>;
  exportSummaryByBudget: (options?: ExportOptions) => Promise<void>;
  error: string | null;
}

/**
 * Hook for exporting expenses to CSV files
 */
export const useExpenseExport = (): UseExpenseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSVFile = async (
    csvContent: string,
    fileName: string,
    successMessage: string
  ): Promise<void> => {
    try {
      setIsExporting(true);
      setError(null);

      // Create file in the document directory
      const file = new File(Paths.document, fileName);

      // Write CSV content to file
      await file.write(csvContent);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Share the file
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
        });
      } else {
        // Fallback: show alert with file location
        Alert.alert(
          'Export Complete',
          `${successMessage}\n\nFile saved to: ${file.uri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Export failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Export failed: ${errorMessage}`);
      
      Alert.alert(
        'Export Failed',
        `Unable to export expenses: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (options: ExportOptions = {}): Promise<void> => {
    const csvContent = await ExpenseExportService.exportExpensesToCSV(options);
    const fileName = ExpenseExportService.getExportFileName(options);
    const successMessage = 'Expenses exported successfully!';
    
    await exportCSVFile(csvContent, fileName, successMessage);
  };

  const exportCurrentMonth = async (): Promise<void> => {
    const csvContent = await ExpenseExportService.exportCurrentMonthToCSV();
    const fileName = `expenses_current_month_${new Date().toISOString().split('T')[0]}.csv`;
    const successMessage = 'Current month expenses exported successfully!';
    
    await exportCSVFile(csvContent, fileName, successMessage);
  };

  const exportLastMonth = async (): Promise<void> => {
    const csvContent = await ExpenseExportService.exportLastMonthToCSV();
    const fileName = `expenses_last_month_${new Date().toISOString().split('T')[0]}.csv`;
    const successMessage = 'Last month expenses exported successfully!';
    
    await exportCSVFile(csvContent, fileName, successMessage);
  };

  const exportCurrentYear = async (): Promise<void> => {
    const csvContent = await ExpenseExportService.exportCurrentYearToCSV();
    const fileName = `expenses_current_year_${new Date().getFullYear()}.csv`;
    const successMessage = 'Current year expenses exported successfully!';
    
    await exportCSVFile(csvContent, fileName, successMessage);
  };

  const exportSummaryByCategory = async (options: ExportOptions = {}): Promise<void> => {
    const csvContent = await ExpenseExportService.getExpenseSummaryByCategory(options);
    const fileName = `expense_summary_by_category_${new Date().toISOString().split('T')[0]}.csv`;
    const successMessage = 'Expense summary by category exported successfully!';
    
    await exportCSVFile(csvContent, fileName, successMessage);
  };

  const exportSummaryByBudget = async (options: ExportOptions = {}): Promise<void> => {
    const csvContent = await ExpenseExportService.getExpenseSummaryByBudget(options);
    const fileName = `expense_summary_by_budget_${new Date().toISOString().split('T')[0]}.csv`;
    const successMessage = 'Expense summary by budget exported successfully!';
    
    await exportCSVFile(csvContent, fileName, successMessage);
  };

  return {
    isExporting,
    exportToCSV,
    exportCurrentMonth,
    exportLastMonth,
    exportCurrentYear,
    exportSummaryByCategory,
    exportSummaryByBudget,
    error,
  };
};
