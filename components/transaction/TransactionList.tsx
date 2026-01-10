import { useCurrencyFormatter } from '@/hooks';
import type {
  TransactionGroup,
  TransactionItem,
} from '@/hooks/useTransactions';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';
import SwipeableTransactionItem from './SwipeableTransactionItem';

interface TransactionListProps {
  transactionGroups: TransactionGroup[];
  onEditTransaction?: (transaction: TransactionItem) => void;
  onDeleteTransaction?: (transaction: TransactionItem) => void;
  colors: {
    text: string;
    subText: string;
    border: string;
    incomeGreen: string;
    expenseRed: string;
    primaryBlue: string;
    background: string;
  };
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactionGroups,
  onEditTransaction,
  onDeleteTransaction,
  colors,
}) => {
  const { format } = useCurrencyFormatter();

  const renderTransactionGroup = ({ item }: { item: TransactionGroup }) => (
    <View style={styles.transactionGroup}>
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {item.displayDate}
        </Text>
        <Text style={[styles.dateAmount, { color: colors.subText }]}>
          {format(item.totalAmount)}
        </Text>
      </View>

      {item.transactions.map((transaction) => (
        <SwipeableTransactionItem
          key={transaction.id}
          transaction={transaction}
          colors={colors}
          onEdit={onEditTransaction || (() => {})}
          onDelete={onDeleteTransaction || (() => {})}
        />
      ))}
    </View>
  );

  if (transactionGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name='creditcard' size={48} color={colors.subText} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Transactions
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
          Add your first transaction by tapping the + button below or try
          adjusting your filters.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactionGroups}
      renderItem={renderTransactionGroup}
      keyExtractor={(item, index) => `${item.date}-${index}`}
      style={styles.transactionsList}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  transactionGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TransactionList;
