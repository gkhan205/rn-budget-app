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

interface MoneyManagementOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export default function OnboardingMoneyManagementScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('');

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    cardSelectedBackground: '#4A9EFF',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    border: '#404348',
  };

  const options: MoneyManagementOption[] = [
    {
      id: 'cash-only',
      title: 'Cash Only',
      subtitle: 'I mostly use cash for my spending',
      icon: 'banknote',
    },
    {
      id: 'one-bank',
      title: '1 Bank Account',
      subtitle: 'I have one bank account that I use',
      icon: 'creditcard',
    },
    {
      id: 'multiple-accounts',
      title: 'Multiple Accounts',
      subtitle: 'I use multiple accounts and cards',
      icon: 'building.columns',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (selectedOption) {
      // Store the selected option and navigate to next screen
      router.push('/onboarding/add-accounts');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepText, { color: colors.subText }]}>Step 1 of 5</Text>
    </View>
  );

  const renderOptionCard = (option: MoneyManagementOption) => {
    const isSelected = selectedOption === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          {
            backgroundColor: isSelected ? colors.cardSelectedBackground : colors.cardBackground,
            borderColor: isSelected ? colors.primaryBlue : colors.border,
          }
        ]}
        onPress={() => setSelectedOption(option.id)}
      >
        <View style={[
          styles.optionIcon,
          { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : colors.primaryBlue + '20' }
        ]}>
          <IconSymbol 
            name={option.icon as any} 
            size={24} 
            color={isSelected ? '#FFFFFF' : colors.primaryBlue} 
          />
        </View>
        
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionTitle,
            { color: isSelected ? '#FFFFFF' : colors.text }
          ]}>
            {option.title}
          </Text>
          <Text style={[
            styles.optionSubtitle,
            { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.subText }
          ]}>
            {option.subtitle}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
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
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            How do you manage money?
          </Text>

          <View style={styles.optionsContainer}>
            {options.map(renderOptionCard)}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: selectedOption ? colors.primaryBlue : colors.border,
                opacity: selectedOption ? 1 : 0.5,
              }
            ]}
            onPress={handleContinue}
            disabled={!selectedOption}
          >
            <Text style={[
              styles.continueButtonText,
              { color: selectedOption ? '#FFFFFF' : colors.subText }
            ]}>
              Continue
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
