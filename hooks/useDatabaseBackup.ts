import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert } from 'react-native';
import { DatabaseBackupService, type BackupValidationResult, type DatabaseBackup } from '../services/databaseBackupService';

export interface UseDatabaseBackupReturn {
  isExporting: boolean;
  isImporting: boolean;
  isValidating: boolean;
  exportBackup: () => Promise<void>;
  importBackup: (overwrite?: boolean) => Promise<void>;
  validateBackupFile: (fileUri: string) => Promise<BackupValidationResult | null>;
  getDatabaseStats: () => Promise<any>;
  error: string | null;
  lastOperation: string | null;
}

/**
 * Hook for database backup and restore operations
 */
export const useDatabaseBackup = (): UseDatabaseBackupReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<string | null>(null);

  const exportBackup = async (): Promise<void> => {
    try {
      setIsExporting(true);
      setError(null);
      setLastOperation('Exporting database...');

      // Export database
      const backup = await DatabaseBackupService.exportDatabase();
      
      // Convert to JSON string
      const backupJson = JSON.stringify(backup, null, 2);
      
      // Generate file name
      const fileName = DatabaseBackupService.generateBackupFileName();
      
      // Create file
      const file = new File(Paths.document, fileName);
      await file.write(backupJson);

      setLastOperation('Database exported successfully');

      // Share the file
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Database Backup',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Database backup saved to: ${file.uri}`,
          [{ text: 'OK' }]
        );
      }

    } catch (err) {
      console.error('Export failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Export failed: ${errorMessage}`);
      setLastOperation('Export failed');
      
      Alert.alert(
        'Export Failed',
        `Unable to export database: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const validateBackupFile = async (fileUri: string): Promise<BackupValidationResult | null> => {
    try {
      setIsValidating(true);
      setError(null);
      setLastOperation('Validating backup file...');

      // Read the file
      const file = new File(fileUri);
      const fileContent = await file.text();
      
      // Parse JSON
      const backupData = JSON.parse(fileContent);
      
      // Validate the backup
      const validation = DatabaseBackupService.validateBackup(backupData);
      
      setLastOperation(`Validation complete: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      
      return validation;

    } catch (err) {
      console.error('Validation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Validation failed: ${errorMessage}`);
      setLastOperation('Validation failed');
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const importBackup = async (overwrite: boolean = false): Promise<void> => {
    try {
      setIsImporting(true);
      setError(null);
      setLastOperation('Selecting backup file...');

      // Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLastOperation('Import cancelled');
        return;
      }

      const selectedFile = result.assets[0];
      setLastOperation('Reading backup file...');

      // Validate the backup first
      const validation = await validateBackupFile(selectedFile.uri);
      
      if (!validation) {
        setError('Failed to validate backup file');
        setLastOperation('Import failed - validation error');
        return;
      }

      if (!validation.isValid) {
        Alert.alert(
          'Invalid Backup File',
          `The selected file is not a valid backup:\n\n${validation.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
        setLastOperation('Import cancelled - invalid backup');
        return;
      }

      // Show validation warnings if any
      if (validation.warnings.length > 0) {
        const proceed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Backup Warnings',
            `The backup file has some warnings:\n\n${validation.warnings.join('\n')}\n\nDo you want to continue?`,
            [
              { text: 'Cancel', onPress: () => resolve(false) },
              { text: 'Continue', onPress: () => resolve(true) },
            ]
          );
        });

        if (!proceed) {
          setLastOperation('Import cancelled by user');
          return;
        }
      }

      // Confirm overwrite if database has data
      if (overwrite) {
        const stats = await DatabaseBackupService.getDatabaseStats();
        if (stats.total > 0) {
          const confirmOverwrite = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Confirm Overwrite',
              `This will permanently delete all existing data (${stats.total} records) and replace it with the backup data (${Object.values(validation.recordCounts).reduce((a, b) => a + b, 0)} records).\n\nThis action cannot be undone. Are you sure?`,
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Delete & Import', style: 'destructive', onPress: () => resolve(true) },
              ]
            );
          });

          if (!confirmOverwrite) {
            setLastOperation('Import cancelled by user');
            return;
          }
        }
      }

      setLastOperation('Importing backup data...');

      // Read and parse the backup file again
      const file = new File(selectedFile.uri);
      const fileContent = await file.text();
      const backupData: DatabaseBackup = JSON.parse(fileContent);

      // Import the backup
      const importResult = await DatabaseBackupService.importDatabase(backupData, overwrite);

      if (importResult.success) {
        setLastOperation(importResult.message);
        Alert.alert(
          'Import Successful',
          `${importResult.message}\n\nImported records:\n` +
          `• Accounts: ${importResult.importedCounts.accounts}\n` +
          `• Budgets: ${importResult.importedCounts.budgets}\n` +
          `• Categories: ${importResult.importedCounts.categories}\n` +
          `• Expenses: ${importResult.importedCounts.expenses}\n` +
          `• Recurring: ${importResult.importedCounts.recurringExpenses}\n` +
          `• Settings: ${importResult.importedCounts.appSettings}`,
          [{ text: 'OK' }]
        );
      } else {
        setError(importResult.message);
        setLastOperation('Import failed');
        Alert.alert(
          'Import Failed',
          `${importResult.message}\n\nErrors:\n${importResult.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      }

    } catch (err) {
      console.error('Import failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Import failed: ${errorMessage}`);
      setLastOperation('Import failed');
      
      Alert.alert(
        'Import Failed',
        `Unable to import backup: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsImporting(false);
    }
  };

  const getDatabaseStats = async () => {
    try {
      setError(null);
      return await DatabaseBackupService.getDatabaseStats();
    } catch (err) {
      console.error('Failed to get database stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to get database stats: ${errorMessage}`);
      throw err;
    }
  };

  return {
    isExporting,
    isImporting,
    isValidating,
    exportBackup,
    importBackup,
    validateBackupFile,
    getDatabaseStats,
    error,
    lastOperation,
  };
};
