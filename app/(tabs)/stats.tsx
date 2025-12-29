import MainLayout from '@/components/MainLayout';
import {
  BudgetPerformanceCard,
  ErrorState,
  FilterControls,
  LoadingState,
  RecurringVsOneTimeCard,
  SavingsEstimateCard,
  SpendingTrendsChart,
  StatsHeader,
  TopCategoriesChart,
  TotalSpentDisplay,
} from '@/components/stats';
import { StatsTheme } from '@/components/stats/theme';
import { useStats } from '@/hooks/useStats';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const StatsScreen: React.FC = () => {
  const router = useRouter();
  
  // Use the custom hook for all business logic
  const {
    statsData,
    isLoading,
    error,
    selectedPeriod,
    selectedTab,
    selectedBudget,
    customDateRange,
    setSelectedPeriod,
    setSelectedTab,
    setSelectedBudget,
    getDateRangeForPeriod,
    getCategoryColors,
    refreshData,
  } = useStats();

  console.log(statsData)

  const colors = StatsTheme.colors;
  const periods = ['Week', 'Month', 'Year', 'Custom'];

  const handleBackPress = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <StatsHeader colors={colors} onBackPress={handleBackPress} />
          <LoadingState colors={colors} />
        </View>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <StatsHeader colors={colors} onBackPress={handleBackPress} />
          <ErrorState colors={colors} error={error} onRetry={refreshData} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatsHeader colors={colors} onBackPress={handleBackPress} />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FilterControls
            selectedPeriod={selectedPeriod}
            selectedTab={selectedTab}
            selectedBudget={selectedBudget}
            periods={periods}
            availableBudgets={statsData.availableBudgets}
            colors={colors}
            onPeriodChange={setSelectedPeriod}
            onTabChange={setSelectedTab}
            onBudgetChange={setSelectedBudget}
          />
          
          <TotalSpentDisplay
            totalSpent={statsData.totalSpent}
            selectedPeriod={selectedPeriod}
            selectedTab={selectedTab}
            dateRange={getDateRangeForPeriod(selectedPeriod)}
            customDateRange={customDateRange}
            colors={colors}
          />
          
          <SpendingTrendsChart
            dailyTrends={statsData.dailyTrends}
            colors={colors}
            selectedTab={selectedTab}
          />
          
          <TopCategoriesChart
            categoryStats={statsData.categoryStats}
            colors={colors}
            selectedTab={selectedTab}
            getCategoryColors={getCategoryColors}
          />
          
          <BudgetPerformanceCard
            budgetPerformance={statsData.budgetPerformance}
            colors={colors}
            selectedTab={selectedTab}
          />
          
          <RecurringVsOneTimeCard
            recurringStats={statsData.recurringStats}
            colors={colors}
            selectedTab={selectedTab}
          />
          
          <SavingsEstimateCard
            colors={colors}
            totalSpent={statsData.totalSpent}
            dateRange={getDateRangeForPeriod(selectedPeriod)}
            budgetPerformance={statsData.budgetPerformance}
            selectedTab={selectedTab}
          />
        </ScrollView>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default StatsScreen;
