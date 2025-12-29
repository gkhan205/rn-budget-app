import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RecurringExpense } from '@/hooks/useBudgetForm';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RecurringExpenseListProps {
  expenses: RecurringExpense[];
  onDelete: (id: string) => void;
  colors: {
    text: string;
    subText: string;
    error: string;
  };
}

export const RecurringExpenseList: React.FC<RecurringExpenseListProps> = ({
  expenses,
  onDelete,
  colors,
}) => {
  if (expenses.length === 0) {
    return null;
  }

  return (
    <View style={styles.expensesList}>
      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseItem}>
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseName, { color: colors.text }]}>
              {expense.name}
            </Text>
            {expense.category && (
              <Text style={[styles.expenseCategory, { color: colors.subText }]}>
                {expense.category}
              </Text>
            )}
          </View>
          <View style={styles.expenseActions}>
            <Text style={[styles.expenseAmount, { color: colors.text }]}>
              ${expense.amount.toFixed(2)}
            </Text>
            <TouchableOpacity 
              onPress={() => onDelete(expense.id)}
              style={styles.deleteButton}
            >
              <IconSymbol name="trash" size={12} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  expensesList: {
    marginTop: 12,
    gap: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#33363A',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
});
