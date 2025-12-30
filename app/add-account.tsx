import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AccountService } from '@/db/services/accountService';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  View,
} from 'react-native';

const AddAccountScreen: React.FC = () => {
  const router = useRouter();

  // Form state
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<
    | 'checking'
    | 'savings'
    | 'credit_card'
    | 'cash'
    | 'investment'
    | 'loan'
    | 'other'
  >('cash');
  const [initialBalance, setInitialBalance] = useState('0');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    border: '#404348',
    inputBackground: '#3A3D42',
    red: '#E74C3C',
    green: '#2ECC71',
  };

  const accountTypes = [
    // { id: 'checking', name: 'Checking', icon: 'building.columns' },
    { id: 'savings', name: 'Savings', icon: 'building.columns' },
    { id: 'credit_card', name: 'Credit Card', icon: 'creditcard' },
    { id: 'cash', name: 'Cash', icon: 'banknote' },
    // { id: 'investment', name: 'Investment', icon: 'chart.line.uptrend.xyaxis' },
    // { id: 'loan', name: 'Loan', icon: 'house' },
    { id: 'other', name: 'Other', icon: 'wallet.pass' },
  ];

  const handleSave = async () => {
    if (!accountName.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    try {
      setIsLoading(true);

      await AccountService.create({
        name: accountName.trim(),
        type: accountType,
        balance: parseFloat(initialBalance) || 0,
        description: description.trim() || undefined,
        currency: 'USD',
        icon: '💳',
        color: colors.primaryBlue,
      });

      Alert.alert('Success', 'Account created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name='xmark' size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        Add Account
      </Text>
      <TouchableOpacity
        onPress={handleSave}
        style={styles.saveButton}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size='small' color={colors.primaryBlue} />
        ) : (
          <Text style={[styles.saveText, { color: colors.primaryBlue }]}>
            Save
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder?: string,
    keyboardType?: 'default' | 'numeric'
  ) => (
    <View style={styles.inputSection}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subText}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderAccountTypeSelector = () => (
    <View style={styles.inputSection}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        Account Type
      </Text>
      <View style={styles.typeGrid}>
        {accountTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  accountType === type.id
                    ? colors.primaryBlue
                    : colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setAccountType(type.id as any)}>
            <IconSymbol
              name={type.icon as any}
              size={20}
              color={accountType === type.id ? '#FFFFFF' : colors.subText}
            />
            <Text
              style={[
                styles.typeText,
                { color: accountType === type.id ? '#FFFFFF' : colors.text },
              ]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <MainLayout>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {renderHeader()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderInput(
            'Account Name *',
            accountName,
            setAccountName,
            'e.g., Chase Checking'
          )}

          {renderAccountTypeSelector()}

          {renderInput(
            'Initial Balance',
            initialBalance,
            setInitialBalance,
            '0.00',
            'numeric'
          )}

          {renderInput(
            'Description (Optional)',
            description,
            setDescription,
            'Add a description'
          )}

          <View style={styles.infoSection}>
            <Text style={[styles.infoText, { color: colors.subText }]}>
              The initial balance will be used as the starting amount for this
              account. You can always update it later.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: '45%',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default AddAccountScreen;
