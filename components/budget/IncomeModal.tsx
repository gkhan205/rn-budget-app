import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface IncomeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  currentIncome: string;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
  };
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isVisible,
  onClose,
  onSave,
  currentIncome,
  colors,
}) => {
  const [tempIncome, setTempIncome] = useState(currentIncome);

  const handleSave = () => {
    const amount = parseFloat(tempIncome) || 0;
    onSave(amount);
    onClose();
  };

  const handleClose = () => {
    setTempIncome(currentIncome);
    onClose();
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
          <Text style={[styles.title, { color: colors.text }]}>Add Income</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveButton, { color: colors.primaryBlue }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>Monthly Income</Text>
            <View style={styles.amountInput}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={tempIncome}
                onChangeText={setTempIncome}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.subText}
                autoFocus
                selectTextOnFocus
              />
            </View>
            <Text style={[styles.helperText, { color: colors.subText }]}>
              This helps track your budget against your income
            </Text>
          </View>
        </View>
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
    paddingTop: 30,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    fontSize: 32,
    fontWeight: '600',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
