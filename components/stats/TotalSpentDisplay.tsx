import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TotalSpentDisplayProps {
  totalSpent: number;
  selectedPeriod: string;
  selectedTab: string;
  dateRange: { start: Date; end: Date };
  customDateRange?: { start: Date; end: Date } | null;
  colors: Record<string, string>;
}

const TotalSpentDisplay: React.FC<TotalSpentDisplayProps> = ({
  totalSpent,
  selectedPeriod,
  selectedTab,
  dateRange,
  customDateRange,
  colors,
}) => {
  const getPeriodLabel = () => {
    if (selectedPeriod === 'Custom' && customDateRange) {
      return `${customDateRange.start.toLocaleDateString()} - ${customDateRange.end.toLocaleDateString()}`;
    }
    return `${selectedPeriod} (${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()})`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getDisplayLabel = () => {
    return selectedTab === 'Income' ? 'Total Earned' : 'Total Spent';
  };

  return (
    <View style={styles.totalContainer}>
      <Text style={[styles.totalLabel, { color: colors.subText }]}>
        {getDisplayLabel()} ({getPeriodLabel()})
      </Text>
      <Text style={[styles.totalAmount, { color: colors.text }]}>
        ${formatAmount(totalSpent)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  totalContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '600',
  },
});

export default TotalSpentDisplay;
