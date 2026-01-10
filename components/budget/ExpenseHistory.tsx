import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Expense } from '@/db/schema/expenses';
import { useCurrencyFormatter } from '@/hooks';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ExpenseHistoryProps {
  expenses: Expense[];
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
  };
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  colors,
}) => {
  const { format } = useCurrencyFormatter();

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getCategoryIcon = (category?: string | null): string => {
    switch (category?.toLowerCase()) {
      case 'food':
        return 'fork.knife';
      case 'transport':
        return 'car';
      case 'entertainment':
        return 'tv';
      case 'shopping':
        return 'bag';
      case 'health':
        return 'cross.case';
      case 'bills':
        return 'doc.text';
      default:
        return 'dollarsign.circle';
    }
  };

  const getCategoryColor = (category?: string | null): string => {
    switch (category?.toLowerCase()) {
      case 'food':
        return '#E74C3C';
      case 'transport':
        return '#3498DB';
      case 'entertainment':
        return '#9B59B6';
      case 'shopping':
        return '#F39C12';
      case 'health':
        return '#2ECC71';
      case 'bills':
        return '#34495E';
      default:
        return colors.primaryBlue;
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <View
        style={[
          styles.expenseItem,
          { backgroundColor: colors.cardBackground },
        ]}>
        <View style={styles.expenseLeft}>
          <View
            style={[
              styles.expenseIcon,
              { backgroundColor: categoryColor + '20' },
            ]}>
            <IconSymbol
              name={getCategoryIcon(item.category) as any}
              size={16}
              color={categoryColor}
            />
          </View>
          <View style={styles.expenseDetails}>
            <Text style={[styles.expenseDescription, { color: colors.text }]}>
              {item.description}
            </Text>
            <Text style={[styles.expenseCategory, { color: colors.subText }]}>
              {item.category || 'General'} • {formatDate(item.date)}
            </Text>
            {item.notes && (
              <Text style={[styles.expenseNotes, { color: colors.subText }]}>
                {item.notes}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={[styles.expenseAmount, { color: colors.text }]}>
            {format(item.amount)}
          </Text>
          {item.isRecurring && (
            <View
              style={[
                styles.recurringBadge,
                { backgroundColor: colors.primaryBlue + '20' },
              ]}>
              <IconSymbol
                name='arrow.triangle.2.circlepath'
                size={10}
                color={colors.primaryBlue}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View
      style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
      <IconSymbol name='tray' size={32} color={colors.subText} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No Expenses Yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.subText }]}>
        Your expense history will appear here
      </Text>
    </View>
  );

  if (expenses.length === 0) {
    return renderEmptyState();
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.container}>
      {sortedExpenses.map((expense, index) => (
        <React.Fragment key={expense.id}>
          {renderExpenseItem({ item: expense })}
          {index < sortedExpenses.length - 1 && (
            <View style={styles.separator} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  expenseNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  recurringBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
