import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  icon: string;
  iconColor: string;
  date: string;
}

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
  totalAmount: number;
}

const TransactionsScreen: React.FC = () => {
  const router = useRouter();
  const [selectedBudget] = useState('All Budgets');
  const [selectedAccount] = useState('All Accounts');
  const [selectedCategory] = useState('Categories');

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

  // Sample transactions data grouped by date
  const transactionGroups: TransactionGroup[] = [
    {
      date: 'Today',
      totalAmount: -135.50,
      transactions: [
        {
          id: '1',
          name: 'Burger King',
          amount: 15.50,
          type: 'expense',
          category: 'Lunch',
          account: 'Personal Card',
          icon: 'cart.fill',
          iconColor: '#FF8A4A',
          date: 'Today',
        },
        {
          id: '2',
          name: 'Walmart Supercenter',
          amount: 120.00,
          type: 'expense',
          category: 'Groceries',
          account: 'Shared Budget',
          icon: 'cart.fill',
          iconColor: '#4A9EFF',
          date: 'Today',
        },
      ],
    },
    {
      date: 'Yesterday',
      totalAmount: 2955.00,
      transactions: [
        {
          id: '3',
          name: 'Salary',
          amount: 3000.00,
          type: 'income',
          category: 'Income',
          account: 'Bank Account',
          icon: 'dollarsign.circle.fill',
          iconColor: '#F1C40F',
          date: 'Yesterday',
        },
        {
          id: '4',
          name: 'Shell Station',
          amount: 45.00,
          type: 'expense',
          category: 'Transport',
          account: 'Credit Card',
          icon: 'fuelpump.fill',
          iconColor: '#E74C3C',
          date: 'Yesterday',
        },
      ],
    },
    {
      date: 'Oct 24, 2023',
      totalAmount: -47.39,
      transactions: [
        {
          id: '5',
          name: 'Netflix',
          amount: 14.99,
          type: 'expense',
          category: 'Subscription',
          account: 'Digital Card',
          icon: 'play.rectangle.fill',
          iconColor: '#E50914',
          date: 'Oct 24, 2023',
        },
        {
          id: '6',
          name: 'CVS Pharmacy',
          amount: 32.40,
          type: 'expense',
          category: 'Health',
          account: 'HSA',
          icon: 'cross.fill',
          iconColor: '#FF6B6B',
          date: 'Oct 24, 2023',
        },
      ],
    },
  ];

  const totalIncome = 4200.00;
  const totalExpense = 2150.50;

  const handleFilterPress = () => {
    // TODO: Show filter modal
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
      <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.filterText, { color: colors.text }]}>{selectedBudget}</Text>
        <IconSymbol name="chevron.down" size={16} color={colors.subText} style={styles.filterIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.filterText, { color: colors.text }]}>{selectedAccount}</Text>
        <IconSymbol name="chevron.down" size={16} color={colors.subText} style={styles.filterIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.filterText, { color: colors.text }]}>{selectedCategory}</Text>
        <IconSymbol name="chevron.down" size={16} color={colors.subText} style={styles.filterIcon} />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.summaryLabel, { color: colors.subText }]}>INCOME</Text>
        <Text style={[styles.summaryAmount, { color: colors.incomeGreen }]}>
          ${totalIncome.toFixed(2)}
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
            { color: transaction.type === 'income' ? colors.incomeGreen : colors.expenseRed }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
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
});

export default TransactionsScreen;
