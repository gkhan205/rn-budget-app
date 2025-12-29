import type { BudgetPerformanceStats } from '@/db/services/statsService';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetPerformanceCardProps {
  budgetPerformance: BudgetPerformanceStats[];
  colors: Record<string, string>;
  selectedTab?: string;
}

const BudgetPerformanceCard: React.FC<BudgetPerformanceCardProps> = ({
  budgetPerformance,
  colors,
  selectedTab = 'Expense',
}) => {
  // Hide budget performance for income since it doesn't make sense
  if (selectedTab === 'Income') {
    return null;
  }

  // Calculate overall budget performance from all budgets
  const totalPlanned = budgetPerformance.reduce((sum, bp) => sum + (bp.plannedAmount || 0), 0);
  const totalSpentAcrossBudgets = budgetPerformance.reduce((sum, bp) => sum + bp.actualAmount, 0);
  const utilizationPercentage = totalPlanned > 0 
    ? Math.round((totalSpentAcrossBudgets / totalPlanned) * 100) 
    : 0;
  const remaining = Math.max(0, totalPlanned - totalSpentAcrossBudgets);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const renderBudgetInfo = () => (
    <View style={styles.budgetInfo}>
      <Text style={[styles.budgetSpent, { color: colors.primaryBlue }]}>
        ${formatAmount(totalSpentAcrossBudgets)} Spent
      </Text>
      {totalPlanned > 0 ? (
        <Text style={[styles.budgetLimit, { color: colors.subText }]}>
          Limit: ${formatAmount(totalPlanned)}
        </Text>
      ) : (
        <Text style={[styles.budgetLimit, { color: colors.subText }]}>
          No budget limits set
        </Text>
      )}
    </View>
  );

  const renderProgressBar = () => {
    if (totalPlanned <= 0) return null;

    return (
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[
          styles.progressFill, 
          { 
            backgroundColor: utilizationPercentage > 100 ? colors.red : colors.primaryBlue, 
            width: `${Math.min(utilizationPercentage, 100)}%` 
          }
        ]} />
      </View>
    );
  };

  const renderRemainingText = () => {
    if (remaining > 0) {
      return (
        <Text style={[styles.budgetRemaining, { color: colors.subText }]}>
          You have{' '}
          <Text style={{ color: colors.green }}>
            ${formatAmount(remaining)}
          </Text>
          {' '}remaining for this period.
        </Text>
      );
    } else if (utilizationPercentage > 100) {
      return (
        <Text style={[styles.budgetRemaining, { color: colors.subText }]}>
          You are{' '}
          <Text style={{ color: colors.red }}>
            ${formatAmount(Math.abs(remaining))}
          </Text>
          {' '}over budget for this period.
        </Text>
      );
    } else {
      return (
        <Text style={[styles.budgetRemaining, { color: colors.subText }]}>
          No budget limits set for tracking.
        </Text>
      );
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Budget Performance
        </Text>
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>
          {utilizationPercentage}% Used
        </Text>
      </View>
      
      <View style={styles.budgetProgress}>
        {renderBudgetInfo()}
        {renderProgressBar()}
        {renderRemainingText()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
  },
  budgetProgress: {
    gap: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSpent: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetLimit: {
    fontSize: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetRemaining: {
    fontSize: 14,
  },
});

export default BudgetPerformanceCard;
