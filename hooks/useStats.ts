import { BudgetService } from '@/db/services/budgetService';
import type {
  BudgetPerformanceStats,
  CategorySpendingStats,
  DailySpendingTrend,
  RecurringVsNonRecurringStats
} from '@/db/services/statsService';
import { StatsService } from '@/db/services/statsService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

interface Budget {
  id: string;
  name: string;
}

interface StatsData {
  categoryStats: CategorySpendingStats[];
  dailyTrends: DailySpendingTrend[];
  budgetPerformance: BudgetPerformanceStats[];
  recurringStats: RecurringVsNonRecurringStats | null;
  totalSpent: number;
  availableBudgets: Budget[];
}

interface UseStatsReturn {
  // Data
  statsData: StatsData;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Filters
  selectedPeriod: string;
  selectedTab: string;
  selectedBudget: string | null;
  customDateRange: { start: Date; end: Date } | null;
  
  // Filter actions
  setSelectedPeriod: (period: string) => void;
  setSelectedTab: (tab: string) => void;
  setSelectedBudget: (budgetId: string | null) => void;
  setCustomDateRange: (range: { start: Date; end: Date } | null) => void;
  
  // Utility functions
  getDateRangeForPeriod: (period: string) => { start: Date; end: Date };
  getCategoryColors: () => string[];
  refreshData: () => void;
}

export const useStats = (): UseStatsReturn => {
  // Filter state
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [selectedTab, setSelectedTab] = useState('Expense');
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics data state
  const [statsData, setStatsData] = useState<StatsData>({
    categoryStats: [],
    dailyTrends: [],
    budgetPerformance: [],
    recurringStats: null,
    totalSpent: 0,
    availableBudgets: [],
  });

  // Color palette for charts
  const getCategoryColors = useCallback((): string[] => [
    '#4A9EFF', // primaryBlue
    '#2ECC71', // green
    '#FF8A4A', // orange
    '#9B59B6', // purple
    '#E74C3C', // red
    '#F39C12', // yellow
    '#E67E22', // dark orange
    '#8E44AD', // dark purple
  ], []);

  // Helper function to get date range for selected period
  const getDateRangeForPeriod = useCallback((period: string): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case 'Week':
        start.setDate(now.getDate() - 7);
        break;
      case 'Month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'Year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'Custom':
        return customDateRange || { start, end };
      default:
        start.setMonth(now.getMonth() - 1);
    }

    return { start, end };
  }, [customDateRange]);

  // Load analytics data from database
  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dateRange = getDateRangeForPeriod(selectedPeriod);
      const transactionType = selectedTab.toLowerCase() as 'income' | 'expense';
      
      // Load all analytics data in parallel for better performance
      const [
        budgets,
        categoryStatsData,
        dailyTrendsData,
        budgetPerformanceData,
        recurringStatsData,
      ] = await Promise.all([
        BudgetService.getActive(),
        StatsService.getCategoryStats(transactionType, dateRange.start, dateRange.end, undefined), // Force no budget filter
        StatsService.getDailyTrends(transactionType, dateRange.start, dateRange.end, undefined), // Force no budget filter
        StatsService.getBudgetPerformanceStats(dateRange.start, dateRange.end),
        StatsService.getRecurringVsNonRecurringStatsForType(transactionType, dateRange.start, dateRange.end, undefined), // Force no budget filter
      ]);

      // Calculate total spent
      const total = categoryStatsData.reduce((sum, cat) => sum + cat.totalAmount, 0);

      // Update state with loaded data
      setStatsData({
        categoryStats: categoryStatsData,
        dailyTrends: dailyTrendsData,
        budgetPerformance: budgetPerformanceData,
        recurringStats: recurringStatsData,
        totalSpent: total,
        availableBudgets: budgets.map(b => ({ id: b.id, name: b.name })),
      });

    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, selectedTab, getDateRangeForPeriod]);

  // Memoized processed data for performance
  const processedStatsData = useMemo(() => {
    // Optimize daily trends for better mobile performance
    const optimizedTrends = statsData.dailyTrends.length > 30 
      ? statsData.dailyTrends.filter((_, index) => index % Math.ceil(statsData.dailyTrends.length / 30) === 0)
      : statsData.dailyTrends;

    // Combine small categories into "Others" for better visualization
    const optimizedCategories = statsData.categoryStats.length > 5
      ? [
          ...statsData.categoryStats.slice(0, 4),
          {
            category: 'Others',
            totalAmount: statsData.categoryStats.slice(4).reduce((sum, cat) => sum + cat.totalAmount, 0),
            transactionCount: statsData.categoryStats.slice(4).reduce((sum, cat) => sum + cat.transactionCount, 0),
            avgTransactionAmount: 0,
          }
        ]
      : statsData.categoryStats;

    // Recalculate avg for "Others" category
    if (optimizedCategories.length === 5 && optimizedCategories[4].category === 'Others') {
      const othersCategory = optimizedCategories[4];
      othersCategory.avgTransactionAmount = othersCategory.transactionCount > 0 
        ? othersCategory.totalAmount / othersCategory.transactionCount 
        : 0;
    }

    return {
      ...statsData,
      dailyTrends: optimizedTrends,
      categoryStats: optimizedCategories,
    };
  }, [statsData]);

  // Refresh data function
  const refreshData = useCallback(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Load data on screen focus and when filters change
  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData();
    }, [loadAnalyticsData])
  );

  return {
    // Data (using optimized/processed data)
    statsData: processedStatsData,
    
    // Loading states
    isLoading,
    error,
    
    // Filters
    selectedPeriod,
    selectedTab,
    selectedBudget,
    customDateRange,
    
    // Filter actions
    setSelectedPeriod,
    setSelectedTab,
    setSelectedBudget,
    setCustomDateRange,
    
    // Utility functions
    getDateRangeForPeriod,
    getCategoryColors,
    refreshData,
  };
};
