import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BudgetPeriod {
  id: string;
  label: string;
}

export default function OnboardingCreateFirstBudgetScreen() {
  const router = useRouter();
  const [budgetName, setBudgetName] = useState('Home Budget');
  const [selectedIcon, setSelectedIcon] = useState('house.fill');
  const [selectedColor, setSelectedColor] = useState('#4A9EFF');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    border: '#404348',
    inputBackground: '#2A2D32',
  };

  const iconOptions = ['house.fill', 'car.fill', 'cart.fill', 'creditcard.fill', 'dollarsign.circle.fill'];
  const colorOptions = ['#4A9EFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  const periodOptions: BudgetPeriod[] = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'custom', label: 'Custom Range' },
    { id: 'no-end', label: 'No End Date' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (budgetName && budgetLimit) {
      if (isRecurring) {
        // Navigate to recurring expenses screen
        router.push('/onboarding/add-recurring');
      } else {
        // Skip recurring and go to completion screen
        router.push('/onboarding/complete');
      }
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepText, { color: colors.subText }]}>Step 3 of 5</Text>
    </View>
  );

  const renderIconPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Icon</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
        {iconOptions.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              {
                backgroundColor: selectedIcon === icon ? selectedColor : colors.cardBackground,
                borderColor: selectedIcon === icon ? selectedColor : colors.border,
              }
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <IconSymbol 
              name={icon as any} 
              size={24} 
              color={selectedIcon === icon ? '#FFFFFF' : colors.text} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderColorPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Color</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              {
                backgroundColor: color,
                borderColor: selectedColor === color ? '#FFFFFF' : 'transparent',
                borderWidth: selectedColor === color ? 3 : 0,
              }
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.pickerSection}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Budget Period</Text>
      <View style={styles.periodGrid}>
        {periodOptions.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodOption,
              {
                backgroundColor: selectedPeriod === period.id ? colors.primaryBlue : colors.cardBackground,
                borderColor: selectedPeriod === period.id ? colors.primaryBlue : colors.border,
              }
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[
              styles.periodText,
              { color: selectedPeriod === period.id ? '#FFFFFF' : colors.text }
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const canContinue = budgetName.trim() && budgetLimit.trim();

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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              Create your first budget
            </Text>

            {/* Budget Name Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Budget Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                value={budgetName}
                onChangeText={setBudgetName}
                placeholder="Enter budget name"
                placeholderTextColor={colors.subText}
              />
            </View>

            {renderIconPicker()}
            {renderColorPicker()}
            {renderPeriodSelector()}

            {/* Budget Limit Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Budget Limit</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                value={budgetLimit}
                onChangeText={setBudgetLimit}
                placeholder="$0.00"
                placeholderTextColor={colors.subText}
                keyboardType="numeric"
              />
            </View>

            {/* Recurring Toggle */}
            <View style={styles.toggleSection}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                Is this a recurring budget?
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: isRecurring ? colors.primaryBlue : colors.border }
                ]}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View style={[
                  styles.toggleKnob,
                  {
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: isRecurring ? 20 : 2 }]
                  }
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: canContinue ? colors.primaryBlue : colors.border,
                opacity: canContinue ? 1 : 0.5,
              }
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={[
              styles.continueButtonText,
              { color: canContinue ? '#FFFFFF' : colors.subText }
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#404348',
  },
  pickerSection: {
    marginBottom: 24,
  },
  iconScroll: {
    flexDirection: 'row',
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
  },
  colorScroll: {
    flexDirection: 'row',
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  periodOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
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
