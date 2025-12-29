import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Budget {
  id: string;
  name: string;
}

interface FilterControlsProps {
  selectedPeriod: string;
  selectedTab: string;
  selectedBudget: string | null;
  periods: string[];
  availableBudgets: Budget[];
  colors: Record<string, string>;
  onPeriodChange: (period: string) => void;
  onTabChange: (tab: string) => void;
  onBudgetChange: (budgetId: string | null) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedPeriod,
  selectedTab,
  selectedBudget,
  periods,
  availableBudgets,
  colors,
  onPeriodChange,
  onTabChange,
  onBudgetChange,
}) => {
  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: colors.cardBackground }]}>
      <TouchableOpacity 
        style={[
          styles.tab, 
          { backgroundColor: selectedTab === 'Income' ? colors.border : 'transparent' }
        ]}
        onPress={() => onTabChange('Income')}
      >
        <Text style={[
          styles.tabText, 
          { color: selectedTab === 'Income' ? colors.text : colors.subText }
        ]}>
          Income
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tab, 
          { backgroundColor: selectedTab === 'Expense' ? colors.border : 'transparent' }
        ]}
        onPress={() => onTabChange('Expense')}
      >
        <Text style={[
          styles.tabText, 
          { color: selectedTab === 'Expense' ? colors.text : colors.subText }
        ]}>
          Expense
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.periodContainer}
      contentContainerStyle={styles.periodContent}
    >
      {periods.map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period 
                ? colors.primaryBlue 
                : colors.cardBackground,
            }
          ]}
          onPress={() => onPeriodChange(period)}
        >
          <Text style={[
            styles.periodText,
            { 
              color: selectedPeriod === period 
                ? '#FFFFFF' 
                : colors.text 
            }
          ]}>
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBudgetFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.budgetFilterContainer}
      contentContainerStyle={styles.budgetFilterContent}
    >
      <TouchableOpacity
        style={[
          styles.budgetFilterButton,
          {
            backgroundColor: !selectedBudget 
              ? colors.primaryBlue 
              : colors.cardBackground,
          }
        ]}
        onPress={() => onBudgetChange(null)}
      >
        <Text style={[
          styles.budgetFilterText,
          { color: !selectedBudget ? '#FFFFFF' : colors.text }
        ]}>
          All Budgets
        </Text>
      </TouchableOpacity>
      
      {availableBudgets.map((budget) => (
        <TouchableOpacity
          key={budget.id}
          style={[
            styles.budgetFilterButton,
            {
              backgroundColor: selectedBudget === budget.id 
                ? colors.primaryBlue 
                : colors.cardBackground,
            }
          ]}
          onPress={() => onBudgetChange(budget.id)}
        >
          <Text style={[
            styles.budgetFilterText,
            { 
              color: selectedBudget === budget.id 
                ? '#FFFFFF' 
                : colors.text 
            }
          ]}>
            {budget.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View>
      {renderTabs()}
      {renderPeriodSelector()}
      {renderBudgetFilter()}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodContent: {
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetFilterContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  budgetFilterContent: {
    paddingHorizontal: 4,
  },
  budgetFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 80,
  },
  budgetFilterText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default FilterControls;
