import type { Account } from '@/db/schema/accounts';
import type { Budget } from '@/db/schema/budgets';
import type { FilterOptions } from '@/hooks/useTransactions';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Dropdown, { type DropdownOption } from '../ui/Dropdown';
import { IconSymbol } from '../ui/icon-symbol';

interface TransactionFiltersProps {
  filters: FilterOptions;
  budgets: Budget[];
  accounts: Account[];
  categories: string[];
  onFilterChange: (key: keyof FilterOptions, value: string | null) => void;
  onClearFilters?: () => void;
  colors: {
    cardBackground: string;
    border: string;
    text: string;
    subText: string;
    primaryBlue: string;
  };
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  budgets,
  accounts,
  categories,
  onFilterChange,
  onClearFilters,
  colors,
}) => {
  // Convert budgets to dropdown options
  const budgetOptions: DropdownOption[] = budgets.map(budget => ({
    label: budget.name,
    value: budget.id,
  }));

  // Convert accounts to dropdown options
  const accountOptions: DropdownOption[] = accounts.map(account => ({
    label: account.name,
    value: account.id,
  }));

  // Convert categories to dropdown options
  const categoryOptions: DropdownOption[] = categories.map(category => ({
    label: category,
    value: category,
  }));

  // Check if any filters are applied
  const hasActiveFilters = filters.budgetId || filters.accountId || filters.category;

  return (
    <View style={styles.container}>
      {/* Filter Dropdowns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScrollView}
        contentContainerStyle={styles.filtersContent}
      >
        <Dropdown
          options={budgetOptions}
          selectedValue={filters.budgetId}
          placeholder="All Budgets"
          onSelect={(value: string | null) => onFilterChange('budgetId', value)}
          style={styles.dropdown}
          backgroundColor={colors.cardBackground}
          borderColor={colors.border}
          textColor={colors.text}
          iconColor={colors.subText}
          modalBackgroundColor="rgba(0, 0, 0, 0.5)"
          modalContentColor={colors.cardBackground}
          selectedColor={colors.primaryBlue}
        />

        <Dropdown
          options={accountOptions}
          selectedValue={filters.accountId}
          placeholder="All Accounts"
          onSelect={(value: string | null) => onFilterChange('accountId', value)}
          style={styles.dropdown}
          backgroundColor={colors.cardBackground}
          borderColor={colors.border}
          textColor={colors.text}
          iconColor={colors.subText}
          modalBackgroundColor="rgba(0, 0, 0, 0.5)"
          modalContentColor={colors.cardBackground}
          selectedColor={colors.primaryBlue}
        />

        <Dropdown
          options={categoryOptions}
          selectedValue={filters.category}
          placeholder="All Categories"
          onSelect={(value: string | null) => onFilterChange('category', value)}
          style={styles.dropdown}
          backgroundColor={colors.cardBackground}
          borderColor={colors.border}
          textColor={colors.text}
          iconColor={colors.subText}
          modalBackgroundColor="rgba(0, 0, 0, 0.5)"
          modalContentColor={colors.cardBackground}
          selectedColor={colors.primaryBlue}
        />
      </ScrollView>

      {/* Clear Filters Button - Below dropdowns */}
      {hasActiveFilters && onClearFilters && (
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.primaryBlue }]}
            onPress={onClearFilters}
          >
            <IconSymbol name="xmark.circle.fill" size={16} color="#FFFFFF" />
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filtersScrollView: {
    marginBottom: 8,
  },
  filtersContent: {
    gap: 12,
  },
  dropdown: {
    minWidth: 120,
  },
  clearButtonContainer: {
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionFilters;
