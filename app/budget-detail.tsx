import {
  ActionButtons,
  BudgetSummaryCard,
  CategoryChart,
  ExpenseHistory,
  RecurringExpensesList,
  SpendingSummary,
  TabNavigation,
} from '@/components/budget';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BudgetService } from '@/db/services/budgetService';
import { ExpenseService } from '@/db/services/expenseService';
import { RecurringExpenseService } from '@/db/services/recurringExpenseService';
import { useBudgetDetail } from '@/hooks/useBudgetDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type TabType = 'Overview' | 'Recurring' | 'History';

const BudgetDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const budgetId = params.id as string;

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    income: '',
    periodType: 'monthly' as 'monthly' | 'weekly' | 'custom' | 'noEndDate',
  });

  // Custom hook for budget data
  const { budgetDetail, isLoading, error, refetch } = useBudgetDetail(budgetId);

  // Theme colors
  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    border: '#404348',
    tabInactive: '#666666',
  };

  // Navigation handlers
  const handleBack = () => {
    router.back();
  };

  const handleAddRecurring = () => {
    router.push('/add-recurring');
  };

  const handleAddExpense = () => {
    router.push('/add-transaction');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Menu handlers
  const handleOptionsPress = () => {
    setShowOptionsMenu(true);
  };

  const handleEdit = () => {
    setShowOptionsMenu(false);
    if (budgetDetail) {
      // Navigate to add-budget screen with edit mode parameters
      router.push({
        pathname: '/add-budget' as any,
        params: {
          editMode: 'true',
          budgetId: budgetDetail.budget.id,
          name: budgetDetail.budget.name,
          icon: budgetDetail.budget.icon,
          iconColor: budgetDetail.budget.color,
          limit: budgetDetail.budget.income?.toString() || '',
        },
      });
    }
  };

  const handleDelete = () => {
    setShowOptionsMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleEditSubmit = async () => {
    try {
      await BudgetService.update(budgetId, {
        name: editForm.name,
        income: parseFloat(editForm.income) || 0,
        periodType: editForm.periodType,
      });
      setShowEditModal(false);
      refetch(); // Refresh the data
    } catch {
      Alert.alert('Error', 'Failed to update budget. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      // Delete all related data first
      const budgetExpenses = await ExpenseService.getByBudgetId(budgetId);
      for (const expense of budgetExpenses) {
        await ExpenseService.delete(expense.id);
      }
      
      const recurringExpenses = await RecurringExpenseService.getByBudgetId(budgetId);
      for (const recurringExpense of recurringExpenses) {
        await RecurringExpenseService.delete(recurringExpense.id);
      }
      
      // Delete the budget itself
      await BudgetService.delete(budgetId);
      
      setShowDeleteConfirm(false);
      router.back(); // Navigate back to budgets list
    } catch {
      Alert.alert('Error', 'Failed to delete budget. Please try again.');
    }
  };

  // Early returns for loading, error, and empty states
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading budget details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#FF6B6B' }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
          onPress={refetch}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!budgetDetail) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.subText }]}>
          Budget not found
        </Text>
      </SafeAreaView>
    );
  }

  // Render methods - now safe to use budgetDetail without null checks
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {budgetDetail.budget.name}
          </Text>
          <IconSymbol name={budgetDetail.budget.icon as any} size={16} color={colors.primaryBlue} style={styles.headerIcon} />
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          {budgetDetail.budget.periodType.charAt(0).toUpperCase() + budgetDetail.budget.periodType.slice(1)} Budget
        </Text>
      </View>
      <TouchableOpacity style={styles.optionsButton} onPress={handleOptionsPress}>
        <IconSymbol name="ellipsis" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <SpendingSummary
        todaysSpend={budgetDetail.todaysSpend}
        weekSpend={budgetDetail.weekSpend}
        colors={colors}
      />
      <CategoryChart
        categories={budgetDetail.categorySpending}
        colors={colors}
        onViewAll={() => {
          // Navigate to detailed category view
        }}
      />
      <RecurringExpensesList
        recurringExpenses={budgetDetail.recurringExpenses}
        colors={colors}
      />
      <ActionButtons
        onAddRecurring={handleAddRecurring}
        onAddExpense={handleAddExpense}
        colors={colors}
      />
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderRecurringTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <RecurringExpensesList
        recurringExpenses={budgetDetail.recurringExpenses}
        colors={colors}
      />
      <ActionButtons
        onAddRecurring={handleAddRecurring}
        onAddExpense={handleAddExpense}
        colors={colors}
      />
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <ExpenseHistory
        expenses={budgetDetail.expenses}
        colors={colors}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverviewTab();
      case 'Recurring':
        return renderRecurringTab();
      case 'History':
        return renderHistoryTab();
      default:
        return null;
    }
  };

  console.log('Rendering BudgetDetailScreen with budgetDetail:', budgetDetail);

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        {renderHeader()}
        <BudgetSummaryCard
          income={budgetDetail.budget.income}
          spent={budgetDetail.totalSpent}
          remaining={budgetDetail.remaining}
          percentage={budgetDetail.percentage}
          daysRemaining={budgetDetail.periodData.daysRemaining}
          colors={colors}
        />
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          colors={colors}
        />
        {renderTabContent()}
      </SafeAreaView>

      <Modal
        visible={showOptionsMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={[styles.optionsMenu, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleEdit}
            >
              <IconSymbol name="pencil" size={18} color={colors.text} />
              <Text style={[styles.optionText, { color: colors.text }]}>Edit Budget</Text>
            </TouchableOpacity>
            <View style={[styles.optionSeparator, { backgroundColor: colors.border }]} />
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleDelete}
            >
              <IconSymbol name="trash" size={18} color="#FF6B6B" />
              <Text style={[styles.optionText, { color: '#FF6B6B' }]}>Delete Budget</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModal, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>Edit Budget</Text>
            
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Budget Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter budget name"
              placeholderTextColor={colors.subText}
            />

            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Monthly Income/Limit</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={editForm.income}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, income: text }))}
              placeholder="0"
              placeholderTextColor={colors.subText}
              keyboardType="numeric"
            />

            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Period Type</Text>
            <View style={styles.periodTypeContainer}>
              {(['monthly', 'weekly', 'custom', 'noEndDate'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.periodOption,
                    editForm.periodType === type && { backgroundColor: colors.primaryBlue },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setEditForm(prev => ({ ...prev, periodType: type }))}
                >
                  <Text style={[
                    styles.periodOptionText,
                    { color: editForm.periodType === type ? '#FFFFFF' : colors.text }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.editModalButtons}>
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.editButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: colors.primaryBlue }]}
                onPress={handleEditSubmit}
              >
                <Text style={[styles.editButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="exclamationmark.triangle" size={48} color="#FF6B6B" style={styles.warningIcon} />
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Delete Budget</Text>
            <Text style={[styles.confirmMessage, { color: colors.subText }]}>
              Are you sure you want to delete &ldquo;{budgetDetail?.budget.name}&rdquo;? 
              {'\n\n'}This will permanently remove the budget and all associated expenses and recurring items. This action cannot be undone.
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.border }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.confirmButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: '#FF6B6B' }]}
                onPress={handleDeleteConfirm}
              >
                <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 6,
  },
  headerIcon: {
    marginLeft: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  optionsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomPadding: {
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Options menu styles
  optionsMenu: {
    borderRadius: 12,
    padding: 4,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionSeparator: {
    height: 1,
    marginHorizontal: 8,
  },
  // Edit modal styles
  editModal: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  periodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  periodOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirm modal styles
  confirmModal: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetDetailScreen;
