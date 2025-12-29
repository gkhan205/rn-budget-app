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

interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  period: string;
  spent: number;
  limit: number | null;
  percentage: number | null;
  progressColor: string;
  recurringCount: number;
}

interface SwipeableBudgetItemProps {
  budget: BudgetItem;
  colors: {
    text: string;
    subText: string;
    cardBackground: string;
    primaryBlue: string;
    expenseRed: string;
  };
  onPress: () => void;
  onEdit: (budget: BudgetItem) => void;
  onDelete: (budget: BudgetItem) => void;
}

const ACTION_WIDTH = 80;

const SwipeableBudgetItem: React.FC<SwipeableBudgetItemProps> = ({
  budget,
  colors,
  onPress,
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
            onPress={() => onEdit(budget)}
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
            onPress={() => onDelete(budget)}
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
      <TouchableOpacity 
        style={[styles.budgetCard, { backgroundColor: colors.cardBackground }]}
        onPress={onPress}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <View style={[styles.iconContainer, { backgroundColor: budget.iconColor + '20' }]}>
              <IconSymbol name={budget.icon as any} size={20} color={budget.iconColor} />
            </View>
            <View style={styles.budgetDetails}>
              <Text style={[styles.budgetName, { color: colors.text }]}>{budget.name}</Text>
              <Text style={[styles.budgetPeriod, { color: colors.subText }]}>{budget.period}</Text>
            </View>
          </View>
          <View style={styles.budgetAmount}>
            <Text style={[styles.spentAmount, { color: colors.text }]}>${budget.spent.toFixed(2)}</Text>
            {budget.limit ? (
              <Text style={[styles.limitAmount, { color: colors.subText }]}>
                of ${budget.limit.toFixed(2)} limit
              </Text>
            ) : (
              <Text style={[styles.limitAmount, { color: colors.subText }]}>
                No limit set
              </Text>
            )}
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: budget.progressColor,
                  width: budget.percentage ? `${Math.min(budget.percentage, 100)}%` : '0%',
                },
              ]}
            />
          </View>
          <Text style={[styles.percentage, { color: colors.subText }]}>
            {budget.percentage ? `${budget.percentage.toFixed(0)}%` : '-%'}
          </Text>
        </View>
        {budget.recurringCount > 0 && (
          <View style={styles.recurringContainer}>
            <IconSymbol name="repeat" size={12} color={colors.subText} />
            <Text style={[styles.recurringText, { color: colors.subText }]}>
              {budget.recurringCount} recurring expenses
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  budgetAmount: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  limitAmount: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  recurringText: {
    fontSize: 12,
    marginLeft: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: ACTION_WIDTH * 2,
    marginVertical: 8,
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 8,
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

export default SwipeableBudgetItem;
