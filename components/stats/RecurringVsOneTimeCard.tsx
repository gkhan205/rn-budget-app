import type { RecurringVsNonRecurringStats } from '@/db/services/statsService';
import { useCurrencyFormatter } from '@/hooks';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RecurringVsOneTimeCardProps {
  recurringStats: RecurringVsNonRecurringStats | null;
  colors: Record<string, string>;
  selectedTab?: string;
}

const RecurringVsOneTimeCard: React.FC<RecurringVsOneTimeCardProps> = ({
  recurringStats,
  colors,
  selectedTab = 'Expense',
}) => {
  const { format } = useCurrencyFormatter();

  if (!recurringStats) {
    return (
      <View
        style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recurring vs. One-Time
        </Text>
        <Text style={[styles.noDataText, { color: colors.subText }]}>
          No transaction data available
        </Text>
      </View>
    );
  }

  const renderRecurringSection = () => (
    <View style={styles.fixedSection}>
      <Text style={[styles.fixedLabel, { color: colors.subText }]}>
        Recurring
      </Text>
      <Text style={[styles.fixedPercentage, { color: colors.text }]}>
        {recurringStats.recurringPercentage}%
      </Text>
      <View
        style={[
          styles.fixedBar,
          {
            backgroundColor: colors.primaryBlue,
            width: `${Math.max(recurringStats.recurringPercentage, 10)}%`,
          },
        ]}
      />
      <Text style={[styles.fixedAmount, { color: colors.text }]}>
        {format(recurringStats.recurringTotal, false)}
      </Text>
    </View>
  );

  const renderOneTimeSection = () => (
    <View style={styles.variableSection}>
      <Text style={[styles.variableLabel, { color: colors.subText }]}>
        One-Time
      </Text>
      <Text style={[styles.variablePercentage, { color: colors.text }]}>
        {recurringStats.nonRecurringPercentage}%
      </Text>
      <View
        style={[
          styles.variableBar,
          {
            backgroundColor: colors.green,
            width: `${Math.max(recurringStats.nonRecurringPercentage, 10)}%`,
          },
        ]}
      />
      <Text style={[styles.variableAmount, { color: colors.text }]}>
        {format(recurringStats.nonRecurringTotal, false)}
      </Text>
    </View>
  );

  const renderDetails = () => (
    <View
      style={[
        styles.recurringDetails,
        { borderTopColor: 'rgba(255, 255, 255, 0.1)' },
      ]}>
      <Text style={[styles.recurringDetailText, { color: colors.subText }]}>
        {recurringStats.recurringCount} recurring {selectedTab.toLowerCase()}{' '}
        transactions • {recurringStats.nonRecurringCount} one-time{' '}
        {selectedTab.toLowerCase()} transactions
      </Text>
    </View>
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Recurring vs. One-Time
      </Text>

      <View style={styles.fixedVariableContainer}>
        {renderRecurringSection()}
        {renderOneTimeSection()}
      </View>

      {renderDetails()}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  fixedVariableContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  fixedSection: {
    flex: 1,
  },
  variableSection: {
    flex: 1,
  },
  fixedLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  variableLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  fixedPercentage: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  variablePercentage: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  fixedBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  variableBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  fixedAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  variableAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  recurringDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  recurringDetailText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RecurringVsOneTimeCard;
