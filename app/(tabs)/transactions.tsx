import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import MainLayout from '@/components/MainLayout';
import { TransactionFilters, TransactionList, TransactionSummary } from '@/components/transaction';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExpenseService } from '@/db/services/expenseService';
import useTransactions, { type TransactionItem } from '@/hooks/useTransactions';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TransactionsScreen: React.FC = () => {
  const router = useRouter();
  
  // Use custom hook for transactions management
  const {
    data,
    filters,
    updateFilter,
    clearFilters,
    refresh,
  } = useTransactions();

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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleFilterPress = () => {
    // TODO: Show comprehensive filter modal with date range, etc.
    console.log('Show advanced filters');
  };

  const handleAddTransaction = () => {
    router.push('/add-transaction' as any);
  };

  const handleEditTransaction = (transaction: TransactionItem) => {
    // Navigate to edit transaction screen with transaction data
    router.push({
      pathname: '/add-transaction' as any,
      params: {
        editMode: 'true',
        transactionId: transaction.id,
        name: transaction.name,
        amount: transaction.amount.toString(),
        category: transaction.category,
        budgetId: transaction.budgetId,
        accountId: transaction.accountId || '',
        notes: transaction.notes || '',
      },
    });
  };

  const handleDeleteTransaction = async (transaction: TransactionItem) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.name}"?`,
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
              await ExpenseService.delete(transaction.id);
              refresh(); // Refresh the data after deletion
            } catch (error) {
              console.error('Failed to delete transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
      {/* <TouchableOpacity onPress={handleFilterPress} style={styles.searchButton}>
        <IconSymbol name="magnifyingglass" size={24} color={colors.text} />
      </TouchableOpacity> */}
    </View>
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        {data.isLoading ? (
          <LoadingState 
            colors={colors} 
            message="Loading transactions..." 
          />
        ) : data.error ? (
          <ErrorState 
            error={data.error}
            onRetry={refresh}
            colors={colors}
          />
        ) : (
          <>
            <TransactionFilters
              filters={filters}
              budgets={data.budgets}
              accounts={data.accounts}
              categories={data.categories}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              colors={colors}
            />
            
            <TransactionSummary
              totalIncome={data.totalIncome}
              totalExpense={data.totalExpense}
              colors={colors}
            />
            
            <TransactionList
              transactionGroups={data.transactionGroups}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              colors={{ ...colors, background: colors.background }}
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
  addButton: {
    position: 'absolute',
    bottom: 20, // Positioned to accommodate the tab bar
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
