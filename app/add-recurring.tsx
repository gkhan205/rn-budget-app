import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
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
  const [frequency] = useState('Monthly');
  const [dueDate] = useState('25th');
  const [account] = useState('Main Checking');
  const [notes, setNotes] = useState('');
  const [autoAddExpense, setAutoAddExpense] = useState(true);

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

  const handleSave = () => {
    // TODO: Save recurring expense logic
    console.log('Save recurring expense:', {
      amount: parseFloat(amount),
      name,
      frequency,
      dueDate,
      account,
      notes,
      autoAddExpense
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: colors.primaryBlue }]}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Recurring</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Amount Section */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.subText }]}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: colors.subText }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.primaryBlue}
              />
            </View>
          </View>

          {/* Name Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <IconSymbol
                name="pencil"
                size={20}
                color={colors.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix, Rent"
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.primaryBlue}
              />
            </View>
          </View>

          {/* Frequency and Due Date Row */}
          <View style={styles.rowSection}>
            <View style={[styles.halfInput, { marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>Frequency</Text>
              <TouchableOpacity 
                style={[styles.selectorContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                onPress={() => {
                  // TODO: Show frequency picker
                  console.log('Show frequency picker');
                }}
              >
                <Text style={[styles.selectorText, { color: colors.text }]}>{frequency}</Text>
                <IconSymbol
                  name="chevron.down"
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.halfInput, { marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>Due Date</Text>
              <TouchableOpacity 
                style={[styles.selectorContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                onPress={() => {
                  // TODO: Show date picker
                  console.log('Show date picker');
                }}
              >
                <Text style={[styles.selectorText, { color: colors.text }]}>{dueDate}</Text>
                <IconSymbol
                  name="calendar"
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>Account</Text>
            <TouchableOpacity 
              style={[styles.accountContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
              onPress={() => {
                // TODO: Show account picker
                console.log('Show account picker');
              }}
            >
              <View style={styles.accountLeft}>
                <IconSymbol
                  name="creditcard.fill"
                  size={20}
                  color={colors.primaryBlue}
                  style={styles.accountIcon}
                />
                <Text style={[styles.accountText, { color: colors.text }]}>{account}</Text>
              </View>
              <IconSymbol
                name="chevron.down"
                size={16}
                color={colors.subText}
              />
            </TouchableOpacity>
          </View>

          {/* Notes Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>Notes</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add details (optional)"
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              selectionColor={colors.primaryBlue}
            />
          </View>

          {/* Auto-add Toggle Section */}
          <View style={[styles.toggleSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.toggleLeft}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Auto-add Expense</Text>
              <Text style={[styles.toggleSubtitle, { color: colors.subText }]}>Automatically create transaction on due date</Text>
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
        <View style={[styles.saveButtonContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primaryBlue }]}
            onPress={handleSave}
          >
            <IconSymbol
              name="checkmark"
              size={20}
              color="#FFFFFF"
              style={styles.saveIcon}
            />
            <Text style={styles.saveButtonText}>Save Recurring Expense</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
});

export default AddRecurringScreen;
