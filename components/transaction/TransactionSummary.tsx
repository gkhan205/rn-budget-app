import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpense: number;
  colors: {
    cardBackground: string;
    subText: string;
    incomeGreen: string;
    expenseRed: string;
  };
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  totalIncome,
  totalExpense,
  colors,
}) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.summaryLabel, { color: colors.subText }]}>INCOME</Text>
        <Text style={[styles.summaryAmount, { color: colors.incomeGreen }]}>
          ${totalIncome.toFixed(2)}
        </Text>
      </View>
      
      <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.summaryLabel, { color: colors.subText }]}>EXPENSE</Text>
        <Text style={[styles.summaryAmount, { color: colors.expenseRed }]}>
          ${totalExpense.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
});

export default TransactionSummary;
