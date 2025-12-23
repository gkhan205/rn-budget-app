import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string;
  iconColor: string;
  isNegative?: boolean;
}

const AccountsScreen: React.FC = () => {

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    border: '#404348',
  };

  // Sample accounts data based on the design
  const accounts: Account[] = [
    {
      id: '1',
      name: 'My Wallet',
      type: 'Cash on hand',
      balance: 150.00,
      icon: 'creditcard.fill',
      iconColor: '#2ECC71',
    },
    {
      id: '2',
      name: 'Petty Cash',
      type: 'Emergency fund',
      balance: 340.00,
      icon: 'banknote.fill',
      iconColor: '#2ECC71',
    },
    {
      id: '3',
      name: 'Chase Checking',
      type: '**** 8842',
      balance: 2450.00,
      icon: 'building.columns.fill',
      iconColor: '#4A9EFF',
    },
    {
      id: '4',
      name: 'High Yield Sav...',
      type: 'APY 4.5%',
      balance: 10000.00,
      icon: 'piggybank.fill',
      iconColor: '#8B5CF6',
    },
    {
      id: '5',
      name: 'Amex Platinum',
      type: 'Statement closing soon',
      balance: -490.00,
      icon: 'creditcard.fill',
      iconColor: '#E74C3C',
      isNegative: true,
    },
  ];

  const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);

  const handleAddAccount = () => {
    // TODO: Navigate to add account screen
    console.log('Add new account');
  };

  const handleAccountPress = (account: Account) => {
    // TODO: Navigate to account details
    console.log('Account pressed:', account.name);
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Accounts</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="eye.fill" size={20} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {/* TODO: Toggle edit mode */}}
        >
          <Text style={[styles.editText, { color: colors.primaryBlue }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNetWorth = () => (
    <View style={styles.netWorthContainer}>
      <Text style={[styles.netWorthLabel, { color: colors.subText }]}>NET WORTH</Text>
      <Text style={[styles.netWorthAmount, { color: colors.text }]}>
        ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      <View style={[styles.assetsChip, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.assetsLabel, { color: colors.subText }]}>Total Assets</Text>
        <View style={styles.assetsValue}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={12} color={colors.green} />
          <Text style={[styles.assetsPercent, { color: colors.green }]}>+2.4%</Text>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.subText }]}>{title}</Text>
    </View>
  );

  const renderAccountItem = ({ item }: { item: Account }) => (
    <TouchableOpacity 
      style={[styles.accountCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleAccountPress(item)}
    >
      <View style={[styles.accountIcon, { backgroundColor: item.iconColor + '20' }]}>
        <IconSymbol 
          name={item.icon as any} 
          size={24} 
          color={item.iconColor} 
        />
      </View>
      
      <View style={styles.accountDetails}>
        <Text style={[styles.accountName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.accountType, { color: colors.subText }]}>
          {item.type}
        </Text>
      </View>
      
      <View style={styles.accountBalance}>
        <Text style={[
          styles.balanceAmount,
          { color: item.isNegative ? colors.red : colors.text }
        ]}>
          {item.isNegative ? '-' : ''}${Math.abs(item.balance).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </Text>
        <IconSymbol name="chevron.right" size={16} color={colors.subText} />
      </View>
    </TouchableOpacity>
  );

  const getCashAccounts = () => accounts.filter(acc => acc.icon === 'creditcard.fill' || acc.icon === 'banknote.fill');
  const getBankAccounts = () => accounts.filter(acc => acc.icon === 'building.columns.fill' || acc.icon === 'piggybank.fill');
  const getCreditAccounts = () => accounts.filter(acc => acc.isNegative);

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        {renderNetWorth()}
        
        <FlatList
          style={styles.accountsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {renderSectionHeader('CASH')}
              {getCashAccounts().map(account => (
                <View key={account.id}>
                  {renderAccountItem({ item: account })}
                </View>
              ))}
              
              {renderSectionHeader('BANK ACCOUNTS')}
              {getBankAccounts().map(account => (
                <View key={account.id}>
                  {renderAccountItem({ item: account })}
                </View>
              ))}
              
              {renderSectionHeader('CREDIT CARDS')}
              {getCreditAccounts().map(account => (
                <View key={account.id}>
                  {renderAccountItem({ item: account })}
                </View>
              ))}
            </>
          }
        />

        {/* Floating Add Button */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primaryBlue }]}
          onPress={handleAddAccount}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  editText: {
    fontSize: 16,
    fontWeight: '500',
  },
  netWorthContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  netWorthLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  netWorthAmount: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 16,
  },
  assetsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  assetsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  assetsValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assetsPercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  accountsList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  accountBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
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

export default AccountsScreen;
