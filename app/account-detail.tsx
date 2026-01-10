import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Account } from '@/db/schema/accounts';
import { AccountService } from '@/db/services/accountService';
import { ExpenseService } from '@/db/services/expenseService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const AccountDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const accountId = params.id as string;

  // State management
  const [account, setAccount] = useState<Account | null>(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'checking' as
      | 'checking'
      | 'savings'
      | 'credit_card'
      | 'cash'
      | 'investment'
      | 'loan'
      | 'other',
    balance: '',
    description: '',
  });

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    orange: '#FF9500',
    border: '#404348',
  };

  const accountTypes = [
    // {
    //   value: 'checking',
    //   label: 'Checking',
    //   icon: 'creditcard',
    //   color: colors.primaryBlue,
    // },
    {
      value: 'savings',
      label: 'Savings',
      icon: 'banknote',
      color: colors.green,
    },
    {
      value: 'credit_card',
      label: 'Credit Card',
      icon: 'creditcard.fill',
      color: colors.red,
    },
    { value: 'cash', label: 'Cash', icon: 'dollarsign', color: colors.orange },
    // {
    //   value: 'investment',
    //   label: 'Investment',
    //   icon: 'chart.line.uptrend.xyaxis',
    //   color: colors.primaryBlue,
    // },
    // {
    //   value: 'loan',
    //   label: 'Loan',
    //   icon: 'building.columns',
    //   color: colors.red,
    // },
    {
      value: 'other',
      label: 'Other',
      icon: 'ellipsis.circle',
      color: colors.border,
    },
  ];

  // Load account data
  const loadAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      const accountData = await AccountService.getById(accountId);

      if (!accountData) {
        Alert.alert('Error', 'Account not found');
        router.back();
        return;
      }

      setAccount(accountData);

      // Get transaction statistics
      const expenses = await ExpenseService.getByAccount(accountId);
      setTransactionCount(expenses.length);
      setTotalSpent(
        expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)
      );

      // Initialize edit form
      setEditForm({
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance?.toString() || '0',
        description: accountData.description || '',
      });
    } catch (error) {
      console.error('Failed to load account:', error);
      Alert.alert('Error', 'Failed to load account');
    } finally {
      setIsLoading(false);
    }
  }, [accountId, router]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleSave = async () => {
    try {
      if (!editForm.name.trim()) {
        Alert.alert('Error', 'Please enter an account name');
        return;
      }

      setIsLoading(true);
      await AccountService.update(accountId, {
        name: editForm.name.trim(),
        type: editForm.type,
        balance: parseFloat(editForm.balance) || 0,
        description: editForm.description.trim() || null,
      });

      setIsEditMode(false);
      await loadAccount();
    } catch (error) {
      console.error('Failed to update account:', error);
      Alert.alert('Error', 'Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Check if account has transactions
      if (transactionCount > 0) {
        Alert.alert(
          'Cannot Delete Account',
          'This account has transactions associated with it. Please move or delete the transactions first.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsLoading(true);
      await AccountService.delete(accountId);
      router.back();
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountTypeInfo = (type: string) => {
    return accountTypes.find((t) => t.value === type) || accountTypes[0];
  };

  const formatBalance = (balance: number | null): string => {
    if (balance === null || balance === undefined) return '$0.00';
    return `$${Math.abs(balance).toFixed(2)}`;
  };

  const getBalanceColor = (balance: number | null, type: string): string => {
    if (balance === null || balance === undefined) return colors.text;

    if (type === 'credit_card' || type === 'loan') {
      // For credit cards and loans, negative balance is good (you owe less)
      return balance < 0 ? colors.green : colors.red;
    } else {
      // For other accounts, positive balance is good
      return balance >= 0 ? colors.green : colors.red;
    }
  };

  if (isLoading || !account) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Loading account...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const accountTypeInfo = getAccountTypeInfo(account.type);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle='light-content' />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <IconSymbol name='chevron.left' size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditMode ? 'Edit Account' : 'Account Details'}
        </Text>
        <TouchableOpacity
          onPress={() => setIsEditMode(!isEditMode)}
          style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: colors.primaryBlue }]}>
            {isEditMode ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditMode ? (
          // Edit Mode
          <View style={styles.editContainer}>
            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Account Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, name: text }))
                }
                placeholder='Account name'
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Account Type
              </Text>
              <TouchableOpacity
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowTypePicker(true)}>
                <View style={styles.pickerContent}>
                  <View
                    style={[
                      styles.typeIcon,
                      {
                        backgroundColor:
                          getAccountTypeInfo(editForm.type).color + '20',
                      },
                    ]}>
                    <IconSymbol
                      name={getAccountTypeInfo(editForm.type).icon as any}
                      size={20}
                      color={getAccountTypeInfo(editForm.type).color}
                    />
                  </View>
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {getAccountTypeInfo(editForm.type).label}
                  </Text>
                </View>
                <IconSymbol
                  name='chevron.down'
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Balance
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editForm.balance}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, balance: text }))
                }
                placeholder='0.00'
                keyboardType='numeric'
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editForm.description}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, description: text }))
                }
                placeholder='Add notes about this account...'
                placeholderTextColor={colors.subText}
                multiline
                numberOfLines={4}
                textAlignVertical='top'
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primaryBlue },
              ]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor:
                    transactionCount > 0 ? colors.border : colors.red,
                },
              ]}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={transactionCount > 0}>
              <Text
                style={[
                  styles.deleteButtonText,
                  { color: transactionCount > 0 ? colors.subText : '#FFFFFF' },
                ]}>
                {transactionCount > 0
                  ? 'Cannot Delete (Has Transactions)'
                  : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // View Mode
          <View style={styles.viewContainer}>
            <View
              style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: accountTypeInfo.color + '20' },
                  ]}>
                  <IconSymbol
                    name={accountTypeInfo.icon as any}
                    size={24}
                    color={accountTypeInfo.color}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountType, { color: colors.subText }]}>
                    {accountTypeInfo.label}
                  </Text>
                </View>
                <View style={styles.cardHeaderBalance}>
                  <Text
                    style={[
                      styles.balanceAmount,
                      { color: getBalanceColor(account.balance, account.type) },
                    ]}>
                    {formatBalance(account.balance)}
                  </Text>
                  {(account.type === 'credit_card' ||
                    account.type === 'loan') &&
                    account.balance &&
                    account.balance > 0 && (
                      <Text style={[styles.balanceNote, { color: colors.red }]}>
                        Amount owed
                      </Text>
                    )}
                </View>
              </View>
            </View>

            <View
              style={[
                styles.statsCard,
                { backgroundColor: colors.cardBackground },
              ]}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>
                Usage Statistics
              </Text>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {transactionCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>
                    Transactions
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    ${totalSpent.toFixed(2)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>
                    Total Spent
                  </Text>
                </View>
              </View>
            </View>

            {account.description && (
              <View
                style={[
                  styles.detailsCard,
                  { backgroundColor: colors.cardBackground },
                ]}>
                <Text style={[styles.detailsTitle, { color: colors.text }]}>
                  Notes
                </Text>
                <Text
                  style={[styles.descriptionText, { color: colors.subText }]}>
                  {account.description}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Account Type Picker Modal */}
      <Modal visible={showTypePicker} transparent animationType='slide'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Account Type
            </Text>
            <ScrollView style={styles.modalScrollView}>
              {accountTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setEditForm((prev) => ({
                      ...prev,
                      type: type.value as any,
                    }));
                    setShowTypePicker(false);
                  }}>
                  <View style={styles.modalOptionContent}>
                    <View
                      style={[
                        styles.typeIcon,
                        { backgroundColor: type.color + '20' },
                      ]}>
                      <IconSymbol
                        name={type.icon as any}
                        size={20}
                        color={type.color}
                      />
                    </View>
                    <Text
                      style={[styles.modalOptionText, { color: colors.text }]}>
                      {type.label}
                    </Text>
                  </View>
                  {editForm.type === type.value && (
                    <IconSymbol
                      name='checkmark'
                      size={20}
                      color={colors.primaryBlue}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.modalCancelButton,
                { backgroundColor: colors.border },
              ]}
              onPress={() => setShowTypePicker(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType='fade'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.confirmModal,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>
              Delete Account
            </Text>
            <Text style={[styles.confirmText, { color: colors.subText }]}>
              {transactionCount > 0
                ? `Cannot delete &ldquo;${account.name}&rdquo; because it has ${transactionCount} transaction(s). Please move or delete the transactions first.`
                : `Are you sure you want to delete &ldquo;${account.name}&rdquo;? This action cannot be undone.`}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => setShowDeleteConfirm(false)}>
                <Text
                  style={[styles.confirmButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              {transactionCount === 0 && (
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.red },
                  ]}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    handleDelete();
                  }}>
                  <Text
                    style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  viewContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  accountName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
  },
  cardHeaderBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceNote: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  editContainer: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    marginLeft: 12,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404348',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalCancelButton: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmModal: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountDetailScreen;
