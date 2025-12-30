import { IconSymbol } from '@/components/ui/icon-symbol';
import { AccountService } from '@/db/services/accountService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const AddRecurringScreen: React.FC = () => {
  const router = useRouter();

  // Form state
  const [amount, setAmount] = useState('0.00');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('monthly');
  const [dueDate, setDueDate] = useState('1');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [autoAddExpense, setAutoAddExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Data
  const [accounts, setAccounts] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const accountsData = await AccountService.getActive();
        setAccounts(accountsData);

        // Set default account if available
        if (accountsData.length > 0 && !accountId) {
          setAccountId(accountsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        Alert.alert('Error', 'Failed to load required data');
      }
    };

    loadInitialData();
  }, [accountId]);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    border: '#404348',
    inputBackground: '#2A2D32',
    placeholder: '#666666',
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the recurring expense');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!accountId) {
      Alert.alert('Error', 'Please select an account');
      return;
    }

    try {
      setIsLoading(true);

      // Calculate next due date based on frequency
      const nextDueDate = calculateNextDueDate(frequency, parseInt(dueDate));

      const newRecurringExpense = {
        budgetId: null, // Don't auto-assign to any budget
        accountId,
        name: name.trim(),
        amount: parseFloat(amount),
        frequency,
        startDate: new Date(),
        nextDueDate,
        description: notes.trim() || undefined,
        autoAdd: autoAddExpense,
        isActive: true,
      };

      await RecurringExpenseService.create(newRecurringExpense);
      router.back();
    } catch (error) {
      console.error('Failed to save recurring expense:', error);
      Alert.alert(
        'Error',
        'Failed to save recurring expense. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextDueDate = (freq: string, dayOfMonth: number): Date => {
    const now = new Date();
    const nextDate = new Date(now);

    switch (freq) {
      case 'daily':
        nextDate.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + 1);
        nextDate.setDate(
          Math.min(
            dayOfMonth,
            new Date(
              nextDate.getFullYear(),
              nextDate.getMonth() + 1,
              0
            ).getDate()
          )
        );
        break;
      case 'yearly':
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        nextDate.setDate(now.getDate() + 1);
    }

    return nextDate;
  };

  const getOrdinalSuffix = (num: number): string => {
    const remainder = num % 100;
    if (remainder >= 11 && remainder <= 13) {
      return 'th';
    }
    switch (num % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const getSelectedAccountName = (): string => {
    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    return selectedAccount?.name || 'Select Account';
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle='light-content' backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: colors.primaryBlue }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Add Recurring
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Amount Section */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.subText }]}>
              Amount
            </Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: colors.subText }]}>
                $
              </Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType='numeric'
                placeholder='0.00'
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.primaryBlue}
              />
            </View>
          </View>

          {/* Name Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              Name
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}>
              <IconSymbol
                name='pencil'
                size={20}
                color={colors.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder='e.g. Netflix, Rent'
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.primaryBlue}
              />
            </View>
          </View>

          {/* Frequency and Due Date Row */}
          <View style={styles.rowSection}>
            <View style={[styles.halfInput, { marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>
                Frequency
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectorContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowFrequencyPicker(true)}>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </Text>
                <IconSymbol
                  name='chevron.down'
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.halfInput, { marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>
                {frequency === 'monthly'
                  ? 'Day of Month'
                  : frequency === 'weekly'
                  ? 'Day of Week'
                  : 'Days'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectorContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowDueDatePicker(true)}>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {frequency === 'monthly'
                    ? `${dueDate}${getOrdinalSuffix(parseInt(dueDate))}`
                    : dueDate}
                </Text>
                <IconSymbol name='calendar' size={16} color={colors.subText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              Account
            </Text>
            <TouchableOpacity
              style={[
                styles.accountContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowAccountPicker(true)}>
              <View style={styles.accountLeft}>
                <IconSymbol
                  name='creditcard.fill'
                  size={20}
                  color={colors.primaryBlue}
                  style={styles.accountIcon}
                />
                <Text style={[styles.accountText, { color: colors.text }]}>
                  {getSelectedAccountName()}
                </Text>
              </View>
              <IconSymbol
                name='chevron.down'
                size={16}
                color={colors.subText}
              />
            </TouchableOpacity>
          </View>

          {/* Notes Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              Notes
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder='Add details (optional)'
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical='top'
              selectionColor={colors.primaryBlue}
            />
          </View>

          {/* Auto-add Toggle Section */}
          <View
            style={[
              styles.toggleSection,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.toggleLeft}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Auto-add Expense
              </Text>
              <Text style={[styles.toggleSubtitle, { color: colors.subText }]}>
                Automatically create transaction on due date
              </Text>
            </View>
            <Switch
              value={autoAddExpense}
              onValueChange={setAutoAddExpense}
              trackColor={{ false: colors.border, true: colors.primaryBlue }}
              thumbColor={autoAddExpense ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* Bottom spacing for keyboard */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Save Button */}
        <View
          style={[
            styles.saveButtonContainer,
            { backgroundColor: colors.background },
          ]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primaryBlue }]}
            onPress={handleSave}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator
                size='small'
                color='#FFFFFF'
                style={styles.saveIcon}
              />
            ) : (
              <IconSymbol
                name='checkmark'
                size={20}
                color='#FFFFFF'
                style={styles.saveIcon}
              />
            )}
            <Text style={styles.saveButtonText}>Save Recurring Expense</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Frequency Picker Modal */}
      <Modal visible={showFrequencyPicker} transparent animationType='slide'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Frequency
            </Text>
            {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setFrequency(freq as any);
                  setDueDate('1'); // Reset due date when frequency changes
                  setShowFrequencyPicker(false);
                }}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
                {frequency === freq && (
                  <IconSymbol
                    name='checkmark'
                    size={20}
                    color={colors.primaryBlue}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.modalCancelButton,
                { backgroundColor: colors.border },
              ]}
              onPress={() => setShowFrequencyPicker(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Due Date Picker Modal */}
      <Modal visible={showDueDatePicker} transparent animationType='slide'>
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {frequency === 'monthly' ? 'Select Day of Month' : 'Select Days'}
            </Text>
            <ScrollView style={styles.modalScrollView}>
              {getDueDateOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setDueDate(option.value);
                    setShowDueDatePicker(false);
                  }}>
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  {dueDate === option.value && (
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
              onPress={() => setShowDueDatePicker(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setAccountId(account.id);
                    setShowAccountPicker(false);
                  }}>
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  {accountId === account.id && (
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
    </SafeAreaView>
  );
};

const getDueDateOptions = () => {
  const options = [];
  for (let i = 1; i <= 31; i++) {
    options.push({
      value: i.toString(),
      label: `${i}${getOrdinalSuffix(i)}`,
    });
  }
  return options;
};

const getOrdinalSuffix = (num: number): string => {
  const remainder = num % 100;
  if (remainder >= 11 && remainder <= 13) {
    return 'th';
  }
  switch (num % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
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
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60, // Balance the cancel button width
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '300',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'left',
    minWidth: 120,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  rowSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  halfInput: {
    flex: 1,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorText: {
    fontSize: 16,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    marginRight: 12,
  },
  accountText: {
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  toggleLeft: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 13,
  },
  bottomSpacing: {
    height: 100, // Space for save button
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Account for home indicator
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
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
});

export default AddRecurringScreen;
