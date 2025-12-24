import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Account } from '@/db/schema/accounts';
import type { Budget } from '@/db/schema/budgets';
import { AccountService } from '@/db/services/accountService';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
    { id: '8', name: 'More', icon: '', color: '#666666' },
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
      
      // Create expense using drizzle service
      const expenseData = {
        budgetId: selectedBudget.id,
        accountId: selectedAccount?.id || null,
        categoryId: null, // Using legacy category field for now
        amount: amountValue,
        description: description.trim(),
        date: selectedDate,
        category: selectedCategory.name,
        isRecurring: false,
        recurringExpenseId: null,
        tags: null,
        notes: notes.trim() || null,
      };

      await ExpenseService.create(expenseData);
      
      Alert.alert('Success', 'Expense added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (err) {
      console.error('Failed to save expense:', err);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDateSelect = () => {
    // For simplicity, we'll cycle through today, yesterday, and custom
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (selectedDate.toDateString() === today.toDateString()) {
      setSelectedDate(yesterday);
    } else {
      setSelectedDate(today);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <IconSymbol name="xmark" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>Add Transaction</Text>
      
      <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.primaryBlue} />
        ) : (
          <Text style={[styles.saveText, { color: colors.primaryBlue }]}>Save</Text>
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
        <TouchableOpacity>
          <Text style={[styles.seeAllButton, { color: colors.primaryBlue }]}>See All</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.keypadActionButton} onPress={handleDateSelect}>
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
                {renderCategorySelector()}
                {renderDateSelector()}
                {renderNotesInput()}
              </ScrollView>
            </TouchableWithoutFeedback>

            {isKeypadVisible && renderKeypad()}
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
});

export default AddTransactionScreen;
