import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCurrencyFormatter } from '@/hooks';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SpendingSummaryProps {
  todaysSpend: number;
  weekSpend: number;
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
  };
}

export const SpendingSummary: React.FC<SpendingSummaryProps> = ({
  todaysSpend,
  weekSpend,
  colors,
}) => {
  const { format } = useCurrencyFormatter();
  return (
    <View style={styles.spendingSection}>
      <View style={styles.spendingRow}>
        <View
          style={[
            styles.spendingCard,
            { backgroundColor: colors.cardBackground },
          ]}>
          <View
            style={[
              styles.spendingIcon,
              { backgroundColor: colors.primaryBlue + '20' },
            ]}>
            <IconSymbol name='calendar' size={16} color={colors.primaryBlue} />
          </View>
          <Text style={[styles.spendingLabel, { color: colors.subText }]}>
            Today&apos;s Spend
          </Text>
          <Text style={[styles.spendingAmount, { color: colors.text }]}>
            {format(todaysSpend)}
          </Text>
        </View>
        <View
          style={[
            styles.spendingCard,
            { backgroundColor: colors.cardBackground },
          ]}>
          <View style={[styles.spendingIcon, { backgroundColor: '#9B59B620' }]}>
            <IconSymbol name='calendar' size={16} color='#9B59B6' />
          </View>
          <Text style={[styles.spendingLabel, { color: colors.subText }]}>
            This Week
          </Text>
          <Text style={[styles.spendingAmount, { color: colors.text }]}>
            {format(weekSpend)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  spendingSection: {
    marginBottom: 30,
  },
  spendingRow: {
    flexDirection: 'row',
    gap: 16,
  },
  spendingCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  spendingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  spendingLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  spendingAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
});
