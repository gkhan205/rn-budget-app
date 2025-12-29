import type { RecurringExpense } from '@/hooks/useBudgetForm';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface RecurringExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (expense: Omit<RecurringExpense, 'id'>) => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
    error: string;
  };
}

export const RecurringExpenseModal: React.FC<RecurringExpenseModalProps> = ({
  isVisible,
  onClose,
  onSave,
  colors,
}) => {
  const [expenseData, setExpenseData] = useState({
    name: '',
    amount: '',
    category: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const resetForm = () => {
    setExpenseData({ name: '', amount: '', category: '' });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!expenseData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!expenseData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(expenseData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        name: expenseData.name.trim(),
        amount: parseFloat(expenseData.amount),
        category: expenseData.category.trim() || undefined,
      });
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateField = (field: keyof typeof expenseData, value: string) => {
    setExpenseData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.cancelButton, { color: colors.primaryBlue }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Expense</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveButton, { color: colors.primaryBlue }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Name Field */}
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              Expense Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text,
                  borderBottomColor: errors.name ? colors.error : 'transparent',
                  borderBottomWidth: errors.name ? 1 : 0,
                }
              ]}
              value={expenseData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="e.g. Netflix subscription"
              placeholderTextColor={colors.subText}
              autoFocus
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>
            )}
          </View>

          {/* Amount Field */}
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              Monthly Amount *
            </Text>
            <View style={styles.amountInput}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    flex: 1,
                    borderBottomColor: errors.amount ? colors.error : 'transparent',
                    borderBottomWidth: errors.amount ? 1 : 0,
                  }
                ]}
                value={expenseData.amount}
                onChangeText={(text) => updateField('amount', text)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.subText}
              />
            </View>
            {errors.amount && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.amount}</Text>
            )}
          </View>

          {/* Category Field */}
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              Category (Optional)
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={expenseData.category}
              onChangeText={(text) => updateField('category', text)}
              placeholder="e.g. Entertainment, Utilities"
              placeholderTextColor={colors.subText}
            />
            <Text style={[styles.helperText, { color: colors.subText }]}>
              Helps organize your expenses
            </Text>
          </View>

          {/* Quick Category Suggestions */}
          <View style={styles.categorySuggestions}>
            <Text style={[styles.suggestionsLabel, { color: colors.subText }]}>
              Quick Categories
            </Text>
            <View style={styles.categoryRow}>
              {['Entertainment', 'Utilities', 'Food', 'Transportation', 'Health', 'Insurance'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, { backgroundColor: colors.cardBackground }]}
                  onPress={() => updateField('category', category)}
                >
                  <Text style={[styles.categoryChipText, { color: colors.text }]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  categorySuggestions: {
    marginTop: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
