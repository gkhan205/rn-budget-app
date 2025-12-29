import MainLayout from '@/components/MainLayout';
import { SwipeableBudgetItem } from '@/components/budget';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Budget } from '@/db/schema/budgets';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateBudgetMetrics } from '@/utils/budgetCalculations';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

interface BudgetSummary {
  totalPlanned: number;
  totalSpent: number;
  remaining: number;
  expectedSavings: number;
}

const BudgetsScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  // State management
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    totalPlanned: 0,
    totalSpent: 0,
    remaining: 0,
    expectedSavings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    background: '#1A1B1F', // Force dark background
    cardBackground: '#2A2D32', // Force dark card background
    text: '#FFFFFF', // Force white text
    subText: '#9BA1A6', // Force light gray subtext
    headerBackground: '#1A1B1F', // Always dark to match design
    primaryBlue: '#4A9EFF',
    orange: '#FF8A4A',
    purple: '#9B59B6',
    red: '#E74C3C',
    expenseRed: '#E74C3C',
    green: '#2ECC71',
  };

  // Helper function to map drizzle expense to calculation model
  const mapExpenseForCalculation = (expense: any) => ({
    id: expense.id,
    budgetId: expense.budgetId,
    amount: expense.amount,
    categoryId: expense.categoryId,
    accountId: expense.accountId,
    date: expense.date,
    note: expense.notes, // Map 'notes' to 'note'
    isGeneratedFromRecurring: expense.isRecurring || false,
    recurringId: expense.recurringExpenseId,
  });

  // Helper function to map drizzle recurring expense to calculation model
  const mapRecurringExpenseForCalculation = (recurringExpense: any) => ({
    id: recurringExpense.id,
    budgetId: recurringExpense.budgetId,
    name: recurringExpense.name,
    amount: recurringExpense.amount,
    frequency: recurringExpense.frequency,
    dueDay: null, // Not used in calculations but required by interface
    startDate: recurringExpense.startDate,
    endDate: recurringExpense.endDate,
    accountId: recurringExpense.accountId,
    autoAdd: recurringExpense.autoAdd || false,
    isActive: recurringExpense.isActive,
  });
  const getBudgetIconAndColor = (budget: Budget): { icon: string; iconColor: string } => {
    return {
      icon: budget.icon,
      iconColor: budget.color,
    };
  };

  // Helper function to get progress color based on percentage
  const getProgressColor = (percentage: number | null): string => {
    if (!percentage) return '#4A9EFF';
    if (percentage > 100) return '#E74C3C'; // Red for over budget
    if (percentage > 80) return '#FF8A4A'; // Orange for warning
    return '#4A9EFF'; // Blue for normal
  };

  // Helper function to format budget period
  const formatBudgetPeriod = (budget: Budget, recurringCount: number): string => {
    const periodType = budget.periodType || 'monthly';
    let period = periodType.charAt(0).toUpperCase() + periodType.slice(1);
    
    if (recurringCount > 0) {
      period += ` • ${recurringCount} recurring`;
    }
    
    return period;
  };

  // Load budget data from database
  const loadBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get active budgets
      const budgets = await BudgetService.getActive();
      
      if (budgets.length === 0) {
        setBudgetItems([]);
        setBudgetSummary({
          totalPlanned: 0,
          totalSpent: 0,
          remaining: 0,
          expectedSavings: 0,
        });
        return;
      }

      // Calculate metrics for each budget
      const budgetItemsPromises = budgets.map(async (budget) => {
        // Get current budget period
        const period = BudgetService.getCurrentPeriod(budget);
        
        // Get expenses and recurring expenses for this budget
        const [expenses, recurringExpenses] = await Promise.all([
          period.end 
            ? ExpenseService.getByBudgetAndDateRange(budget.id, period.start, period.end)
            : ExpenseService.getByBudgetId(budget.id),
          RecurringExpenseService.getByBudgetId(budget.id)
        ]);

        // Calculate budget metrics (cast budget to handle date type differences)
        const budgetForCalculation = {
          ...budget,
          createdAt: budget.createdAt || new Date(),
          updatedAt: budget.updatedAt || new Date(),
        } as any; // Temporary cast to handle type differences
        
        // Map data to expected calculation format
        const mappedExpenses = expenses.map(mapExpenseForCalculation);
        const mappedRecurringExpenses = recurringExpenses.map(mapRecurringExpenseForCalculation);
        
        const metrics = calculateBudgetMetrics(budgetForCalculation, mappedExpenses, mappedRecurringExpenses);
        const { icon, iconColor } = getBudgetIconAndColor(budget);
        
        // Count active recurring expenses
        const activeRecurringCount = recurringExpenses.filter(re => re.isActive).length;
        
        return {
          id: budget.id,
          name: budget.name,
          icon,
          iconColor,
          period: formatBudgetPeriod(budget, activeRecurringCount),
          spent: metrics.totalSpent,
          limit: budget.income,
          percentage: metrics.progressPercentage,
          progressColor: getProgressColor(metrics.progressPercentage),
          recurringCount: activeRecurringCount,
        };
      });

      const budgetItemsData = await Promise.all(budgetItemsPromises);
      setBudgetItems(budgetItemsData);

      // Calculate summary totals
      const totalPlanned = budgetItemsData.reduce((sum, item) => sum + (item.limit || 0), 0);
      const totalSpent = budgetItemsData.reduce((sum, item) => sum + item.spent, 0);
      const remaining = totalPlanned - totalSpent;
      const expectedSavings = Math.max(0, remaining); // Simple calculation

      setBudgetSummary({
        totalPlanned,
        totalSpent,
        remaining,
        expectedSavings,
      });

    } catch (err) {
      console.error('Failed to load budget data:', err);
      setError('Failed to load budgets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadBudgetData();
    }, [loadBudgetData])
  );

  const handleAddBudget = () => {
    router.push('/add-budget');
  };

  const handleBudgetPress = (budgetId: string) => {
    router.push(`/budget-detail?id=${budgetId}` as any);
  };

  const handleEditBudget = (budget: BudgetItem) => {
    router.push({
      pathname: '/add-budget' as any,
      params: {
        editMode: 'true',
        budgetId: budget.id,
        name: budget.name,
        icon: budget.icon,
        iconColor: budget.iconColor,
        limit: budget.limit?.toString() || '',
      },
    });
  };

  const handleDeleteBudget = async (budget: BudgetItem) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"? This will also delete all associated expenses and cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await BudgetService.delete(budget.id);
              await loadBudgetData(); // Refresh the data
            } catch (error) {
              console.error('Failed to delete budget:', error);
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderBudgetCard = ({ item }: { item: BudgetItem }) => (
    <SwipeableBudgetItem
      budget={item}
      colors={colors}
      onPress={() => handleBudgetPress(item.id)}
      onEdit={handleEditBudget}
      onDelete={handleDeleteBudget}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryBlue + '20' }]}>
        <IconSymbol name="plus.circle.fill" size={48} color={colors.primaryBlue} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Budgets Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
        Create your first budget to start tracking your expenses
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: colors.primaryBlue }]}
        onPress={handleAddBudget}
      >
        <Text style={styles.emptyButtonText}>Create Budget</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={colors.primaryBlue} />
      <Text style={[styles.loadingText, { color: colors.subText }]}>
        Loading budgets...
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <View style={[styles.errorIconContainer, { backgroundColor: colors.red + '20' }]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.red} />
      </View>
      <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to Load Budgets</Text>
      <Text style={[styles.errorSubtitle, { color: colors.subText }]}>
        {error}
      </Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
        onPress={loadBudgetData}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Budgets</Text>
          <TouchableOpacity style={styles.dateSelector}>
            <Text style={styles.headerDate}>Oct 2023</Text>
            <IconSymbol name="chevron.down" size={12} color="#9BA1A6" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
          <IconSymbol name="plus" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryContainer, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.expectedSavingsContainer}>
          <Text style={styles.expectedSavingsLabel}>EXPECTED SAVINGS</Text>
          <Text style={styles.expectedSavingsAmount}>
            ${budgetSummary.expectedSavings.toLocaleString()}.00
          </Text>
          <Text style={styles.savingsChange}>📈 +12% vs last month</Text>
        </View>

        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Planned</Text>
            <Text style={[styles.summaryAmount, { color: '#FFFFFF' }]}>
              ${budgetSummary.totalPlanned.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Spent</Text>
            <Text style={[styles.summaryAmount, { color: '#FFFFFF' }]}>
              ${budgetSummary.totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Left</Text>
            <Text style={[styles.summaryAmount, { color: colors.primaryBlue }]}>
              ${budgetSummary.remaining.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.categoriesTitle}>Categories</Text>
      </View>
    </View>
  );

  // Render content based on current state
  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }
    
    if (error) {
      return renderErrorState();
    }
    
    if (budgetItems.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <FlatList
        data={budgetItems}
        renderItem={renderBudgetCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <MainLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {renderContent()}
        <TouchableOpacity style={styles.fab} onPress={handleAddBudget}>
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 16,
    color: '#9BA1A6',
    marginRight: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A9EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  expectedSavingsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  expectedSavingsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9BA1A6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  expectedSavingsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A9EFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  savingsChange: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  budgetCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetPeriod: {
    fontSize: 14,
  },
  budgetAmount: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  limitAmount: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20, // Moved further down to accommodate the tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A9EFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading state styles
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  // Error state styles
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BudgetsScreen;
