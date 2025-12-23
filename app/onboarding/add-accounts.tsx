import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountOption {
  id: string;
  title: string;
  icon: string;
  isCustom?: boolean;
}

export default function OnboardingAddAccountsScreen() {
  const router = useRouter();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    cardSelectedBackground: '#4A9EFF',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    border: '#404348',
  };

  const accountOptions: AccountOption[] = [
    {
      id: 'cash',
      title: 'Cash',
      icon: 'banknote',
    },
    {
      id: 'bank',
      title: 'Bank',
      icon: 'building.columns',
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: 'creditcard',
    },
    {
      id: 'custom',
      title: 'Custom',
      icon: 'plus',
      isCustom: true,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    // Skip accounts setup and go to next screen
    router.push('/onboarding/create-budget');
  };

  const handleNext = () => {
    if (selectedAccounts.length > 0) {
      // Store selected accounts and navigate to next screen
      router.push('/onboarding/create-budget');
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepText, { color: colors.subText }]}>Step 2 of 5</Text>
    </View>
  );

  const renderAccountCard = (account: AccountOption) => {
    const isSelected = selectedAccounts.includes(account.id);
    
    return (
      <TouchableOpacity
        key={account.id}
        style={[
          styles.accountCard,
          {
            backgroundColor: isSelected ? colors.cardSelectedBackground : colors.cardBackground,
            borderColor: isSelected ? colors.primaryBlue : colors.border,
          }
        ]}
        onPress={() => toggleAccount(account.id)}
      >
        <View style={[
          styles.accountIcon,
          { 
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : colors.primaryBlue + '20',
            borderStyle: account.isCustom ? 'dashed' : 'solid',
            borderWidth: account.isCustom ? 2 : 0,
            borderColor: isSelected ? 'rgba(255, 255, 255, 0.5)' : colors.border,
          }
        ]}>
          <IconSymbol 
            name={account.icon as any} 
            size={24} 
            color={isSelected ? '#FFFFFF' : colors.primaryBlue} 
          />
        </View>
        
        <Text style={[
          styles.accountTitle,
          { color: isSelected ? '#FFFFFF' : colors.text }
        ]}>
          {account.title}
        </Text>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </TouchableOpacity>
          {renderStepIndicator()}
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.subText }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Add Accounts
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Select accounts you want to track in your budget
          </Text>

          <View style={styles.accountsGrid}>
            {accountOptions.map(renderAccountCard)}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: selectedAccounts.length > 0 ? colors.primaryBlue : colors.border,
                opacity: selectedAccounts.length > 0 ? 1 : 0.5,
              }
            ]}
            onPress={handleNext}
            disabled={selectedAccounts.length === 0}
          >
            <Text style={[
              styles.nextButtonText,
              { color: selectedAccounts.length > 0 ? '#FFFFFF' : colors.subText }
            ]}>
              Next ({selectedAccounts.length} Selected)
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  accountCard: {
    width: '47%',
    aspectRatio: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
