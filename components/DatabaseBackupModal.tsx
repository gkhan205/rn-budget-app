import { IconSymbol } from '@/components/ui/icon-symbol';
import { useDatabaseBackup } from '@/hooks/useDatabaseBackup';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DatabaseBackupModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DatabaseBackupModal: React.FC<DatabaseBackupModalProps> = ({
  visible,
  onClose,
}) => {
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  
  const {
    isExporting,
    isImporting,
    isValidating,
    exportBackup,
    importBackup,
    getDatabaseStats,
    error,
    lastOperation,
  } = useDatabaseBackup();

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    orange: '#FF8A4A',
    red: '#E74C3C',
    purple: '#9B59B6',
    overlay: 'rgba(0, 0, 0, 0.5)',
  };

  // Load database stats when modal opens
  useEffect(() => {
    const loadStats = async () => {
      if (visible) {
        try {
          const stats = await getDatabaseStats();
          setDatabaseStats(stats);
        } catch (error) {
          console.warn('Failed to load database stats:', error);
        }
      }
    };
    
    loadStats();
  }, [visible, getDatabaseStats]);

  const handleExportBackup = async () => {
    try {
      await exportBackup();
      // Refresh stats after export
      try {
        const stats = await getDatabaseStats();
        setDatabaseStats(stats);
      } catch (error) {
        console.warn('Failed to refresh database stats:', error);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImportBackup = async (overwrite: boolean) => {
    try {
      await importBackup(overwrite);
      // Refresh stats after import
      try {
        const stats = await getDatabaseStats();
        setDatabaseStats(stats);
      } catch (error) {
        console.warn('Failed to refresh database stats:', error);
      }
      // Close modal after successful import
      if (!error && !isImporting) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleImportWithMerge = () => {
    Alert.alert(
      'Import Mode',
      'Choose how to import the backup:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Merge',
          onPress: () => handleImportBackup(false),
          style: 'default',
        },
        {
          text: 'Replace All',
          onPress: () => handleImportBackup(true),
          style: 'destructive',
        },
      ]
    );
  };

  const isLoading = isExporting || isImporting || isValidating;

  const backupOptions = [
    {
      title: 'Export Full Database',
      subtitle: 'Create a complete backup of all your data',
      icon: 'square.and.arrow.up.fill',
      color: colors.primaryBlue,
      onPress: handleExportBackup,
      disabled: isLoading,
    },
    {
      title: 'Import Database',
      subtitle: 'Restore data from a backup file (with options)',
      icon: 'square.and.arrow.down.fill',
      color: colors.green,
      onPress: handleImportWithMerge,
      disabled: isLoading,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Database Backup</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <IconSymbol name="xmark" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Database Statistics */}
            <View style={[styles.statsContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.statsHeader}>
                <IconSymbol name="chart.bar.fill" size={20} color={colors.primaryBlue} />
                <Text style={[styles.statsTitle, { color: colors.text }]}>Database Statistics</Text>
              </View>
              
              {databaseStats ? (
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{databaseStats.accounts}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Accounts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{databaseStats.budgets}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Budgets</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{databaseStats.expenses}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Expenses</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{databaseStats.categories}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Categories</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{databaseStats.recurringExpenses}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Recurring</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primaryBlue }]}>{databaseStats.total}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Total Records</Text>
                  </View>
                </View>
              ) : (
                <ActivityIndicator size="small" color={colors.primaryBlue} />
              )}
            </View>

            {/* Backup Options */}
            <View style={styles.optionsContainer}>
              {backupOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    { backgroundColor: colors.cardBackground },
                    option.disabled && styles.optionCardDisabled,
                  ]}
                  onPress={option.onPress}
                  disabled={option.disabled}
                >
                  <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                    <IconSymbol name={option.icon as any} size={24} color={option.color} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.subText }]}>
                      {option.subtitle}
                    </Text>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={option.color} />
                  ) : (
                    <IconSymbol name="chevron.right" size={16} color={colors.subText} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Status */}
            {(lastOperation || error || isLoading) && (
              <View style={[styles.statusContainer, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.statusHeader}>
                  <IconSymbol 
                    name={error ? "exclamationmark.triangle.fill" : isLoading ? "arrow.clockwise" : "checkmark.circle.fill"} 
                    size={16} 
                    color={error ? colors.red : isLoading ? colors.orange : colors.green} 
                  />
                  <Text style={[styles.statusTitle, { color: colors.text }]}>Status</Text>
                </View>
                
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primaryBlue} />
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {lastOperation || 'Processing...'}
                    </Text>
                  </View>
                )}
                
                {error && (
                  <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
                )}
                
                {!isLoading && !error && lastOperation && (
                  <Text style={[styles.successText, { color: colors.green }]}>{lastOperation}</Text>
                )}
              </View>
            )}

            {/* Important Notes */}
            <View style={[styles.infoContainer, { backgroundColor: colors.orange + '10' }]}>
              <IconSymbol name="info.circle.fill" size={16} color={colors.orange} />
              <View style={styles.infoText}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Important Notes:</Text>
                <Text style={[styles.infoSubtitle, { color: colors.subText }]}>
                  • Export creates a complete JSON backup of all tables{'\n'}
                  • Import can merge with existing data or replace all data{'\n'}
                  • Replace mode permanently deletes current data{'\n'}
                  • Always keep multiple backup copies in safe locations
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
  },
  successText: {
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
