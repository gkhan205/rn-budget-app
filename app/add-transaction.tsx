import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const AddTransactionScreen: React.FC = () => {
  const router = useRouter();
  
  // Form state
  const [transactionType, setTransactionType] = useState<'Expense' | 'Income' | 'Transfer'>('Expense');
  const [amount, setAmount] = useState('48.50');
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: '1',
    name: 'Food',
    icon: '🍔',
    color: '#4A9EFF'
  });
  const [selectedDate] = useState('Today');
  const [notes] = useState('');
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);

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

  // Category options
  const categories: Category[] = [
    { id: '1', name: 'Food', icon: '🍔', color: '#4A9EFF' },
    { id: '2', name: 'Transport', icon: '🚗', color: '#E74C3C' },
    { id: '3', name: 'Shopping', icon: '🛍️', color: '#A0D4FF' },
    { id: '4', name: 'Housing', icon: '🏠', color: '#FF8A4A' },
    { id: '5', name: 'Fun', icon: '🎬', color: '#9BA1A6' },
    { id: '6', name: 'Health', icon: '💊', color: '#F1C40F' },
    { id: '7', name: 'Education', icon: '🎓', color: '#E67E22' },
    { id: '8', name: 'More', icon: '', color: '#666666' },
  ];

  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Save transaction logic
    console.log('Save transaction:', {
      type: transactionType,
      amount: parseFloat(amount),
      category: selectedCategory,
      date: selectedDate,
      notes
    });
    router.back();
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDateSelect = () => {
    // TODO: Show date picker
    console.log('Show date picker');
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <IconSymbol name="xmark" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>Add Transaction</Text>
      
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={[styles.saveText, { color: colors.primaryBlue }]}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionTypeSelector = () => (
    <View style={styles.typeSelector}>
      {(['Expense', 'Income', 'Transfer'] as const).map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeButton,
            {
              backgroundColor: transactionType === type ? colors.primaryBlue : colors.cardBackground,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setTransactionType(type)}
        >
          <Text style={[
            styles.typeText,
            { color: transactionType === type ? '#FFFFFF' : colors.subText }
          ]}>
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAmountInput = () => (
    <TouchableOpacity 
      style={styles.amountSection} 
      onPress={() => setIsKeypadVisible(true)}
      activeOpacity={0.7}
    >
      <Text style={[styles.amountValue, { color: colors.text }]}>{amount}</Text>
      <Text style={[styles.currencyLabel, { color: colors.subText }]}>
        {isKeypadVisible ? 'USD - US Dollar' : 'Tap to edit • USD - US Dollar'}
      </Text>
    </TouchableOpacity>
  );

  const renderCategorySelector = () => (
    <View style={styles.categorySection}>
      <View style={styles.categorySectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>CATEGORY</Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllButton, { color: colors.primaryBlue }]}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor: selectedCategory.id === category.id ? colors.primaryBlue : colors.cardBackground,
                borderColor: selectedCategory.id === category.id ? colors.primaryBlue : colors.border,
              }
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            {category.icon ? (
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            ) : (
              <View style={[styles.moreIconContainer, { borderColor: colors.border }]}>
                <IconSymbol name="plus" size={20} color={colors.subText} />
              </View>
            )}
            <Text style={[
              styles.categoryName,
              { 
                color: selectedCategory.id === category.id ? '#FFFFFF' : colors.text,
                marginTop: 8 
              }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateSelector = () => (
    <TouchableOpacity 
      style={[styles.inputSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={handleDateSelect}
    >
      <View style={styles.inputRow}>
        <IconSymbol name="calendar" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
        <View style={styles.inputContent}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date</Text>
          <Text style={[styles.inputSubtitle, { color: colors.subText }]}>When did this happen?</Text>
        </View>
        <View style={styles.inputValueContainer}>
          <Text style={[styles.inputValue, { color: colors.text }]}>{selectedDate}</Text>
          <IconSymbol name="chevron.right" size={16} color={colors.subText} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderKeypad = () => (
    <View style={styles.keypadContainer}>
      <View style={styles.keypadGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.keypadButton}
            onPress={() => {
              if (key === '.') {
                if (!amount.includes('.')) {
                  setAmount(prev => prev === '0' ? '0.' : prev + '.');
                }
              } else {
                setAmount(prev => prev === '0' ? key.toString() : prev + key.toString());
              }
            }}
          >
            <Text style={[styles.keypadButtonText, { color: colors.text }]}>{key}</Text>
          </TouchableOpacity>
        ))}
        
        {/* Delete button */}
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => {
            setAmount(prev => {
              const newAmount = prev.slice(0, -1);
              return newAmount || '0';
            });
          }}
        >
          <IconSymbol name="delete.left" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Calendar and checkmark buttons */}
      <View style={styles.keypadActions}>
        <TouchableOpacity style={styles.keypadActionButton} onPress={handleDateSelect}>
          <IconSymbol name="calendar" size={20} color={colors.subText} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.keypadActionButton} 
          onPress={() => setIsKeypadVisible(false)}
        >
          <Text style={[styles.keypadDoneText, { color: colors.text }]}>Done</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.keypadSaveButton, { backgroundColor: colors.primaryBlue }]}
          onPress={handleSave}
        >
          <IconSymbol name="checkmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <TouchableWithoutFeedback onPress={() => isKeypadVisible && setIsKeypadVisible(false)}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderTransactionTypeSelector()}
              {renderAmountInput()}
              {renderCategorySelector()}
              {renderDateSelector()}
            </ScrollView>
          </TouchableWithoutFeedback>

          {isKeypadVisible && renderKeypad()}
        </KeyboardAvoidingView>
      </View>
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
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '500',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 8,
  },
  currencyLabel: {
    fontSize: 14,
  },
  categorySection: {
    marginBottom: 32,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  moreIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  inputSubtitle: {
    fontSize: 14,
  },
  inputValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  keypadContainer: {
    backgroundColor: '#2A2D32',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  keypadButton: {
    width: '33.333%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: '400',
  },
  keypadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  keypadActionButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  keypadDoneText: {
    fontSize: 16,
    fontWeight: '500',
  },
  keypadSaveButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddTransactionScreen;
