import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Account } from '@/db/schema/accounts';
import type { RecurringExpense } from '@/db/schema/recurringExpenses';
import { AccountService } from '@/db/services/accountService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { useCurrencyFormatter } from '@/hooks';
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

const SelectRecurringExpenseScreen: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const router = useRouter();
  const params = useLocalSearchParams();
  const budgetId = params.budgetId as string;
  const budgetName = params.budgetName as string;

  // State management
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set()
  );

  // Create new recurring expense form
  const [createForm, setCreateForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    accountId: '',
    description: '',
    autoAdd: false,
  });

  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    border: '#404348',
    orange: '#FF9500',
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [unassignedExpenses, activeAccounts] = await Promise.all([
        RecurringExpenseService.getUnassigned(),
        AccountService.getActive(),
      ]);

      setRecurringExpenses(unassignedExpenses);
      setAccounts(activeAccounts);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load recurring expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle selection
  const toggleSelection = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  // Assign selected expenses to budget
  const handleAssignSelected = async () => {
    if (selectedExpenses.size === 0) {
      Alert.alert(
        'No Selection',
        'Please select at least one recurring expense to add to the budget.'
      );
      return;
    }

    try {
      setIsLoading(true);

      // Assign each selected expense to the budget
      const assignPromises = Array.from(selectedExpenses).map((expenseId) =>
        RecurringExpenseService.assignToBudget(expenseId, budgetId)
      );

      await Promise.all(assignPromises);

      Alert.alert(
        'Success',
        `${selectedExpenses.size} recurring expense(s) added to ${budgetName}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to assign expenses:', error);
      Alert.alert('Error', 'Failed to add recurring expenses to budget');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new recurring expense
  const handleCreateNew = async () => {
    try {
      if (
        !createForm.name.trim() ||
        !createForm.amount ||
        parseFloat(createForm.amount) <= 0
      ) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setIsLoading(true);

      await RecurringExpenseService.create({
        name: createForm.name.trim(),
        amount: parseFloat(createForm.amount),
        frequency: createForm.frequency,
        startDate: new Date(), // Set start date to today
        budgetId: budgetId, // Automatically assign to this budget
        accountId: createForm.accountId || null,
        description: createForm.description.trim() || null,
        autoAdd: createForm.autoAdd,
        nextDueDate: new Date(), // Set to today for immediate availability
      });

      setShowCreateModal(false);
      Alert.alert(
        'Success',
        `"${createForm.name}" created and added to ${budgetName}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to create recurring expense:', error);
      Alert.alert('Error', 'Failed to create recurring expense');
    } finally {
      setIsLoading(false);
    }
  };

  // Format display values
  const formatAmount = (amount: number): string => {
    return format(amount);
  };

  const getFrequencyLabel = (frequency: string): string => {
    const option = frequencyOptions.find((opt) => opt.value === frequency);
    return option?.label || frequency;
  };

  const getAccountName = (accountId: string | null): string => {
    if (!accountId) return 'No account';
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.name || 'Unknown account';
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Loading recurring expenses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Add Recurring Expense
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}>
          <IconSymbol name='plus' size={20} color={colors.primaryBlue} />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Select existing expenses or create a new one for &ldquo;{budgetName}
          &rdquo;
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {recurringExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name='arrow.clockwise'
              size={48}
              color={colors.border}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Unassigned Recurring Expenses
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              All your recurring expenses are already assigned to budgets.
              Create a new one to add to this budget.
            </Text>
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.primaryBlue },
              ]}
              onPress={() => setShowCreateModal(true)}>
              <Text style={styles.createButtonText}>Create New Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Unassigned Recurring Expenses ({recurringExpenses.length})
            </Text>

            {recurringExpenses.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                style={[
                  styles.expenseCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: selectedExpenses.has(expense.id)
                      ? colors.primaryBlue
                      : colors.border,
                  },
                ]}
                onPress={() => toggleSelection(expense.id)}>
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseName, { color: colors.text }]}>
                      {expense.name}
                    </Text>
                    <Text
                      style={[
                        styles.expenseDetails,
                        { color: colors.subText },
                      ]}>
                      {formatAmount(expense.amount)} •{' '}
                      {getFrequencyLabel(expense.frequency)}
                    </Text>
                  </View>
                  <View style={styles.expenseActions}>
                    <Text
                      style={[styles.expenseAmount, { color: colors.text }]}>
                      {formatAmount(expense.amount)}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: selectedExpenses.has(expense.id)
                            ? colors.primaryBlue
                            : 'transparent',
                          borderColor: selectedExpenses.has(expense.id)
                            ? colors.primaryBlue
                            : colors.border,
                        },
                      ]}>
                      {selectedExpenses.has(expense.id) && (
                        <IconSymbol
                          name='checkmark'
                          size={16}
                          color='#FFFFFF'
                        />
                      )}
                    </View>
                  </View>
                </View>
                {expense.description && (
                  <Text
                    style={[
                      styles.expenseDescription,
                      { color: colors.subText },
                    ]}>
                    {expense.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {selectedExpenses.size > 0 && (
              <TouchableOpacity
                style={[
                  styles.assignButton,
                  { backgroundColor: colors.primaryBlue },
                ]}
                onPress={handleAssignSelected}>
                <Text style={styles.assignButtonText}>
                  Add {selectedExpenses.size} Expense
                  {selectedExpenses.size !== 1 ? 's' : ''} to Budget
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create New Modal */}
      <Modal visible={showCreateModal} transparent animationType='slide'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create New Recurring Expense
            </Text>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}>
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={createForm.name}
                  onChangeText={(text) =>
                    setCreateForm((prev) => ({ ...prev, name: text }))
                  }
                  placeholder='Expense name'
                  placeholderTextColor={colors.subText}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Amount *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={createForm.amount}
                  onChangeText={(text) =>
                    setCreateForm((prev) => ({ ...prev, amount: text }))
                  }
                  placeholder='0.00'
                  keyboardType='numeric'
                  placeholderTextColor={colors.subText}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Frequency
                </Text>
                <TouchableOpacity
                  style={[
                    styles.picker,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowFrequencyPicker(true)}>
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {getFrequencyLabel(createForm.frequency)}
                  </Text>
                  <IconSymbol
                    name='chevron.down'
                    size={16}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Account (Optional)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.picker,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowAccountPicker(true)}>
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {getAccountName(createForm.accountId)}
                  </Text>
                  <IconSymbol
                    name='chevron.down'
                    size={16}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Description (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={createForm.description}
                  onChangeText={(text) =>
                    setCreateForm((prev) => ({ ...prev, description: text }))
                  }
                  placeholder='Add notes...'
                  placeholderTextColor={colors.subText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical='top'
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowCreateModal(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primaryBlue },
                ]}
                onPress={handleCreateNew}>
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Create & Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Frequency Picker Modal */}
      <Modal visible={showFrequencyPicker} transparent animationType='fade'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.pickerModal,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.pickerModalTitle, { color: colors.text }]}>
              Select Frequency
            </Text>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setCreateForm((prev) => ({
                    ...prev,
                    frequency: option.value as any,
                  }));
                  setShowFrequencyPicker(false);
                }}>
                <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                  {option.label}
                </Text>
                {createForm.frequency === option.value && (
                  <IconSymbol
                    name='checkmark'
                    size={20}
                    color={colors.primaryBlue}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Account Picker Modal */}
      <Modal visible={showAccountPicker} transparent animationType='fade'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.pickerModal,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.pickerModalTitle, { color: colors.text }]}>
              Select Account
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                setCreateForm((prev) => ({ ...prev, accountId: '' }));
                setShowAccountPicker(false);
              }}>
              <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                No account
              </Text>
              {createForm.accountId === '' && (
                <IconSymbol
                  name='checkmark'
                  size={20}
                  color={colors.primaryBlue}
                />
              )}
            </TouchableOpacity>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setCreateForm((prev) => ({ ...prev, accountId: account.id }));
                  setShowAccountPicker(false);
                }}>
                <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                  {account.name}
                </Text>
                {createForm.accountId === account.id && (
                  <IconSymbol
                    name='checkmark'
                    size={20}
                    color={colors.primaryBlue}
                  />
                )}
              </TouchableOpacity>
            ))}
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
  addButton: {
    padding: 8,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  expenseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 14,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseDescription: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  assignButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#FFFFFF',
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
    maxHeight: '90%',
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
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  inputSection: {
    marginBottom: 16,
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
  pickerText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModal: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404348',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
});

export default SelectRecurringExpenseScreen;
