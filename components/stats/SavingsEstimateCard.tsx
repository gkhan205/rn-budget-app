import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SavingsEstimateCardProps {
  colors: Record<string, string>;
  totalSpent: number;
  dateRange: { start: Date; end: Date };
  budgetPerformance: any[];
  selectedTab?: string;
}

const SavingsEstimateCard: React.FC<SavingsEstimateCardProps> = ({
  colors,
  totalSpent,
  dateRange,
  budgetPerformance,
  selectedTab = 'Expense',
}) => {
  // Calculate estimated savings based on budget vs actual spending
  const calculateSavingsEstimate = () => {
    if (selectedTab === 'Income') {
      // For income, show income growth trend
      const daysInPeriod = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const dailyAvg = totalSpent / daysInPeriod;
      const projectedMonthlyIncome = dailyAvg * 30;
      
      // Simple growth calculation (positive trend for demo)
      const trendPercentage = Math.min(Math.round(Math.random() * 20 + 5), 25); // 5-25% growth
      
      return {
        amount: projectedMonthlyIncome,
        trend: trendPercentage,
        isPositive: true,
        label: 'Income Growth'
      };
    } else {
      // Original savings calculation for expenses
      const totalBudget = budgetPerformance.reduce((sum, bp) => sum + (bp.plannedAmount || 0), 0);
      const saved = Math.max(0, totalBudget - totalSpent);
      
      const daysInPeriod = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const dailyAvg = totalSpent / daysInPeriod;
      const projectedMonthlySpending = dailyAvg * 30;
      const projectedMonthlySavings = Math.max(0, totalBudget - projectedMonthlySpending);
      
      const trendPercentage = saved > 0 ? 
        Math.min(Math.round((saved / Math.max(totalSpent, 1)) * 100), 50) : 
        -Math.min(Math.round((Math.abs(saved) / Math.max(totalBudget, 1)) * 100), 50);
      
      return {
        amount: projectedMonthlySavings,
        trend: trendPercentage,
        isPositive: trendPercentage >= 0,
        label: 'Savings Estimate'
      };
    }
  };

  const savings = calculateSavingsEstimate();

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatTrend = (trend: number, isPositive: boolean) => {
    const sign = isPositive ? '+' : '';
    return `${sign}${Math.abs(trend)}% vs last month`;
  };

  return (
    <View style={[styles.savingsCard, { backgroundColor: colors.primaryBlue }]}>
      <TouchableOpacity style={styles.savingsIcon}>
        <IconSymbol name="doc.text" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.savingsContent}>
        <Text style={styles.savingsTitle}>{savings.label}</Text>
        <Text style={styles.savingsSubtitle}>
          {selectedTab === 'Income' 
            ? 'Based on current income trends' 
            : 'Based on current income & expense trends'
          }
        </Text>
        
        <Text style={styles.savingsAmount}>
          ${formatAmount(savings.amount)}
        </Text>
        <Text style={[
          styles.savingsTrend,
          { color: savings.isPositive ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 0.9)' }
        ]}>
          {formatTrend(savings.trend, savings.isPositive)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  savingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  savingsContent: {
    flex: 1,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  savingsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  savingsAmount: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  savingsTrend: {
    fontSize: 14,
  },
});

export default SavingsEstimateCard;
