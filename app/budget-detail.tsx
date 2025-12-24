import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Budget } from '@/db/schema/budgets';
import type { Expense } from '@/db/schema/expenses';
import type { RecurringExpense } from '@/db/schema/recurringExpenses';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { calculateBudgetMetrics } from '@/utils/budgetCalculations';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RecurringItem {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  amount: number;
  dueText: string;
}

interface CategorySpend {
  name: string;
  percentage: number;
  color: string;
}

interface BudgetDetailData {
  budget: Budget;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  totalSpent: number;
  totalPlanned: number;
  remaining: number | null;
  percentage: number | null;
  todaysSpend: number;
  weekSpend: number;
}

const BudgetDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const budgetId = params.id as string;

  // State management
  const [activeTab, setActiveTab] = useState<'Overview' | 'Recurring' | 'History'>('Overview');
  const [budgetDetail, setBudgetDetail] = useState<BudgetDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to map expenses for UI display
  const mapExpenseForCalculation = (expense: Expense) => ({
    id: expense.id,
    budgetId: expense.budgetId,
    amount: expense.amount,
    categoryId: expense.categoryId || 'default',
    accountId: expense.accountId || 'default',
    date: expense.date,
    note: expense.notes,
    isGeneratedFromRecurring: expense.isRecurring || false,
    recurringId: expense.recurringExpenseId,
  });

  // Helper function to map recurring expenses for UI display
  const mapRecurringExpenseForCalculation = (recurringExpense: RecurringExpense) => ({
    id: recurringExpense.id,
    budgetId: recurringExpense.budgetId,
    name: recurringExpense.name,
    amount: recurringExpense.amount,
    frequency: recurringExpense.frequency === 'daily' ? 'custom' as const : recurringExpense.frequency,
    dueDay: null,
    startDate: recurringExpense.startDate,
    endDate: recurringExpense.endDate,
    accountId: recurringExpense.accountId || 'default',
    autoAdd: recurringExpense.autoAdd || false,
    isActive: recurringExpense.isActive,
  });

  // Load budget detail data
  const loadBudgetDetail = useCallback(async () => {
    if (!budgetId) {
      setError('Budget ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load budget data
      const budget = await BudgetService.getById(budgetId);
      if (!budget) {
        setError('Budget not found');
        return;
      }

      // Get current budget period
      const period = BudgetService.getCurrentPeriod(budget);

      // Load expenses and recurring expenses
      const [expenses, recurringExpenses] = await Promise.all([
        period.end 
          ? ExpenseService.getByBudgetAndDateRange(budget.id, period.start, period.end)
          : ExpenseService.getByBudgetId(budget.id),
        RecurringExpenseService.getByBudgetId(budget.id)
      ]);

      // Calculate metrics
      const budgetForCalculation = {
        ...budget,
        createdAt: budget.createdAt || new Date(),
        updatedAt: budget.updatedAt || new Date(),
      } as any;

      const mappedExpenses = expenses.map(mapExpenseForCalculation);
      const mappedRecurringExpenses = recurringExpenses.map(mapRecurringExpenseForCalculation);

      const metrics = calculateBudgetMetrics(budgetForCalculation, mappedExpenses, mappedRecurringExpenses);

      // Calculate today's and this week's spending
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

      const todaysSpend = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= today && expenseDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      const weekSpend = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= now;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      setBudgetDetail({
        budget,
        expenses,
        recurringExpenses,
        totalSpent: metrics.totalSpent,
        totalPlanned: metrics.totalPlanned,
        remaining: metrics.remainingAmount,
        percentage: metrics.progressPercentage,
        todaysSpend,
        weekSpend,
      });

    } catch (err) {
      console.error('Failed to load budget detail:', err);
      setError('Failed to load budget details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [budgetId]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadBudgetDetail();
    }, [loadBudgetDetail])
  );

  // Derived data for UI
  const budgetData = budgetDetail ? {
    name: budgetDetail.budget.name,
    icon: 'cart.fill', // This could be dynamic based on budget category
    period: `${budgetDetail.budget.periodType.charAt(0).toUpperCase() + budgetDetail.budget.periodType.slice(1)} Budget`,
    limit: budgetDetail.budget.limitAmount,
    spent: budgetDetail.totalSpent,
    remaining: budgetDetail.remaining,
    percentage: budgetDetail.percentage || 0,
    resetsIn: 12, // Calculate based on period end date
    todaysSpend: budgetDetail.todaysSpend,
    weekSpend: budgetDetail.weekSpend,
  } : null;

  // Convert recurring expenses to UI format
  const upcomingRecurring: RecurringItem[] = budgetDetail 
    ? budgetDetail.recurringExpenses
        .filter(re => re.isActive)
        .slice(0, 2) // Show only first 2
        .map(re => ({
          id: re.id,
          name: re.name,
          icon: 'arrow.triangle.2.circlepath',
          iconColor: '#4A9EFF',
          amount: re.amount,
          dueText: 'Due soon', // Calculate based on next due date
        }))
    : [];

  // Sample category spending (would be calculated from expenses)
  const categorySpending: CategorySpend[] = [
    { name: 'General', percentage: 100, color: '#4A9EFF' },
  ];

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    border: '#404348',
    tabInactive: '#666666',
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddRecurring = () => {
    // Navigate to recurring screen
    router.push('/recurring');
  };

  const handleAddExpense = () => {
    // TODO: Navigate to add expense screen
    console.log('Add expense');
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {budgetData!.name}
          </Text>
          <IconSymbol name={budgetData!.icon as any} size={16} color={colors.primaryBlue} style={styles.headerIcon} />
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>{budgetData!.period}</Text>
      </View>
      <TouchableOpacity style={styles.optionsButton}>
        <IconSymbol name="ellipsis" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.summaryHeader}>
        <View>
          <Text style={[styles.summaryLabel, { color: colors.subText }]}>Total Limit</Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>
            ${(budgetData!.limit || 0).toFixed(2)}
          </Text>
        </View>
        <View style={[styles.cartIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
          <IconSymbol name="cart.fill" size={20} color={colors.primaryBlue} />
        </View>
      </View>

      <View style={styles.usageContainer}>
        <Text style={[styles.usageText, { color: colors.primaryBlue }]}>
          {budgetData!.percentage}% Used
        </Text>
        <Text style={[styles.spentText, { color: colors.subText }]}>
          ${budgetData!.spent.toFixed(2)} spent
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primaryBlue,
                width: `${Math.min(budgetData!.percentage, 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.summaryFooter}>
        <View style={styles.remainingContainer}>
          <View style={styles.remainingIndicator} />
          <Text style={[styles.remainingText, { color: colors.green }]}>
            ${(budgetData!.remaining || 0).toFixed(2)} Remaining
          </Text>
        </View>
        <Text style={[styles.resetText, { color: colors.subText }]}>
          Resets in {budgetData!.resetsIn} days
        </Text>
      </View>
    </View>
  );

  const renderTabNavigation = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
      {(['Overview', 'Recurring', 'History'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && { borderBottomColor: colors.primaryBlue },
          ]}
          onPress={() => {
            if (tab === 'Recurring') {
              router.push('/recurring');
            } else {
              setActiveTab(tab);
            }
          }}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab ? colors.text : colors.tabInactive,
              },
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSpendingSummary = () => (
    <View style={styles.spendingSection}>
      <View style={styles.spendingRow}>
        <View style={[styles.spendingCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.spendingIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
            <IconSymbol name="calendar" size={16} color={colors.primaryBlue} />
          </View>
          <Text style={[styles.spendingLabel, { color: colors.subText }]}>Today&apos;s Spend</Text>
          <Text style={[styles.spendingAmount, { color: colors.text }]}>
            ${budgetData!.todaysSpend.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.spendingCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.spendingIcon, { backgroundColor: '#9B59B620' }]}>
            <IconSymbol name="calendar" size={16} color="#9B59B6" />
          </View>
          <Text style={[styles.spendingLabel, { color: colors.subText }]}>This Week</Text>
          <Text style={[styles.spendingAmount, { color: colors.text }]}>
            ${budgetData!.weekSpend.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCategoryChart = () => (
    <View style={[styles.categorySection, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.categorySectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: colors.primaryBlue }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartPlaceholder}>
          <View style={styles.chartCircle}>
            <Text style={[styles.chartLabel, { color: colors.text }]}>Oct</Text>
          </View>
        </View>
        <View style={styles.legendContainer}>
          {categorySpending.map((category, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: category.color }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>{category.name}</Text>
              <Text style={[styles.legendPercent, { color: colors.subText }]}>
                {category.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderUpcomingRecurring = () => (
    <View style={styles.recurringSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Recurring</Text>
      {upcomingRecurring.map((item) => (
        <View key={item.id} style={[styles.recurringItem, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.recurringItemLeft}>
            <View style={[styles.recurringIcon, { backgroundColor: item.iconColor + '20' }]}>
              <IconSymbol name={item.icon as any} size={16} color={item.iconColor} />
            </View>
            <View>
              <Text style={[styles.recurringName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.recurringDue, { color: colors.subText }]}>{item.dueText}</Text>
            </View>
          </View>
          <Text style={[styles.recurringAmount, { color: colors.text }]}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
        onPress={handleAddRecurring}
      >
        <IconSymbol name="arrow.triangle.2.circlepath" size={16} color={colors.text} />
        <Text style={[styles.actionButtonText, { color: colors.text }]}>Add Recurring</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primaryBlue }]}
        onPress={handleAddExpense}
      >
        <IconSymbol name="plus" size={16} color="#FFFFFF" />
        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {renderSpendingSummary()}
      {renderCategoryChart()}
      {renderUpcomingRecurring()}
      {renderActionButtons()}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverviewTab();
      case 'Recurring':
        return (
          <View style={[styles.tabContent, styles.centerContent]}>
            <Text style={[styles.placeholderText, { color: colors.subText }]}>
              Recurring expenses will appear here
            </Text>
          </View>
        );
      case 'History':
        return (
          <View style={[styles.tabContent, styles.centerContent]}>
            <Text style={[styles.placeholderText, { color: colors.subText }]}>
              Transaction history will appear here
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
          Loading budget details...
        </Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: '#FF6B6B', marginBottom: 16 }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
          onPress={loadBudgetDetail}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Show empty state if no budget data
  if (!budgetData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.subText }]}>
          Budget not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      {renderSummaryCard()}
      {renderTabNavigation()}
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 6,
  },
  headerIcon: {
    marginLeft: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  optionsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  cartIcon: {
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
    backgroundColor: '#2ECC71',
    marginRight: 8,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetText: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
  },
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
  categorySection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartPlaceholder: {
    width: 120,
    height: 120,
    marginRight: 20,
  },
  chartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 16,
    borderTopColor: '#4A9EFF',
    borderRightColor: '#A0D4FF',
    borderBottomColor: '#C2E4FF',
    borderLeftColor: '#E1F2FF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  legendContainer: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    flex: 1,
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  recurringSection: {
    marginBottom: 30,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  recurringItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recurringIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recurringName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  recurringDue: {
    fontSize: 14,
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {
    // backgroundColor set via style prop
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BudgetDetailScreen;
