import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MonthlyIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (budgetId: string, amount: number) => Promise<void>;
  budget: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  currentAmount: number;
  monthYear: string;
}

export const MonthlyIncomeModal: React.FC<MonthlyIncomeModalProps> = ({
  visible,
  onClose,
  onUpdate,
  budget,
  currentAmount,
  monthYear,
}) => {
  const [amount, setAmount] = useState(currentAmount.toString());
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    border: '#404348',
    inputBackground: '#2A2D32',
    placeholder: '#666666',
  };

  const handleUpdate = async () => {
    if (!budget) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      await onUpdate(budget.id, numericAmount);
      onClose();
    } catch (error) {
      console.error('Failed to update income:', error);
      Alert.alert('Error', 'Failed to update income. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!budget) return null;

  return (
    <Modal
      transparent={true}
      animationType='fade'
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.cardBackground },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[styles.budgetIcon, { backgroundColor: budget.color }]}>
              <Text style={styles.budgetIconText}>{budget.icon}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>
                Set Monthly Income
              </Text>
              <Text style={[styles.subtitle, { color: colors.subText }]}>
                {budget.name} • {monthYear}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.subText }]}>
            Set your income/budget limit for this month. This helps track your
            spending against your monthly budget.
          </Text>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Monthly Income/Budget Limit
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                $
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType='numeric'
                placeholder='0.00'
                placeholderTextColor={colors.placeholder}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: colors.border }]}
              onPress={handleSkip}
              disabled={isLoading}>
              <Text style={[styles.skipButtonText, { color: colors.subText }]}>
                Skip for now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.updateButton,
                { backgroundColor: colors.primaryBlue },
              ]}
              onPress={handleUpdate}
              disabled={isLoading}>
              {isLoading ? (
                <Text style={styles.updateButtonText}>Updating...</Text>
              ) : (
                <Text style={styles.updateButtonText}>Update Income</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetIconText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  updateButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
