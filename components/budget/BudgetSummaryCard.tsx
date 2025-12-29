import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetSummaryCardProps {
  income: number;
  spent: number;
  remaining: number | null;
  percentage: number | null;
  daysRemaining: number;
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    green: string;
    border: string;
  };
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  income,
  spent,
  remaining,
  percentage,
  daysRemaining,
  colors,
}) => {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.summaryHeader}>
        <View>
          <Text style={[styles.summaryLabel, { color: colors.subText }]}>Total Income</Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>
            ${income.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.incomeIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
          <IconSymbol name="banknote" size={20} color={colors.primaryBlue} />
        </View>
      </View>

      <View style={styles.usageContainer}>
        <Text style={[styles.usageText, { color: colors.primaryBlue }]}>
          {percentage || 0}% Used
        </Text>
        <Text style={[styles.spentText, { color: colors.subText }]}>
          ${spent.toFixed(2)} spent
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primaryBlue,
                width: `${Math.min(percentage || 0, 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.summaryFooter}>
        <View style={styles.remainingContainer}>
          <View style={[styles.remainingIndicator, { backgroundColor: colors.green }]} />
          <Text style={[styles.remainingText, { color: colors.green }]}>
            ${(remaining || 0).toFixed(2)} Remaining
          </Text>
        </View>
        <Text style={[styles.resetText, { color: colors.subText }]}>
          {daysRemaining > 0 ? `Resets in ${daysRemaining} days` : 'No end date'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  incomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spentText: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetText: {
    fontSize: 14,
  },
});
