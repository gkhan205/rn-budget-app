import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FormData {
  budgetName: string;
  icon: string;
  color: string;
  limitAmount: string;
  period: 'Monthly' | 'Weekly' | 'Custom Range';
  isRecurring: boolean;
  income: string;
  recurringExpenses: string[];
  linkedAccounts: 'All Accounts' | string[];
}

const AddBudgetScreen: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    budgetName: '',
    icon: 'creditcard.fill',
    color: '#4A9EFF',
    limitAmount: '0.00',
    period: 'Monthly',
    isRecurring: true,
    income: '0.00',
    recurringExpenses: [],
    linkedAccounts: 'All Accounts',
  });

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    inputBackground: '#3A3D42',
    primaryBlue: '#4A9EFF',
    border: '#404348',
  };

  const periodOptions = ['Monthly', 'Weekly', 'Custom Range'] as const;

  const handleClose = () => {
    router.back();
  };

  const handleCreateBudget = () => {
    // TODO: Implement budget creation logic
    console.log('Creating budget:', formData);
    router.back();
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        style={[styles.budgetNameInput, { color: colors.text }]}
        placeholder="Budget Name (e.g. Groceries)"
        placeholderTextColor={colors.subText}
        value={formData.budgetName}
        onChangeText={(text) => updateFormData('budgetName', text)}
      />
      <Text style={[styles.helperText, { color: colors.subText }]}>
        Tap above to customize icon
      </Text>
    </View>
  );

  const renderLimitAmount = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.subText }]}>LIMIT AMOUNT</Text>
      <View style={[styles.amountInput, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.currencySymbol, { color: colors.subText }]}>$</Text>
        <TextInput
          style={[styles.amountValue, { color: colors.text }]}
          value={formData.limitAmount}
          onChangeText={(text) => updateFormData('limitAmount', text)}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.subText}
        />
      </View>
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
            onPress={() => updateFormData('period', option)}
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
    </View>
  );

  const renderLinkedAccounts = () => (
    <View style={[styles.optionCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.optionHeader}>
        <View style={styles.optionInfo}>
          <View style={[styles.optionIcon, { backgroundColor: '#4A9EFF20' }]}>
            <IconSymbol name="creditcard.fill" size={16} color={colors.primaryBlue} />
          </View>
          <View style={styles.optionDetails}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Linked Accounts</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subText }]}>
              {formData.linkedAccounts}
            </Text>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.subText} />
      </View>
    </View>
  );

  const renderRecurringBudget = () => (
    <View style={[styles.optionCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.optionHeader}>
        <View style={styles.optionInfo}>
          <View style={[styles.optionIcon, { backgroundColor: '#9B59B620' }]}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#9B59B6" />
          </View>
          <View style={styles.optionDetails}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Recurring Budget</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subText }]}>
              Renews automatically
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.toggle,
            {
              backgroundColor: formData.isRecurring ? colors.primaryBlue : colors.inputBackground,
            }
          ]}
          onPress={() => updateFormData('isRecurring', !formData.isRecurring)}
        >
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: '#FFFFFF',
                transform: [{ translateX: formData.isRecurring ? 20 : 2 }],
              }
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIncome = () => (
    <View style={[styles.optionCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.optionHeader}>
        <View style={styles.optionInfo}>
          <View style={[styles.optionIcon, { backgroundColor: '#2ECC7120' }]}>
            <IconSymbol name="dollarsign" size={16} color="#2ECC71" />
          </View>
          <View style={styles.optionDetails}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Income</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subText }]}>Optional</Text>
          </View>
        </View>
        <Text style={[styles.incomeAmount, { color: colors.subText }]}>
          {formData.income}
        </Text>
      </View>
    </View>
  );

  const renderRecurringExpenses = () => (
    <View style={[styles.optionCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.optionHeader}>
        <View style={styles.optionInfo}>
          <View style={[styles.optionIcon, { backgroundColor: '#FF8A4A20' }]}>
            <IconSymbol name="calendar" size={16} color="#FF8A4A" />
          </View>
          <View style={styles.optionDetails}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Recurring Expenses</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subText }]}>
              Add fixed costs
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={[styles.addButton, { color: colors.primaryBlue }]}>Add +</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Budget</Text>
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
          {renderLinkedAccounts()}
          {renderRecurringBudget()}
          {renderIncome()}
          {renderRecurringExpenses()}
        </View>
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primaryBlue }]}
        onPress={handleCreateBudget}
      >
        <Text style={styles.createButtonText}>Create Budget</Text>
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
  optionCard: {
    borderRadius: 12,
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default AddBudgetScreen;
