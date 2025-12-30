import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RecurringExpense } from '@/db/schema/recurringExpenses';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RecurringManagerProps {
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
    background: string;
    red: string;
  };
}

const RecurringManager: React.FC<RecurringManagerProps> = ({ colors }) => {
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load recurring expenses
  const loadRecurringExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const expenses = await RecurringExpenseService.getActive();
      setRecurringExpenses(expenses);
    } catch (err) {
      console.error('Failed to load recurring expenses:', err);
      setError('Failed to load recurring expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecurringExpenses();
  }, [loadRecurringExpenses]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecurringExpenses();
    }, [loadRecurringExpenses])
  );

  const handleAddRecurring = () => {
    router.push('/add-recurring');
  };

  const handleRecurringPress = (recurringExpense: RecurringExpense) => {
    // TODO: Navigate to recurring expense details/edit screen
    console.log('Recurring expense pressed:', recurringExpense.name);
  };

  const formatFrequency = (frequency: string): string => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return frequency;
    }
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNextDueDate = (nextDueDate: Date | null): string => {
    if (!nextDueDate) return 'No due date';

    const now = new Date();
    const timeDiff = nextDueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return 'Overdue';
    } else if (daysDiff === 0) {
      return 'Due today';
    } else if (daysDiff === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysDiff} days`;
    }
  };

  const renderRecurringItem = (item: RecurringExpense) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.recurringItem,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
      onPress={() => handleRecurringPress(item)}>
      <View style={styles.recurringLeft}>
        <View style={[styles.recurringIcon, { backgroundColor: '#E74C3C20' }]}>
          <IconSymbol name='repeat' size={20} color='#E74C3C' />
        </View>
        <View style={styles.recurringDetails}>
          <View style={styles.recurringNameRow}>
            <Text style={[styles.recurringName, { color: colors.text }]}>
              {item.name}
            </Text>
            {!item.budgetId && (
              <View
                style={[
                  styles.unassignedBadge,
                  { backgroundColor: colors.subText + '20' },
                ]}>
                <Text
                  style={[styles.unassignedText, { color: colors.subText }]}>
                  Unassigned
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.recurringFrequency, { color: colors.subText }]}>
            {formatFrequency(item.frequency)} •{' '}
            {formatNextDueDate(item.nextDueDate)}
          </Text>
        </View>
      </View>

      <View style={styles.recurringRight}>
        <Text style={[styles.recurringAmount, { color: colors.text }]}>
          {formatAmount(item.amount)}
        </Text>
        <IconSymbol name='chevron.right' size={16} color={colors.subText} />
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Loading recurring expenses...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: colors.primaryBlue },
            ]}
            onPress={loadRecurringExpenses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (recurringExpenses.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol
            name='repeat'
            size={48}
            color={colors.subText}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Recurring Expenses
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
            Set up recurring expenses to automatically track regular payments
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {recurringExpenses.map(renderRecurringItem)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>
            Recurring Expenses
          </Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            {recurringExpenses.length} active
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primaryBlue }]}
          onPress={handleAddRecurring}>
          <IconSymbol name='plus' size={20} color='#FFFFFF' />
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    gap: 12,
  },
  recurringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  recurringLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurringDetails: {
    flex: 1,
  },
  recurringNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recurringName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unassignedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  unassignedText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  recurringFrequency: {
    fontSize: 14,
    fontWeight: '400',
  },
  recurringRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecurringManager;
