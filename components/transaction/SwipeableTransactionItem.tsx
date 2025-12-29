import type { TransactionItem } from '@/hooks/useTransactions';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { IconSymbol } from '../ui/icon-symbol';

interface SwipeableTransactionItemProps {
  transaction: TransactionItem;
  colors: {
    text: string;
    subText: string;
    border: string;
    expenseRed: string;
    primaryBlue: string;
    background: string;
    incomeGreen: string;
  };
  onEdit: (transaction: TransactionItem) => void;
  onDelete: (transaction: TransactionItem) => void;
}

const ACTION_WIDTH = 80;

const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({
  transaction,
  colors,
  onEdit,
  onDelete,
}) => {
  const renderRightActions = (
    progress: Animated.AnimatedAddition<number>,
    dragX: Animated.AnimatedAddition<number>
  ) => {
    const editScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const deleteScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const editTranslate = dragX.interpolate({
      inputRange: [-ACTION_WIDTH * 2, -ACTION_WIDTH, 0],
      outputRange: [0, ACTION_WIDTH, ACTION_WIDTH * 2],
      extrapolate: 'clamp',
    });

    const deleteTranslate = dragX.interpolate({
      inputRange: [-ACTION_WIDTH * 2, 0],
      outputRange: [0, ACTION_WIDTH],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View
          style={[
            styles.actionButton,
            styles.editButton,
            { backgroundColor: colors.primaryBlue },
            {
              transform: [{ translateX: editTranslate }, { scale: editScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={() => onEdit(transaction)}
          >
            <IconSymbol name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionButton,
            styles.deleteButton,
            { backgroundColor: colors.expenseRed },
            {
              transform: [{ translateX: deleteTranslate }, { scale: deleteScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={() => onDelete(transaction)}
          >
            <IconSymbol name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
      friction={1.5}
    >
      <View style={[styles.transactionRow, { borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: transaction.iconColor + '20' },
          ]}
        >
          <IconSymbol
            name={transaction.icon as any}
            size={20}
            color={transaction.iconColor}
          />
        </View>

        <View style={styles.transactionDetails}>
          <Text
            style={[styles.transactionName, { color: colors.text }]}
            numberOfLines={1}
          >
            {transaction.name}
          </Text>
          <Text
            style={[styles.transactionMeta, { color: colors.subText }]}
            numberOfLines={1}
          >
            {transaction.account} • {transaction.category}
          </Text>
        </View>

        <Text
          style={[styles.transactionAmount, { color: transaction.type === "income" ? colors.incomeGreen : colors.expenseRed }]}
        >
          {transaction.type === "income" ? '+' : '-'} ${transaction.amount.toFixed(2)}
        </Text>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 8,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: ACTION_WIDTH * 2,
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    // Styles handled by backgroundColor prop
  },
  deleteButton: {
    // Styles handled by backgroundColor prop
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default SwipeableTransactionItem;
