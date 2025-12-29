import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Account } from '@/db/schema/accounts';
import type { Budget } from '@/db/schema/budgets';
import { AccountService } from '@/db/services/accountService';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { IncomeService } from '@/db/services/incomeService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const AddTransactionScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Check if we're in edit mode
  const isEditMode = params.editMode === 'true';
  const transactionId = params.transactionId as string;
  
  // Form state
  const [transactionType, setTransactionType] = useState<'Expense' | 'Income' | 'Transfer'>('Expense');
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: '1',
    name: 'Food',
    icon: '🍔',
    color: '#4A9EFF'
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data state
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Category options
  const categories: Category[] = [
    { id: '1', name: 'Food', icon: '🍔', color: '#4A9EFF' },
    { id: '2', name: 'Transport', icon: '🚗', color: '#E74C3C' },
    { id: '3', name: 'Shopping', icon: '🛍️', color: '#A0D4FF' },
    { id: '4', name: 'Housing', icon: '🏠', color: '#FF8A4A' },
    { id: '5', name: 'Fun', icon: '🎬', color: '#9BA1A6' },
    { id: '6', name: 'Health', icon: '💊', color: '#F1C40F' },
    { id: '7', name: 'Education', icon: '🎓', color: '#E67E22' },
    { id: '8', name: 'Miscellaneous', icon: '📦', color: '#666666' },
  ];

  // Load budgets and accounts data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [budgetsData, accountsData] = await Promise.all([
        BudgetService.getActive(),
        AccountService.getActive(),
      ]);

      setBudgets(budgetsData);
      setAccounts(accountsData);

      // Auto-select first budget if available (required)
      if (budgetsData.length > 0 && !selectedBudget) {
        setSelectedBudget(budgetsData[0]);
      }

    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load budgets and accounts');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBudget]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Load existing transaction data when in edit mode
  useEffect(() => {
    const loadEditData = async () => {
      if (isEditMode && transactionId) {
        try {
          // Try to load as expense first, then as income
          let expenseTransaction = await ExpenseService.getById(transactionId);
          let incomeTransaction = null;
          let isIncomeTransaction = false;
          
          if (!expenseTransaction) {
            // Try loading as income
            incomeTransaction = await IncomeService.getById(transactionId);
            isIncomeTransaction = true;
          }
          
          const transaction = expenseTransaction || incomeTransaction;
          
          if (transaction) {
            // Set amount as absolute value for the input field
            setAmount(Math.abs(transaction.amount).toString());
            setDescription(transaction.description || '');
            
            // Find and set the correct budget
            if (transaction.budgetId && budgets.length > 0) {
              const budget = budgets.find(b => b.id === transaction.budgetId);
              if (budget) {
                setSelectedBudget(budget);
              }
            }
            
            // Find and set the correct account  
            if (transaction.accountId && accounts.length > 0) {
              const account = accounts.find(a => a.id === transaction.accountId);
              if (account) {
                setSelectedAccount(account);
              }
            }
            
            // Set transaction type based on the table it came from
            if (isIncomeTransaction) {
              setTransactionType('Income');
            } else {
              // For expenses, check if it's negative (expense/transfer) or positive (legacy income)
              if (transaction.amount < 0) {
                setTransactionType('Expense');
              } else {
                setTransactionType('Income');
              }
            }
            
            // Set date
            if (transaction.date) {
              setSelectedDate(new Date(transaction.date));
            }
            
            // Set category if available (only for expenses)
            if (!isIncomeTransaction && expenseTransaction?.category) {
              // Create a simple category object from the stored string
              setSelectedCategory({
                id: expenseTransaction.category,
                name: expenseTransaction.category,
                icon: '💰', // Default icon
                color: '#007AFF' // Default color
              });
            }
          }
        } catch (error) {
          console.error('Failed to load transaction for edit:', error);
          Alert.alert('Error', 'Failed to load transaction data');
        }
      }
    };

    loadEditData();
  }, [isEditMode, transactionId, budgets, accounts]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
    if (!selectedBudget) {
      Alert.alert('Error', 'Please select a budget');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setIsSaving(true);
      
      if (transactionType === 'Income') {
        // Handle income transactions
        const incomeData = {
          budgetId: selectedBudget.id,
          accountId: selectedAccount?.id || null,
          amount: amountValue, // Always positive for income
          description: description.trim(),
          date: selectedDate,
          source: 'Manual Entry', // You could make this configurable
          isRecurring: false,
          recurringIncomeId: null,
          tags: null,
          notes: notes.trim() || null,
        };

        if (isEditMode && transactionId) {
          // For edit mode, we need to handle the case where transaction type might have changed
          // First, try to find and delete the old transaction
          const oldExpense = await ExpenseService.getById(transactionId);
          const oldIncome = await IncomeService.getById(transactionId);
          
          if (oldExpense) {
            // Delete old expense record
            await ExpenseService.delete(transactionId);
            // If it was an expense but user selected income, we'll create new income
          }
          
          if (oldIncome) {
            // Delete old income record
            await IncomeService.delete(transactionId);
            // Remove the old income from budget
            await BudgetService.addIncome(selectedBudget.id, -oldIncome.amount);
          }
          
          // Create new income
          await IncomeService.create(incomeData);
        } else {
          await IncomeService.create(incomeData);
        }
        
        // Add income to budget
        await BudgetService.addIncome(selectedBudget.id, amountValue);
        
      } else {
        // Handle expense and transfer transactions
        const expenseData = {
          budgetId: selectedBudget.id,
          accountId: selectedAccount?.id || null,
          categoryId: null, // Using legacy category field for now
          amount: -Math.abs(amountValue), // Always negative for expenses/transfers
          description: description.trim(),
          date: selectedDate,
          category: selectedCategory.name,
          isRecurring: false,
          recurringExpenseId: null,
          tags: null,
          notes: notes.trim() || null,
        };

        if (isEditMode && transactionId) {
          // For edit mode, handle transaction type changes
          const oldExpense = await ExpenseService.getById(transactionId);
          const oldIncome = await IncomeService.getById(transactionId);
          
          if (oldIncome) {
            // Remove old income from budget first
            await BudgetService.addIncome(selectedBudget.id, -oldIncome.amount);
            // Delete old income record
            await IncomeService.delete(transactionId);
          }
          
          if (oldExpense) {
            // Update existing expense
            await ExpenseService.update(transactionId, expenseData);
          } else {
            // Create new expense (was previously income)
            await ExpenseService.create(expenseData);
          }
        } else {
          // Create new expense
          await ExpenseService.create(expenseData);
        }
      }

      Alert.alert('Success', `Transaction ${isEditMode ? 'updated' : 'added'} successfully`, [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (err) {
      console.error('Failed to save transaction:', err);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'save'} transaction. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDateSelect = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <IconSymbol name="xmark" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
      </Text>
      
      <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.primaryBlue} />
        ) : (
          <Text style={[styles.saveText, { color: colors.primaryBlue }]}>
            {isEditMode ? 'Update' : 'Save'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderTransactionTypeSelector = () => (
    <View style={styles.typeSelector}>
      {(['Expense', 'Income', 'Transfer'] as const).map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeButton,
            {
              backgroundColor: transactionType === type ? colors.primaryBlue : colors.cardBackground,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setTransactionType(type)}
        >
          <Text style={[
            styles.typeText,
            { color: transactionType === type ? '#FFFFFF' : colors.subText }
          ]}>
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAmountInput = () => (
    <TouchableOpacity 
      style={styles.amountSection} 
      onPress={() => setIsKeypadVisible(true)}
      activeOpacity={0.7}
    >
      <Text style={[styles.amountValue, { color: colors.text }]}>{amount}</Text>
      <Text style={[styles.currencyLabel, { color: colors.subText }]}>
        {isKeypadVisible ? 'USD - US Dollar' : 'Tap to edit • USD - US Dollar'}
      </Text>
    </TouchableOpacity>
  );

  const renderBudgetSelector = () => (
    <TouchableOpacity 
      style={[styles.inputSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => {
        // Simple budget cycling for now - in a real app this would be a modal
        if (budgets.length > 0) {
          const currentIndex = selectedBudget ? budgets.findIndex(b => b.id === selectedBudget.id) : -1;
          const nextIndex = (currentIndex + 1) % budgets.length;
          setSelectedBudget(budgets[nextIndex]);
        }
      }}
    >
      <View style={styles.inputRow}>
        <IconSymbol name="folder.fill" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
        <View style={styles.inputContent}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Budget *</Text>
          <Text style={[styles.inputSubtitle, { color: colors.subText }]}>Which budget is this for?</Text>
        </View>
        <View style={styles.inputValueContainer}>
          <Text style={[styles.inputValue, { color: selectedBudget ? colors.text : colors.subText }]}>
            {selectedBudget ? selectedBudget.name : 'Select Budget'}
          </Text>
          <IconSymbol name="chevron.right" size={16} color={colors.subText} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAccountSelector = () => (
    <TouchableOpacity 
      style={[styles.inputSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => {
        // Simple account cycling for now - in a real app this would be a modal
        if (accounts.length > 0) {
          const currentIndex = selectedAccount ? accounts.findIndex(a => a.id === selectedAccount.id) : -1;
          const nextIndex = currentIndex >= accounts.length - 1 ? -1 : currentIndex + 1;
          setSelectedAccount(nextIndex === -1 ? null : accounts[nextIndex]);
        }
      }}
    >
      <View style={styles.inputRow}>
        <IconSymbol name="creditcard.fill" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
        <View style={styles.inputContent}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Account</Text>
          <Text style={[styles.inputSubtitle, { color: colors.subText }]}>Optional - which account to track?</Text>
        </View>
        <View style={styles.inputValueContainer}>
          <Text style={[styles.inputValue, { color: selectedAccount ? colors.text : colors.subText }]}>
            {selectedAccount ? selectedAccount.name : 'No Account'}
          </Text>
          <IconSymbol name="chevron.right" size={16} color={colors.subText} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDescriptionInput = () => (
    <View style={[styles.inputSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.inputRow}>
        <IconSymbol name="text.alignleft" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
        <View style={[styles.inputContent, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description *</Text>
          <TextInput
            style={[styles.descriptionInput, { color: colors.text }]}
            placeholder="What did you spend on?"
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            maxLength={100}
          />
        </View>
      </View>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.categorySection}>
      <View style={styles.categorySectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>CATEGORY</Text>
        {/* <TouchableOpacity>
          <Text style={[styles.seeAllButton, { color: colors.primaryBlue }]}>See All</Text>
        </TouchableOpacity> */}
      </View>
      
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor: selectedCategory.id === category.id ? colors.primaryBlue : colors.cardBackground,
                borderColor: selectedCategory.id === category.id ? colors.primaryBlue : colors.border,
              }
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            {category.icon ? (
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            ) : (
              <View style={[styles.moreIconContainer, { borderColor: colors.border }]}>
                <IconSymbol name="plus" size={20} color={colors.subText} />
              </View>
            )}
            <Text style={[
              styles.categoryName,
              { 
                color: selectedCategory.id === category.id ? '#FFFFFF' : colors.text,
                marginTop: 8 
              }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateSelector = () => (
    <TouchableOpacity 
      style={[styles.inputSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={handleDateSelect}
    >
      <View style={styles.inputRow}>
        <IconSymbol name="calendar" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
        <View style={styles.inputContent}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date</Text>
          <Text style={[styles.inputSubtitle, { color: colors.subText }]}>When did this happen?</Text>
        </View>
        <View style={styles.inputValueContainer}>
          <Text style={[styles.inputValue, { color: colors.text }]}>
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: selectedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            })}
          </Text>
          <IconSymbol name="chevron.right" size={16} color={colors.subText} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNotesInput = () => (
    <View style={[styles.inputSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.inputRow}>
        <IconSymbol name="note.text" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
        <View style={[styles.inputContent, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Notes</Text>
          <TextInput
            style={[styles.descriptionInput, { color: colors.text }]}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.placeholder}
            value={notes}
            onChangeText={setNotes}
            maxLength={200}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>
    </View>
  );

  const renderKeypad = () => (
    <View style={styles.keypadContainer}>
      <View style={styles.keypadGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.keypadButton}
            onPress={() => {
              if (key === '.') {
                if (!amount.includes('.')) {
                  setAmount(prev => prev === '0' ? '0.' : prev + '.');
                }
              } else {
                setAmount(prev => prev === '0' ? key.toString() : prev + key.toString());
              }
            }}
          >
            <Text style={[styles.keypadButtonText, { color: colors.text }]}>{key}</Text>
          </TouchableOpacity>
        ))}
        
        {/* Delete button */}
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => {
            setAmount(prev => {
              const newAmount = prev.slice(0, -1);
              return newAmount || '0';
            });
          }}
        >
          <IconSymbol name="delete.left" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Calendar and checkmark buttons */}
      <View style={styles.keypadActions}>
        <TouchableOpacity style={styles.keypadActionButton} onPress={() => setShowDatePicker(true)}>
          <IconSymbol name="calendar" size={20} color={colors.subText} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.keypadActionButton} 
          onPress={() => setIsKeypadVisible(false)}
        >
          <Text style={[styles.keypadDoneText, { color: colors.text }]}>Done</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.keypadSaveButton, { backgroundColor: colors.primaryBlue }]}
          onPress={handleSave}
        >
          <IconSymbol name="checkmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
              Loading budgets and accounts...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
              onPress={loadData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback onPress={() => isKeypadVisible && setIsKeypadVisible(false)}>
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {renderTransactionTypeSelector()}
                {renderAmountInput()}
                {renderDescriptionInput()}
                {renderBudgetSelector()}
                {renderAccountSelector()}
                {transactionType !== 'Income' && renderCategorySelector()}
                {renderDateSelector()}
                {renderNotesInput()}
              </ScrollView>
            </TouchableWithoutFeedback>

            {isKeypadVisible && renderKeypad()}

            {/* Date Picker Modal */}
            {showDatePicker && Platform.OS === 'ios' && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.modalButton, { color: colors.primaryBlue }]}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.modalButton, { color: colors.primaryBlue }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      textColor={colors.text}
                      themeVariant="dark"
                    />
                  </View>
                </View>
              </Modal>
            )}
            
            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </KeyboardAvoidingView>
        )}
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
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '500',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 8,
  },
  currencyLabel: {
    fontSize: 14,
  },
  categorySection: {
    marginBottom: 32,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  moreIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  inputSubtitle: {
    fontSize: 14,
  },
  inputValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionInput: {
    fontSize: 16,
    marginTop: 4,
    paddingVertical: 4,
  },
  keypadContainer: {
    backgroundColor: '#2A2D32',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  keypadButton: {
    width: '33.333%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: '400',
  },
  keypadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  keypadActionButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  keypadDoneText: {
    fontSize: 16,
    fontWeight: '500',
  },
  keypadSaveButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404348',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddTransactionScreen;
