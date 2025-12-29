import {
  DateRangePicker,
  IncomeModal,
  OptionCard,
  RecurringExpenseList,
  RecurringExpenseModal,
  ToggleSwitch,
} from '@/components/budget';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBudgetForm, type BudgetFormData } from '@/hooks/useBudgetForm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const AddBudgetScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Check if we're in edit mode
  const isEditMode = params.editMode === 'true';
  const budgetId = params.budgetId as string;
  
  // Prepare initial data for edit mode
  const initialData: Partial<BudgetFormData> | undefined = isEditMode ? {
    budgetName: params.name as string || '',
    icon: params.icon as string || 'creditcard.fill',
    color: params.iconColor as string || '#4A9EFF',
    income: params.limit as string || '0.00',
  } : undefined;
  
  const {
    formData,
    updateFormData,
    validationErrors,
    isLoading,
    addRecurringExpense,
    removeRecurringExpense,
    updateIncome,
    handleDateRangeChange,
    submitForm,
  } = useBudgetForm(isEditMode, budgetId, initialData);

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    inputBackground: '#3A3D42',
    primaryBlue: '#4A9EFF',
    border: '#404348',
    error: '#E74C3C',
  };

  const periodOptions = ['Monthly', 'Weekly', 'Custom Range'] as const;

  const handleClose = () => {
    router.back();
  };

  const handlePeriodChange = (period: typeof periodOptions[number]) => {
    updateFormData('period', period);
    if (period === 'Custom Range') {
      setShowDateRangePicker(true);
    }
  };

  const renderIconSelector = () => (
    <TouchableOpacity style={styles.iconSelector}>
      <View style={[styles.iconCircle, { backgroundColor: formData.color }]}>
        <IconSymbol name={formData.icon as any} size={24} color="#FFFFFF" />
        <View style={styles.editBadge}>
          <IconSymbol name="paintpalette.fill" size={12} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBudgetNameInput = () => (
    <View style={styles.inputSection}>
      <TextInput
        style={[
          styles.budgetNameInput, 
          { 
            color: colors.text,
            borderBottomColor: validationErrors.budgetName ? colors.error : 'transparent',
            borderBottomWidth: validationErrors.budgetName ? 1 : 0,
          }
        ]}
        placeholder="Budget Name (e.g. Groceries)"
        placeholderTextColor={colors.subText}
        value={formData.budgetName}
        onChangeText={(text) => updateFormData('budgetName', text)}
      />
      {validationErrors.budgetName ? (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {validationErrors.budgetName}
        </Text>
      ) : (
        <Text style={[styles.helperText, { color: colors.subText }]}>
          Tap above to customize icon
        </Text>
      )}
    </View>
  );

  const renderLimitAmount = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.subText }]}>LIMIT AMOUNT</Text>
      <View style={[
        styles.amountInput, 
        { 
          backgroundColor: colors.inputBackground,
          borderBottomColor: validationErrors.limitAmount ? colors.error : 'transparent',
          borderBottomWidth: validationErrors.income ? 1 : 0,
        }
      ]}>
        <Text style={[styles.currencySymbol, { color: colors.subText }]}>$</Text>
        <TextInput
          style={[styles.amountValue, { color: colors.text }]}
          value={formData.income}
          onChangeText={(text) => updateFormData('income', text)}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.subText}
        />
      </View>
      {validationErrors.income && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {validationErrors.income}
        </Text>
      )}
      <Text style={[styles.helperText, { color: colors.subText }]}>
        Set to $0 for tracking-only budget
      </Text>
    </View>
  );

  const renderBudgetPeriod = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.subText }]}>BUDGET PERIOD</Text>
      <View style={styles.periodOptions}>
        {periodOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.periodOption,
              {
                backgroundColor: formData.period === option ? colors.primaryBlue : colors.inputBackground,
              }
            ]}
            onPress={() => handlePeriodChange(option)}
          >
            <Text
              style={[
                styles.periodOptionText,
                {
                  color: formData.period === option ? '#FFFFFF' : colors.text,
                }
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Show date range info if Custom Range is selected */}
      {formData.period === 'Custom Range' && formData.customStartDate && formData.customEndDate && (
        <View style={styles.dateRangeInfo}>
          <Text style={[styles.dateRangeText, { color: colors.subText }]}>
            {formData.customStartDate.toLocaleDateString()} - {formData.customEndDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity onPress={() => setShowDateRangePicker(true)}>
            <Text style={[styles.changeDateText, { color: colors.primaryBlue }]}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRecurringBudget = () => (
    <OptionCard
      icon="arrow.triangle.2.circlepath"
      iconColor="#9B59B6"
      iconBackgroundColor="#9B59B620"
      title="Recurring Budget"
      subtitle="Renews automatically"
      rightElement={
        <ToggleSwitch
          isOn={formData.isRecurring}
          onToggle={() => updateFormData('isRecurring', !formData.isRecurring)}
          colors={colors}
        />
      }
      colors={colors}
    />
  );

  const renderIncome = () => (
    <OptionCard
      icon="dollarsign"
      iconColor="#2ECC71"
      iconBackgroundColor="#2ECC7120"
      title="Income"
      subtitle={formData.income !== '0.00' ? `$${formData.income}` : 'Add income (optional)'}
      rightElement={<IconSymbol name="chevron.right" size={16} color={colors.subText} />}
      onPress={() => setShowIncomeModal(true)}
      colors={colors}
    />
  );

  const renderRecurringExpenses = () => (
    <OptionCard
      icon="calendar"
      iconColor="#FF8A4A"
      iconBackgroundColor="#FF8A4A20"
      title="Recurring Expenses"
      subtitle={
        formData.recurringExpenses.length > 0 
          ? `${formData.recurringExpenses.length} expenses added`
          : 'Add fixed costs'
      }
      rightElement={
        <Text style={[styles.addButton, { color: colors.primaryBlue }]}>
          {formData.recurringExpenses.length > 0 ? 'Edit' : 'Add +'}
        </Text>
      }
      onPress={() => setShowExpenseModal(true)}
      colors={colors}
    >
      <RecurringExpenseList
        expenses={formData.recurringExpenses}
        onDelete={removeRecurringExpense}
        colors={colors}
      />
    </OptionCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditMode ? 'Edit Budget' : 'New Budget'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon and Name Section */}
        <View style={styles.topSection}>
          {renderIconSelector()}
          {renderBudgetNameInput()}
        </View>

        {/* Limit Amount */}
        {renderLimitAmount()}

        {/* Budget Period */}
        {renderBudgetPeriod()}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {renderRecurringBudget()}
          {/* {renderIncome()} */}
          {renderRecurringExpenses()}
        </View>
      </ScrollView>

      {/* Modals */}
      <IncomeModal
        isVisible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSave={updateIncome}
        currentIncome={formData.income}
        colors={colors}
      />

      <RecurringExpenseModal
        isVisible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={addRecurringExpense}
        colors={colors}
      />

      <DateRangePicker
        isVisible={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        onDateRangeSelect={(startDate, endDate) => {
          handleDateRangeChange(startDate, endDate);
          setShowDateRangePicker(false);
        }}
        initialStartDate={formData.customStartDate}
        initialEndDate={formData.customEndDate}
        colors={colors}
      />

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton, 
          { 
            backgroundColor: isLoading ? colors.border : colors.primaryBlue,
            opacity: isLoading ? 0.7 : 1,
          }
        ]}
        onPress={submitForm}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={[styles.createButtonText, { marginLeft: 8 }]}>Creating...</Text>
          </View>
        ) : (
          <Text style={styles.createButtonText}>
            {isEditMode ? 'Update Budget' : 'Create Budget'}
          </Text>
        )}
      </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404348',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconSelector: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1B1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1B1F',
  },
  inputSection: {
    alignItems: 'center',
    width: '100%',
  },
  budgetNameInput: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    minWidth: 200,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  helperText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 100,
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Validation and loading styles
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date range info styles
  dateRangeInfo: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#33363A',
    borderRadius: 8,
  },
  dateRangeText: {
    fontSize: 14,
  },
  changeDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AddBudgetScreen;
