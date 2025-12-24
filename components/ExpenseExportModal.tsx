import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExpenseExport } from '@/hooks/useExpenseExport';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ExpenseExportModalProps {
  visible: boolean;
  onClose: () => void;
  budgetId?: string;
}

export const ExpenseExportModal: React.FC<ExpenseExportModalProps> = ({
  visible,
  onClose,
  budgetId,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    isExporting,
    exportToCSV,
    exportCurrentMonth,
    exportLastMonth,
    exportCurrentYear,
    exportSummaryByCategory,
    exportSummaryByBudget,
    error,
  } = useExpenseExport();

  const colors = {
    background: isDark ? '#1A1B1F' : '#FFFFFF',
    cardBackground: isDark ? '#2A2D32' : '#F5F5F5',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#9BA1A6' : '#666666',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    orange: '#FF8A4A',
    purple: '#9B59B6',
    overlay: 'rgba(0, 0, 0, 0.5)',
  };

  const exportOptions = [
    {
      title: 'All Expenses',
      subtitle: 'Export all expenses with full details',
      icon: 'doc.text.fill',
      color: colors.primaryBlue,
      onPress: () => exportToCSV(budgetId ? { budgetId } : {}),
    },
    {
      title: 'Current Month',
      subtitle: 'Export expenses from this month',
      icon: 'calendar.fill',
      color: colors.green,
      onPress: exportCurrentMonth,
    },
    {
      title: 'Last Month',
      subtitle: 'Export expenses from last month',
      icon: 'calendar.badge.clock.fill',
      color: colors.orange,
      onPress: exportLastMonth,
    },
    {
      title: 'Current Year',
      subtitle: 'Export expenses from this year',
      icon: 'calendar.circle.fill',
      color: colors.purple,
      onPress: exportCurrentYear,
    },
    {
      title: 'Summary by Category',
      subtitle: 'Export spending summary grouped by category',
      icon: 'chart.pie.fill',
      color: colors.primaryBlue,
      onPress: () => exportSummaryByCategory(budgetId ? { budgetId } : {}),
    },
    {
      title: 'Summary by Budget',
      subtitle: 'Export spending summary grouped by budget',
      icon: 'chart.bar.fill',
      color: colors.green,
      onPress: () => exportSummaryByBudget(),
    },
  ];

  const handleExportPress = async (onPress: () => Promise<void>) => {
    try {
      await onPress();
      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert(
        'Export Error',
        'Failed to export expenses. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

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
            <Text style={[styles.title, { color: colors.text }]}>Export Expenses</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isExporting}
            >
              <IconSymbol name="xmark" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          {/* Export Options */}
          <View style={styles.content}>
            {exportOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.cardBackground },
                  isExporting && styles.optionCardDisabled,
                ]}
                onPress={() => handleExportPress(option.onPress)}
                disabled={isExporting}
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
                {isExporting ? (
                  <ActivityIndicator size="small" color={option.color} />
                ) : (
                  <IconSymbol name="chevron.right" size={16} color={colors.subText} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Loading State */}
          {isExporting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primaryBlue} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Exporting expenses...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: '#FF6B6B20' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF6B6B" />
              <Text style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</Text>
            </View>
          )}

          {/* Info */}
          <View style={[styles.infoContainer, { backgroundColor: colors.primaryBlue + '10' }]}>
            <IconSymbol name="info.circle.fill" size={16} color={colors.primaryBlue} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Exported files include: Date, Amount, Category, Budget, Account, and Notes
            </Text>
          </View>
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
    maxHeight: '80%',
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
    padding: 20,
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
});
