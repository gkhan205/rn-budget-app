import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Account } from '@/db/schema/accounts';
import { AccountService } from '@/db/services/accountService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AccountsManagerProps {
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
    background: string;
    red: string;
    green: string;
  };
}

const AccountsManager: React.FC<AccountsManagerProps> = ({ colors }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accounts
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const accountsData = await AccountService.getActive();
      setAccounts(accountsData);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const handleAddAccount = () => {
    router.push('/add-account');
  };

  const handleAccountPress = (account: Account) => {
    // TODO: Navigate to account details/edit screen
    console.log('Account pressed:', account.name);
  };

  const formatBalance = (balance: number): string => {
    const isNegative = balance < 0;
    return `${isNegative ? '-' : ''}$${Math.abs(balance).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const getAccountTypeDisplay = (type: string): string => {
    switch (type) {
      case 'checking':
        return 'Checking';
      case 'savings':
        return 'Savings';
      case 'credit_card':
        return 'Credit Card';
      case 'cash':
        return 'Cash';
      case 'investment':
        return 'Investment';
      case 'loan':
        return 'Loan';
      case 'other':
        return 'Other';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getAccountIcon = (type: string): string => {
    switch (type) {
      case 'checking':
      case 'savings':
        return 'building.columns.fill';
      case 'credit_card':
        return 'creditcard.fill';
      case 'cash':
        return 'banknote.fill';
      case 'investment':
        return 'chart.line.uptrend.xyaxis';
      case 'loan':
        return 'house.fill';
      case 'other':
      default:
        return 'wallet.pass.fill';
    }
  };

  const renderAccountItem = (item: Account) => {
    const isNegativeBalance = item.balance < 0;
    const accountIcon = item.icon || getAccountIcon(item.type);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.accountItem,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
        onPress={() => handleAccountPress(item)}>
        <View style={styles.accountLeft}>
          <View
            style={[
              styles.accountIcon,
              { backgroundColor: item.color + '20' },
            ]}>
            <IconSymbol
              name={accountIcon as any}
              size={20}
              color={item.color}
            />
          </View>
          <View style={styles.accountDetails}>
            <Text style={[styles.accountName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.accountType, { color: colors.subText }]}>
              {getAccountTypeDisplay(item.type)}
              {item.description ? ` • ${item.description}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.accountRight}>
          <Text
            style={[
              styles.accountBalance,
              { color: isNegativeBalance ? colors.red : colors.text },
            ]}>
            {formatBalance(item.balance)}
          </Text>
          <IconSymbol name='chevron.right' size={16} color={colors.subText} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Loading accounts...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: colors.primaryBlue },
            ]}
            onPress={loadAccounts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (accounts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol
            name='creditcard'
            size={48}
            color={colors.subText}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Accounts
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
            Add your bank accounts, credit cards, and other financial accounts
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {accounts.map(renderAccountItem)}
      </View>
    );
  };

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>Accounts</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            {accounts.length} accounts • Total: {formatBalance(totalBalance)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primaryBlue }]}
          onPress={handleAddAccount}>
          <IconSymbol name='plus' size={20} color='#FFFFFF' />
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    gap: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  accountLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '400',
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountsManager;
