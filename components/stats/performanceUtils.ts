import type { CategorySpendingStats, DailySpendingTrend } from '@/db/services/statsService';
import { useMemo } from 'react';

/**
 * Performance utilities for Stats components
 */

export const useStatsPerformanceOptimizations = () => {
  // Memoized chart data processors
  const processChartData = useMemo(() => ({
    /**
     * Optimize daily trends for chart rendering
     * Reduces data points for better performance on mobile
     */
    optimizeDailyTrends: (trends: DailySpendingTrend[], maxPoints: number = 30): DailySpendingTrend[] => {
      if (trends.length <= maxPoints) return trends;
      
      const step = Math.ceil(trends.length / maxPoints);
      return trends.filter((_, index) => index % step === 0);
    },

    /**
     * Calculate chart bounds efficiently
     */
    getChartBounds: (trends: DailySpendingTrend[]) => {
      const amounts = trends.map(t => t.totalAmount);
      return {
        min: Math.min(...amounts, 0),
        max: Math.max(...amounts, 500), // Minimum scale for better visualization
      };
    },

    /**
     * Group categories for better visualization
     * Combines small categories into "Others"
     */
    optimizeCategoryData: (categories: CategorySpendingStats[], maxCategories: number = 5): CategorySpendingStats[] => {
      if (categories.length <= maxCategories) return categories;
      
      const topCategories = categories.slice(0, maxCategories - 1);
      const otherCategories = categories.slice(maxCategories - 1);
      
      const othersTotal = otherCategories.reduce((sum, cat) => ({
        category: 'Others',
        totalAmount: sum.totalAmount + cat.totalAmount,
        transactionCount: sum.transactionCount + cat.transactionCount,
        avgTransactionAmount: 0, // Will be recalculated
      }), { category: 'Others', totalAmount: 0, transactionCount: 0, avgTransactionAmount: 0 });
      
      if (othersTotal.transactionCount > 0) {
        othersTotal.avgTransactionAmount = othersTotal.totalAmount / othersTotal.transactionCount;
        return [...topCategories, othersTotal];
      }
      
      return topCategories;
    },
  }), []);

  // Memoized formatters
  const formatters = useMemo(() => ({
    /**
     * Format currency with appropriate precision based on amount
     */
    formatCurrency: (amount: number, compact: boolean = false): string => {
      if (compact && amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      }
      if (compact && amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: amount >= 100 ? 0 : 2,
        maximumFractionDigits: amount >= 100 ? 0 : 2,
      }).format(amount);
    },

    /**
     * Format percentage with appropriate precision
     */
    formatPercentage: (value: number): string => {
      return `${Math.round(value)}%`;
    },

    /**
     * Format date ranges for display
     */
    formatDateRange: (start: Date, end: Date): string => {
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric' 
      };
      
      if (start.getFullYear() !== end.getFullYear()) {
        options.year = 'numeric';
      }
      
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    },
  }), []);

  // Memoized color utilities
  const colorUtils = useMemo(() => ({
    /**
     * Generate accessible color palette
     */
    getCategoryColors: (): string[] => [
      '#4A9EFF', // Blue
      '#2ECC71', // Green  
      '#FF8A4A', // Orange
      '#9B59B6', // Purple
      '#E74C3C', // Red
      '#F39C12', // Yellow
      '#E67E22', // Dark Orange
      '#8E44AD', // Dark Purple
      '#16A085', // Teal
      '#34495E', // Dark Gray
    ],

    /**
     * Get status color based on budget performance
     */
    getPerformanceColor: (utilization: number): string => {
      if (utilization <= 75) return '#2ECC71'; // Green - good
      if (utilization <= 90) return '#F39C12'; // Yellow - warning
      if (utilization <= 100) return '#FF8A4A'; // Orange - caution
      return '#E74C3C'; // Red - over budget
    },
  }), []);

  return {
    processChartData,
    formatters,
    colorUtils,
  };
};
