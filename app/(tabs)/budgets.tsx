import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// import { useBudgetStore } from '@/state/budgetStore';
// import { useExpenseStore } from '@/state/expenseStore';

interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  period: string;
  spent: number;
  limit: number;
  percentage: number;
  progressColor: string;
}

// Sample data matching the design exactly
const sampleBudgets: BudgetItem[] = [
  {
    id: '1',
    name: 'Groceries',
    icon: 'cart.fill',
    iconColor: '#4A9EFF',
    period: 'Monthly • 3 recurring',
    spent: 325,
    limit: 500,
    percentage: 65,
    progressColor: '#4A9EFF',
  },
  {
    id: '2',
    name: 'Transport',
    icon: 'bus.fill',
    iconColor: '#FF8A4A',
    period: 'Weekly • 1 recurring',
    spent: 135,
    limit: 150,
    percentage: 90,
    progressColor: '#FF8A4A',
  },
  {
    id: '3',
    name: 'Entertainment',
    icon: 'star.fill',
    iconColor: '#9B59B6',
    period: 'Monthly',
    spent: 40,
    limit: 200,
    percentage: 20,
    progressColor: '#4A9EFF',
  },
  {
    id: '4',
    name: 'Housing',
    icon: 'house.fill',
    iconColor: '#E74C3C',
    period: 'Monthly • 1 recurring',
    spent: 1550,
    limit: 1500,
    percentage: 103,
    progressColor: '#E74C3C',
  },
];

const BudgetsScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#1A1B1F' : '#F5F5F5',
    cardBackground: isDark ? '#2A2D32' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#9BA1A6' : '#666666',
    headerBackground: '#1A1B1F', // Always dark to match design
    primaryBlue: '#4A9EFF',
    orange: '#FF8A4A',
    purple: '#9B59B6',
    red: '#E74C3C',
    green: '#2ECC71',
  };

  // Calculate summary data to match the design
  const totalPlanned = 4500; // From design
  const totalSpent = 3250; // From design  
  const remaining = 1250; // From design
  const expectedSavings = 1250; // From design

  const handleAddBudget = () => {
    router.push('/add-budget');
  };

  const renderBudgetCard = ({ item }: { item: BudgetItem }) => (
    <TouchableOpacity 
      style={[styles.budgetCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push('/budget-detail')}
    >
      <View style={styles.budgetHeader}>
        <View style={styles.budgetInfo}>
          <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
            <IconSymbol name={item.icon as any} size={20} color={item.iconColor} />
          </View>
          <View style={styles.budgetDetails}>
            <Text style={[styles.budgetName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.budgetPeriod, { color: colors.subText }]}>{item.period}</Text>
          </View>
        </View>
        <View style={styles.budgetAmount}>
          <Text style={[styles.spentAmount, { color: colors.text }]}>${item.spent}</Text>
          <Text style={[styles.limitAmount, { color: colors.subText }]}>of ${item.limit} limit</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: item.progressColor,
                width: `${Math.min(item.percentage, 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color: colors.subText }]}>{item.percentage}%</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Budgets</Text>
          <TouchableOpacity style={styles.dateSelector}>
            <Text style={styles.headerDate}>Oct 2023</Text>
            <IconSymbol name="chevron.down" size={12} color="#9BA1A6" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
          <IconSymbol name="plus" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryContainer, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.expectedSavingsContainer}>
          <Text style={styles.expectedSavingsLabel}>EXPECTED SAVINGS</Text>
          <Text style={styles.expectedSavingsAmount}>${expectedSavings.toLocaleString()}.00</Text>
          <Text style={styles.savingsChange}>📈 +12% vs last month</Text>
        </View>

        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Planned</Text>
            <Text style={[styles.summaryAmount, { color: '#FFFFFF' }]}>
              ${totalPlanned.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Spent</Text>
            <Text style={[styles.summaryAmount, { color: '#FFFFFF' }]}>
              ${totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Left</Text>
            <Text style={[styles.summaryAmount, { color: colors.primaryBlue }]}>
              ${remaining.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.categoriesTitle}>Categories</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={sampleBudgets}
        renderItem={renderBudgetCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddBudget}>
        <IconSymbol name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 16,
    color: '#9BA1A6',
    marginRight: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A9EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  expectedSavingsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  expectedSavingsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9BA1A6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  expectedSavingsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A9EFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  savingsChange: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  budgetCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetPeriod: {
    fontSize: 14,
  },
  budgetAmount: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  limitAmount: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A9EFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default BudgetsScreen;
