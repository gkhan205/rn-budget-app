import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Account } from '@/db/schema/accounts';
import type { Budget } from '@/db/schema/budgets';
import type { Expense } from '@/db/schema/expenses';
import { AccountService } from '@/db/services/accountService';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TransactionItem {
  id: string;
  name: string;
  amount: number;
  type: 'expense';
  category: string;
  account: string;
  budgetName: string;
  icon: string;
  iconColor: string;
  date: Date;
  notes?: string;
  budgetId: string;
  accountId: string | null;
}

interface TransactionGroup {
  date: string;
  displayDate: string;
  transactions: TransactionItem[];
  totalAmount: number;
}

interface FilterOptions {
  budgetId: string | null;
  accountId: string | null;
  category: string | null;
}

const TransactionsScreen: React.FC = () => {
  const router = useRouter();
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    budgetId: null,
    accountId: null,
    category: null,
  });
  
  // Data state
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroup[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Summary state
  const [totalExpense, setTotalExpense] = useState(0);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    border: '#404348',
    incomeGreen: '#2ECC71',
    expenseRed: '#E74C3C',
  };

  // Helper function to get transaction icon based on category
  const getTransactionIcon = useCallback((category: string): { icon: string; iconColor: string } => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('groceries')) {
      return { icon: 'cart.fill', iconColor: '#FF8A4A' };
    } else if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('fuel')) {
      return { icon: 'car.fill', iconColor: '#E74C3C' };
    } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie') || categoryLower.includes('fun')) {
      return { icon: 'gamecontroller.fill', iconColor: '#9B59B6' };
    } else if (categoryLower.includes('subscription') || categoryLower.includes('netflix') || categoryLower.includes('spotify')) {
      return { icon: 'play.rectangle.fill', iconColor: '#E50914' };
    } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('pharmacy')) {
      return { icon: 'cross.fill', iconColor: '#FF6B6B' };
    } else {
      return { icon: 'creditcard.fill', iconColor: '#4A9EFF' };
    }
  }, []);

  // Helper function to group transactions by date
  const groupTransactionsByDate = useCallback((expenses: Expense[], budgetsMap: Map<string, Budget>, accountsMap: Map<string, Account>): TransactionGroup[] => {
    const groups: Record<string, TransactionGroup> = {};
    
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const dateKey = expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Format display date
      let displayDate: string;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      if (dateKey === today.toISOString().split('T')[0]) {
        displayDate = 'Today';
      } else if (dateKey === yesterday.toISOString().split('T')[0]) {
        displayDate = 'Yesterday';
      } else {
        displayDate = expenseDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: expenseDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
        });
      }

      const budget = budgetsMap.get(expense.budgetId);
      const account = accountsMap.get(expense.accountId || '');
      const { icon, iconColor } = getTransactionIcon(expense.category || '');

      const transactionItem: TransactionItem = {
        id: expense.id,
        name: expense.description,
        amount: expense.amount,
        type: 'expense',
        category: expense.category || 'Other',
        account: account?.name || 'Unknown Account',
        budgetName: budget?.name || 'Unknown Budget',
        icon,
        iconColor,
        date: expenseDate,
        notes: expense.notes || undefined,
        budgetId: expense.budgetId,
        accountId: expense.accountId,
      };

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          displayDate,
          transactions: [],
          totalAmount: 0,
        };
      }

      groups[dateKey].transactions.push(transactionItem);
      groups[dateKey].totalAmount += expense.amount;
    });

    // Convert to array and sort by date descending
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [getTransactionIcon]);

  // Load transactions and filter data
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load budgets and accounts for mapping
      const [budgetsData, accountsData] = await Promise.all([
        BudgetService.getAll(),
        AccountService.getAll(),
      ]);

      setBudgets(budgetsData);
      setAccounts(accountsData);

      // Create maps for quick lookup
      const budgetsMap = new Map(budgetsData.map(budget => [budget.id, budget]));
      const accountsMap = new Map(accountsData.map(account => [account.id, account]));

      // Load expenses with filters applied
      let expenses: Expense[];
      
      if (filters.budgetId && filters.accountId && filters.category) {
        // Complex filtering - get all and filter in memory for now
        // In production, you might want to create specific service methods
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.budgetId === filters.budgetId &&
          expense.accountId === filters.accountId &&
          expense.category === filters.category
        );
      } else if (filters.budgetId && filters.accountId) {
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.budgetId === filters.budgetId &&
          expense.accountId === filters.accountId
        );
      } else if (filters.budgetId && filters.category) {
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.budgetId === filters.budgetId &&
          expense.category === filters.category
        );
      } else if (filters.accountId && filters.category) {
        const allExpenses = await ExpenseService.getAll();
        expenses = allExpenses.filter(expense => 
          expense.accountId === filters.accountId &&
          expense.category === filters.category
        );
      } else if (filters.budgetId) {
        expenses = await ExpenseService.getByBudgetId(filters.budgetId);
      } else if (filters.category) {
        expenses = await ExpenseService.getByCategory(filters.category);
      } else {
        // No filters - get all expenses
        expenses = await ExpenseService.getAll();
      }

      // Group transactions by date
      const groupedTransactions = groupTransactionsByDate(expenses, budgetsMap, accountsMap);
      setTransactionGroups(groupedTransactions);

      // Calculate total expense
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpense(total);

      // Extract unique categories for filtering
      const uniqueCategories = Array.from(new Set(expenses.map(e => e.category).filter((cat): cat is string => Boolean(cat))));
      setCategories(uniqueCategories);

    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, groupTransactionsByDate]);

  // Load transactions on screen focus and when filters change
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  // Filter functions
  const handleBudgetFilter = () => {
    // Simple cycling through budgets for now
    if (!budgets.length) return;
    
    const currentIndex = filters.budgetId ? budgets.findIndex(b => b.id === filters.budgetId) : -1;
    const nextIndex = currentIndex >= budgets.length - 1 ? -1 : currentIndex + 1;
    
    setFilters(prev => ({
      ...prev,
      budgetId: nextIndex === -1 ? null : budgets[nextIndex].id
    }));
  };

  const handleAccountFilter = () => {
    // Simple cycling through accounts for now
    if (!accounts.length) return;
    
    const currentIndex = filters.accountId ? accounts.findIndex(a => a.id === filters.accountId) : -1;
    const nextIndex = currentIndex >= accounts.length - 1 ? -1 : currentIndex + 1;
    
    setFilters(prev => ({
      ...prev,
      accountId: nextIndex === -1 ? null : accounts[nextIndex].id
    }));
  };

  const handleCategoryFilter = () => {
    // Simple cycling through categories for now
    if (!categories.length) return;
    
    const currentIndex = filters.category ? categories.findIndex(c => c === filters.category) : -1;
    const nextIndex = currentIndex >= categories.length - 1 ? -1 : currentIndex + 1;
    
    setFilters(prev => ({
      ...prev,
      category: nextIndex === -1 ? null : categories[nextIndex]
    }));
  };

  // Get display values for filters
  const getFilterDisplayValue = (type: 'budget' | 'account' | 'category'): string => {
    switch (type) {
      case 'budget':
        if (!filters.budgetId) return 'All Budgets';
        const budget = budgets.find(b => b.id === filters.budgetId);
        return budget?.name || 'All Budgets';
      case 'account':
        if (!filters.accountId) return 'All Accounts';
        const account = accounts.find(a => a.id === filters.accountId);
        return account?.name || 'All Accounts';
      case 'category':
        return filters.category || 'Categories';
      default:
        return '';
    }
  };

  const handleFilterPress = () => {
    // TODO: Show comprehensive filter modal
    console.log('Show filters');
  };

  const handleAddTransaction = () => {
    router.push('/add-transaction' as any);
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
      <TouchableOpacity onPress={handleFilterPress} style={styles.searchButton}>
        <IconSymbol name="magnifyingglass" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      <TouchableOpacity 
        style={[styles.filterChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={handleBudgetFilter}
      >
        <Text style={[styles.filterText, { color: colors.text }]}>{getFilterDisplayValue('budget')}</Text>
        <IconSymbol name="chevron.down" size={16} color={colors.subText} style={styles.filterIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={handleAccountFilter}
      >
        <Text style={[styles.filterText, { color: colors.text }]}>{getFilterDisplayValue('account')}</Text>
        <IconSymbol name="chevron.down" size={16} color={colors.subText} style={styles.filterIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={handleCategoryFilter}
      >
        <Text style={[styles.filterText, { color: colors.text }]}>{getFilterDisplayValue('category')}</Text>
        <IconSymbol name="chevron.down" size={16} color={colors.subText} style={styles.filterIcon} />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.summaryLabel, { color: colors.subText }]}>INCOME</Text>
        <Text style={[styles.summaryAmount, { color: colors.incomeGreen }]}>
          $0.00
        </Text>
      </View>
      
      <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.summaryLabel, { color: colors.subText }]}>EXPENSE</Text>
        <Text style={[styles.summaryAmount, { color: colors.expenseRed }]}>
          ${totalExpense.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderTransactionGroup = ({ item }: { item: TransactionGroup }) => (
    <View style={styles.transactionGroup}>
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
        <Text style={[
          styles.dateAmount, 
          { color: item.totalAmount >= 0 ? colors.incomeGreen : colors.subText }
        ]}>
          {item.totalAmount >= 0 ? '+' : '-'} ${Math.abs(item.totalAmount).toFixed(2)}
        </Text>
      </View>
      
      {item.transactions.map((transaction) => (
        <TouchableOpacity 
          key={transaction.id}
          style={[styles.transactionRow, { borderBottomColor: colors.border }]}
        >
          <View style={[styles.transactionIcon, { backgroundColor: transaction.iconColor + '20' }]}>
            <IconSymbol 
              name={transaction.icon as any} 
              size={20} 
              color={transaction.iconColor} 
            />
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionName, { color: colors.text }]}>
              {transaction.name}
            </Text>
            <Text style={[styles.transactionMeta, { color: colors.subText }]}>
              {transaction.account} • {transaction.category}
            </Text>
          </View>
          
          <Text style={[
            styles.transactionAmount,
            { color: colors.expenseRed }
          ]}>
            -${transaction.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Loading transactions...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
              onPress={loadTransactions}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderFilters()}
            {renderSummaryCards()}
            
            <FlatList
              data={transactionGroups}
              renderItem={renderTransactionGroup}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              style={styles.transactionsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}

        {/* Floating Add Button */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primaryBlue }]}
          onPress={handleAddTransaction}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  searchButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersContent: {
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterIcon: {
    marginLeft: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
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
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionsScreen;
