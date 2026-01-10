import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RecurringExpense } from '@/db/schema/recurringExpenses';
import { AccountService } from '@/db/services/accountService';
import { BudgetService } from '@/db/services/budgetService';
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

const RecurringDetailScreen: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const router = useRouter();
  const params = useLocalSearchParams();
  const recurringId = params.id as string;

  // State management
  const [recurringExpense, setRecurringExpense] =
    useState<RecurringExpense | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    accountId: '',
    budgetId: '',
    description: '',
    autoAdd: false,
  });

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

  // Load recurring expense data
  const loadRecurringExpense = useCallback(async () => {
    try {
      setIsLoading(true);
      const [expense, accountsData, budgetsData] = await Promise.all([
        RecurringExpenseService.getById(recurringId),
        AccountService.getActive(),
        BudgetService.getActive(),
      ]);

      if (!expense) {
        Alert.alert('Error', 'Recurring expense not found');
        router.back();
        return;
      }

      setRecurringExpense(expense);
      setAccounts(accountsData);
      setBudgets(budgetsData);

      // Initialize edit form
      setEditForm({
        name: expense.name,
        amount: expense.amount.toString(),
        frequency: expense.frequency,
        accountId: expense.accountId || '',
        budgetId: expense.budgetId || '',
        description: expense.description || '',
        autoAdd: expense.autoAdd || false,
      });
    } catch (error) {
      console.error('Failed to load recurring expense:', error);
      Alert.alert('Error', 'Failed to load recurring expense');
    } finally {
      setIsLoading(false);
    }
  }, [recurringId, router]);

  useEffect(() => {
    loadRecurringExpense();
  }, [loadRecurringExpense]);

  const handleSave = async () => {
    try {
      if (
        !editForm.name.trim() ||
        !editForm.amount ||
        parseFloat(editForm.amount) <= 0
      ) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setIsLoading(true);
      await RecurringExpenseService.update(recurringId, {
        name: editForm.name.trim(),
        amount: parseFloat(editForm.amount),
        frequency: editForm.frequency,
        accountId: editForm.accountId || null,
        budgetId: editForm.budgetId || null,
        description: editForm.description.trim() || null,
        autoAdd: editForm.autoAdd,
      });

      setIsEditMode(false);
      await loadRecurringExpense();
    } catch (error) {
      console.error('Failed to update recurring expense:', error);
      Alert.alert('Error', 'Failed to update recurring expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await RecurringExpenseService.delete(recurringId);
      router.back();
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
      Alert.alert('Error', 'Failed to delete recurring expense');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNextDueDate = (date: Date | string | null): string => {
    if (!date) return 'No due date';
    const nextDate = new Date(date);
    const now = new Date();
    const timeDiff = nextDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return 'Due tomorrow';
    return `Due in ${daysDiff} days`;
  };

  const getAccountName = (accountId: string | null): string => {
    if (!accountId) return 'No account selected';
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.name || 'Unknown account';
  };

  const getBudgetName = (budgetId: string | null): string => {
    if (!budgetId) return 'Not assigned to budget';
    const budget = budgets.find((b) => b.id === budgetId);
    return budget?.name || 'Unknown budget';
  };

  if (isLoading || !recurringExpense) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Loading recurring expense...
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
          {isEditMode ? 'Edit Recurring' : 'Recurring Expense'}
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
              <Text style={[styles.label, { color: colors.text }]}>Name</Text>
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
                placeholder='Expense name'
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editForm.amount}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, amount: text }))
                }
                placeholder='0.00'
                keyboardType='numeric'
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Account
              </Text>
              <TouchableOpacity
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowAccountPicker(true)}>
                <Text style={[styles.pickerText, { color: colors.text }]}>
                  {getAccountName(editForm.accountId)}
                </Text>
                <IconSymbol
                  name='chevron.down'
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>Budget</Text>
              <TouchableOpacity
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowBudgetPicker(true)}>
                <Text style={[styles.pickerText, { color: colors.text }]}>
                  {getBudgetName(editForm.budgetId)}
                </Text>
                <IconSymbol
                  name='chevron.down'
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
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
              style={[styles.deleteButton, { backgroundColor: colors.red }]}
              onPress={() => setShowDeleteConfirm(true)}>
              <Text style={styles.deleteButtonText}>
                Delete Recurring Expense
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
                    { backgroundColor: colors.primaryBlue + '20' },
                  ]}>
                  <IconSymbol
                    name='arrow.clockwise'
                    size={24}
                    color={colors.primaryBlue}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.expenseName, { color: colors.text }]}>
                    {recurringExpense.name}
                  </Text>
                  <Text
                    style={[
                      styles.expenseFrequency,
                      { color: colors.subText },
                    ]}>
                    {recurringExpense.frequency.charAt(0).toUpperCase() +
                      recurringExpense.frequency.slice(1)}
                  </Text>
                </View>
                <View style={styles.cardHeaderAmount}>
                  <Text style={[styles.expenseAmount, { color: colors.text }]}>
                    {format(recurringExpense.amount)}
                  </Text>
                  <Text style={[styles.dueDate, { color: colors.subText }]}>
                    {formatNextDueDate(recurringExpense.nextDueDate)}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.detailsCard,
                { backgroundColor: colors.cardBackground },
              ]}>
              <Text style={[styles.detailsTitle, { color: colors.text }]}>
                Details
              </Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subText }]}>
                  Account
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {getAccountName(recurringExpense.accountId)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subText }]}>
                  Budget
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {getBudgetName(recurringExpense.budgetId)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subText }]}>
                  Auto-add
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: recurringExpense.autoAdd
                        ? colors.green
                        : colors.red,
                    },
                  ]}>
                  {recurringExpense.autoAdd ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              {recurringExpense.description && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.subText }]}>
                    Notes
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {recurringExpense.description}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Account Picker Modal */}
      <Modal visible={showAccountPicker} transparent animationType='slide'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Account
            </Text>
            <ScrollView style={styles.modalScrollView}>
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setEditForm((prev) => ({ ...prev, accountId: '' }));
                  setShowAccountPicker(false);
                }}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  No account
                </Text>
              </TouchableOpacity>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setEditForm((prev) => ({ ...prev, accountId: account.id }));
                    setShowAccountPicker(false);
                  }}>
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  {editForm.accountId === account.id && (
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
              onPress={() => setShowAccountPicker(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Budget Picker Modal */}
      <Modal visible={showBudgetPicker} transparent animationType='slide'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Budget
            </Text>
            <ScrollView style={styles.modalScrollView}>
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setEditForm((prev) => ({ ...prev, budgetId: '' }));
                  setShowBudgetPicker(false);
                }}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  No budget assigned
                </Text>
              </TouchableOpacity>
              {budgets.map((budget) => (
                <TouchableOpacity
                  key={budget.id}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setEditForm((prev) => ({ ...prev, budgetId: budget.id }));
                    setShowBudgetPicker(false);
                  }}>
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}>
                    {budget.name}
                  </Text>
                  {editForm.budgetId === budget.id && (
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
              onPress={() => setShowBudgetPicker(false)}>
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
              Delete Recurring Expense
            </Text>
            <Text style={[styles.confirmText, { color: colors.subText }]}>
              Are you sure you want to delete &ldquo;{recurringExpense.name}
              &rdquo;? This action cannot be undone.
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
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.red }]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}>
                <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
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
  expenseName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseFrequency: {
    fontSize: 14,
  },
  cardHeaderAmount: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
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
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
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

export default RecurringDetailScreen;
