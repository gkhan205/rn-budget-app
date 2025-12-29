import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RecurringExpense } from '@/db/schema/recurringExpenses';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RecurringExpensesListProps {
  recurringExpenses: RecurringExpense[];
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
  };
}

export const RecurringExpensesList: React.FC<RecurringExpensesListProps> = ({
  recurringExpenses,
  colors,
}) => {
  const activeRecurring = recurringExpenses.filter(re => re.isActive).slice(0, 3);

  const getNextDueText = (recurringExpense: RecurringExpense): string => {
    // Simple implementation - in real app, calculate based on frequency and last payment
    const frequency = recurringExpense.frequency;
    switch (frequency) {
      case 'weekly':
        return 'Due this week';
      case 'monthly':
        return 'Due this month';
      case 'yearly':
        return 'Due this year';
      default:
        return 'Due soon';
    }
  };

  const getRecurringIcon = (frequency: string): string => {
    switch (frequency) {
      case 'weekly':
        return 'calendar.badge.clock';
      case 'monthly':
        return 'calendar';
      case 'yearly':
        return 'calendar.badge.plus';
      default:
        return 'arrow.triangle.2.circlepath';
    }
  };

  if (activeRecurring.length === 0) {
    return (
      <View style={styles.recurringSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Recurring</Text>
        <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
          <IconSymbol name="arrow.triangle.2.circlepath" size={24} color={colors.subText} />
          <Text style={[styles.emptyStateText, { color: colors.subText }]}>
            No recurring expenses
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.recurringSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Recurring</Text>
      {activeRecurring.map((item) => (
        <View key={item.id} style={[styles.recurringItem, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.recurringItemLeft}>
            <View style={[styles.recurringIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
              <IconSymbol 
                name={getRecurringIcon(item.frequency) as any} 
                size={16} 
                color={colors.primaryBlue} 
              />
            </View>
            <View>
              <Text style={[styles.recurringName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.recurringDue, { color: colors.subText }]}>
                {getNextDueText(item)}
              </Text>
            </View>
          </View>
          <Text style={[styles.recurringAmount, { color: colors.text }]}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  recurringSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recurringItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recurringIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recurringName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  recurringDue: {
    fontSize: 14,
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
