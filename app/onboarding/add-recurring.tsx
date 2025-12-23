import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RecurringExpense {
  id: string;
  name: string;
  icon: string;
  color: string;
  suggestedAmount: string;
  isEnabled: boolean;
}

export default function OnboardingAddRecurringScreen() {
  const router = useRouter();
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([
    {
      id: 'netflix',
      name: 'Netflix',
      icon: 'tv.fill',
      color: '#E50914',
      suggestedAmount: '$15.99',
      isEnabled: false,
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: 'music.note',
      color: '#1ED760',
      suggestedAmount: '$9.99',
      isEnabled: false,
    },
    {
      id: 'rent',
      name: 'Rent',
      icon: 'house.fill',
      color: '#4A9EFF',
      suggestedAmount: '$1,200',
      isEnabled: false,
    },
    {
      id: 'food',
      name: 'Food',
      icon: 'fork.knife',
      color: '#FF6B6B',
      suggestedAmount: '$300',
      isEnabled: false,
    },
  ]);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    border: '#404348',
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    // Skip recurring expenses and go to completion screen
    router.push('/onboarding/complete');
  };

  const handleNext = () => {
    // Store enabled recurring expenses and navigate to completion screen
    router.push('/onboarding/complete');
  };

  const toggleRecurring = (expenseId: string) => {
    setRecurringExpenses(prev =>
      prev.map(expense =>
        expense.id === expenseId
          ? { ...expense, isEnabled: !expense.isEnabled }
          : expense
      )
    );
  };

  const enabledCount = recurringExpenses.filter(expense => expense.isEnabled).length;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepText, { color: colors.subText }]}>Step 4 of 5</Text>
    </View>
  );

  const renderRecurringItem = (expense: RecurringExpense) => (
    <View
      key={expense.id}
      style={[styles.recurringItem, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.itemIcon, { backgroundColor: expense.color + '20' }]}>
          <IconSymbol name={expense.icon as any} size={20} color={expense.color} />
        </View>
        
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {expense.name}
          </Text>
          <Text style={[styles.itemAmount, { color: colors.subText }]}>
            {expense.suggestedAmount}/month
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.toggle,
          { backgroundColor: expense.isEnabled ? colors.primaryBlue : colors.border }
        ]}
        onPress={() => toggleRecurring(expense.id)}
      >
        <View style={[
          styles.toggleKnob,
          {
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: expense.isEnabled ? 20 : 2 }]
          }
        ]} />
      </TouchableOpacity>
    </View>
  );

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
            Recurring
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Track your recurring expenses
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.recurringList}>
              {recurringExpenses.map(renderRecurringItem)}
            </View>

            <TouchableOpacity style={[styles.addCustomButton, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.addIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
                <IconSymbol name="plus" size={20} color={colors.primaryBlue} />
              </View>
              <Text style={[styles.addCustomText, { color: colors.text }]}>
                Add custom recurring
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primaryBlue }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {enabledCount > 0 ? `Next (${enabledCount} Selected)` : 'Next'}
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
  scrollView: {
    flex: 1,
  },
  recurringList: {
    gap: 16,
    marginBottom: 24,
  },
  recurringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#404348',
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addCustomText: {
    fontSize: 16,
    fontWeight: '500',
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
    color: '#FFFFFF',
  },
});
