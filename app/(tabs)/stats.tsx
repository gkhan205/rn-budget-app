import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BudgetService } from '@/db/services/budgetService';
import type { BudgetPerformanceStats, CategorySpendingStats, DailySpendingTrend, RecurringVsNonRecurringStats } from '@/db/services/statsService';
import { StatsService } from '@/db/services/statsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
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

const StatsScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [selectedTab, setSelectedTab] = useState('Expense');
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics data state
  const [categoryStats, setCategoryStats] = useState<CategorySpendingStats[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailySpendingTrend[]>([]);
  const [budgetPerformance, setBudgetPerformance] = useState<BudgetPerformanceStats[]>([]);
  const [recurringStats, setRecurringStats] = useState<RecurringVsNonRecurringStats | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  
  // Available budgets for filtering
  const [availableBudgets, setAvailableBudgets] = useState<Budget[]>([]);

  const colors = {
    background: isDark ? '#1A1B1F' : '#F5F5F5',
    cardBackground: isDark ? '#2A2D32' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#9BA1A6' : '#666666',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    orange: '#FF8A4A',
    purple: '#9B59B6',
    border: isDark ? '#404348' : '#E0E0E0',
    chartLine: '#4A9EFF',
  };

  const periods = ['Week', 'Month', 'Year', 'Custom'];

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

  // Helper function to get category colors
  const getCategoryColors = (): string[] => [
    colors.primaryBlue,
    colors.green,
    colors.orange,
    colors.purple,
    colors.red,
    '#F39C12',
    '#E67E22',
    '#8E44AD',
  ];

  // Load analytics data from database
  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dateRange = getDateRangeForPeriod(selectedPeriod);
      
      // Load all analytics data in parallel
      const [
        budgets,
        categoryStatsData,
        dailyTrendsData,
        budgetPerformanceData,
        recurringStatsData,
      ] = await Promise.all([
        BudgetService.getActive(),
        StatsService.getCategorySpendingStats(dateRange.start, dateRange.end, selectedBudget || undefined),
        StatsService.getDailySpendingTrend(dateRange.start, dateRange.end, selectedBudget || undefined),
        StatsService.getBudgetPerformanceStats(dateRange.start, dateRange.end),
        StatsService.getRecurringVsNonRecurringStats(dateRange.start, dateRange.end, selectedBudget || undefined),
      ]);

      // Update state with loaded data
      setAvailableBudgets(budgets.map(b => ({ id: b.id, name: b.name })));
      setCategoryStats(categoryStatsData);
      setDailyTrends(dailyTrendsData);
      setBudgetPerformance(budgetPerformanceData);
      setRecurringStats(recurringStatsData);
      
      // Calculate total spent
      const total = categoryStatsData.reduce((sum, cat) => sum + cat.totalAmount, 0);
      setTotalSpent(total);

    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, selectedBudget, getDateRangeForPeriod]);

  // Load data on screen focus and when filters change
  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData();
    }, [loadAnalyticsData])
  );

  const handleBackPress = () => {
    router.back();
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Statistics</Text>
      <TouchableOpacity style={styles.infoButton}>
        <IconSymbol name="eye" size={24} color={colors.primaryBlue} />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[
          styles.tab, 
          { backgroundColor: selectedTab === 'Income' ? colors.border : 'transparent' }
        ]}
        onPress={() => setSelectedTab('Income')}
      >
        <Text style={[styles.tabText, { color: selectedTab === 'Income' ? colors.text : colors.subText }]}>
          Income
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tab, 
          { backgroundColor: selectedTab === 'Expense' ? colors.border : 'transparent' }
        ]}
        onPress={() => setSelectedTab('Expense')}
      >
        <Text style={[styles.tabText, { color: selectedTab === 'Expense' ? colors.text : colors.subText }]}>
          Expense
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodSelector = () => (
    <View>
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
                backgroundColor: selectedPeriod === period ? colors.primaryBlue : colors.cardBackground,
              }
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              { color: selectedPeriod === period ? '#FFFFFF' : colors.text }
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Budget Filter */}
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
              backgroundColor: !selectedBudget ? colors.primaryBlue : colors.cardBackground,
            }
          ]}
          onPress={() => setSelectedBudget(null)}
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
                backgroundColor: selectedBudget === budget.id ? colors.primaryBlue : colors.cardBackground,
              }
            ]}
            onPress={() => setSelectedBudget(budget.id)}
          >
            <Text style={[
              styles.budgetFilterText,
              { color: selectedBudget === budget.id ? '#FFFFFF' : colors.text }
            ]}>
              {budget.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTotalSpent = () => {
    const dateRange = getDateRangeForPeriod(selectedPeriod);
    const periodLabel = selectedPeriod === 'Custom' && customDateRange 
      ? `${customDateRange.start.toLocaleDateString()} - ${customDateRange.end.toLocaleDateString()}`
      : `${selectedPeriod} (${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()})`;

    return (
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: colors.subText }]}>
          Total Spent ({periodLabel})
        </Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    );
  };

  const renderSpendingTrends = () => {
    const maxValue = Math.max(...dailyTrends.map(d => d.totalAmount), 500); // Minimum scale of 500
    const chartPoints = dailyTrends.slice(0, 7); // Show up to 7 points for readability

    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Trends</Text>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>Daily</Text>
        </View>
        
        {/* Chart Placeholder */}
        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            {/* Y-axis values */}
            <View style={styles.yAxis}>
              <Text style={[styles.axisText, { color: colors.subText }]}>{Math.round(maxValue)}</Text>
              <Text style={[styles.axisText, { color: colors.subText }]}>{Math.round(maxValue * 0.8)}</Text>
              <Text style={[styles.axisText, { color: colors.subText }]}>{Math.round(maxValue * 0.6)}</Text>
              <Text style={[styles.axisText, { color: colors.subText }]}>{Math.round(maxValue * 0.4)}</Text>
              <Text style={[styles.axisText, { color: colors.subText }]}>{Math.round(maxValue * 0.2)}</Text>
              <Text style={[styles.axisText, { color: colors.subText }]}>0</Text>
            </View>
            
            {/* Chart lines */}
            <View style={styles.chartPlot}>
              {/* Grid lines */}
              <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLine, { backgroundColor: colors.border, top: '20%' }]} />
              <View style={[styles.gridLine, { backgroundColor: colors.border, top: '40%' }]} />
              <View style={[styles.gridLine, { backgroundColor: colors.border, top: '60%' }]} />
              <View style={[styles.gridLine, { backgroundColor: colors.border, top: '80%' }]} />
              
              {/* Chart points from real data */}
              <View style={styles.chartLine}>
                {chartPoints.map((point, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chartPoint,
                      {
                        left: `${(index / Math.max(chartPoints.length - 1, 1)) * 90}%`,
                        bottom: `${(point.totalAmount / maxValue) * 100}%`,
                        backgroundColor: colors.chartLine,
                      }
                    ]}
                  />
                ))}
                
                {/* Highlight highest point with label */}
                {chartPoints.length > 0 && (() => {
                  const highestPoint = chartPoints.reduce((max, current) => 
                    current.totalAmount > max.totalAmount ? current : max
                  );
                  const highestIndex = chartPoints.findIndex(p => p === highestPoint);
                  
                  return (
                    <View style={[
                      styles.highlightPoint, 
                      { 
                        left: `${(highestIndex / Math.max(chartPoints.length - 1, 1)) * 90}%`, 
                        bottom: `${(highestPoint.totalAmount / maxValue) * 100}%` 
                      }
                    ]}>
                      <View style={[styles.pointLabel, { backgroundColor: colors.text }]}>
                        <Text style={[styles.pointLabelText, { color: colors.background }]}>
                          ${highestPoint.totalAmount.toFixed(0)}
                        </Text>
                      </View>
                      <View style={[styles.point, { backgroundColor: colors.chartLine }]} />
                    </View>
                  );
                })()}
              </View>
            </View>
          </View>
          
          {/* X-axis */}
          <View style={styles.xAxis}>
            {chartPoints.map((point, index) => (
              <Text key={index} style={[styles.axisText, { color: colors.subText }]}>
                {new Date(point.date).getDate()}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTopCategories = () => {
    const categoryColors = getCategoryColors();
    const topCategories = categoryStats.slice(0, 5); // Show top 5 categories
    const totalAmount = topCategories.reduce((sum, cat) => sum + cat.totalAmount, 0);

    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
        
        {/* Donut Chart Placeholder */}
        <View style={styles.donutContainer}>
          <View style={styles.donutChart}>
            {/* Outer ring with segments */}
            <View style={[styles.donutRing, { borderColor: colors.border }]}>
              {/* Category segments - simplified representation */}
              {topCategories.slice(0, 4).map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.donutSegment, 
                    { 
                      borderTopColor: categoryColors[index], 
                      transform: [{ rotate: `${index * 90}deg` }] 
                    }
                  ]} 
                />
              ))}
            </View>
            
            {/* Center text */}
            <View style={styles.donutCenter}>
              <Text style={[styles.donutLabel, { color: colors.subText }]}>Total</Text>
              <Text style={[styles.donutValue, { color: colors.text }]}>
                ${totalAmount > 1000 ? `${(totalAmount / 1000).toFixed(1)}k` : totalAmount.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Categories list */}
        <View style={styles.categoriesList}>
          {topCategories.map((category, index) => {
            const percentage = totalAmount > 0 ? Math.round((category.totalAmount / totalAmount) * 100) : 0;
            
            return (
              <View key={category.category} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: categoryColors[index] }]} />
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.category || 'Uncategorized'}
                  </Text>
                </View>
                <View style={styles.categoryValues}>
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>
                    ${category.totalAmount.toFixed(0)}
                  </Text>
                  <Text style={[styles.categoryPercentage, { color: colors.subText }]}>
                    {percentage}%
                  </Text>
                </View>
              </View>
            );
          })}
          
          {topCategories.length === 0 && (
            <View style={styles.categoryItem}>
              <Text style={[styles.categoryName, { color: colors.subText }]}>
                No spending data available
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderBudgetPerformance = () => {
    // Calculate overall budget performance from all budgets
    const totalPlanned = budgetPerformance.reduce((sum, bp) => sum + (bp.plannedAmount || 0), 0);
    const totalSpentAcrossBudgets = budgetPerformance.reduce((sum, bp) => sum + bp.actualAmount, 0);
    const utilizationPercentage = totalPlanned > 0 ? Math.round((totalSpentAcrossBudgets / totalPlanned) * 100) : 0;
    const remaining = Math.max(0, totalPlanned - totalSpentAcrossBudgets);

    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Performance</Text>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>
            {utilizationPercentage}% Used
          </Text>
        </View>
        
        <View style={styles.budgetProgress}>
          <View style={styles.budgetInfo}>
            <Text style={[styles.budgetSpent, { color: colors.primaryBlue }]}>
              ${totalSpentAcrossBudgets.toLocaleString()} Spent
            </Text>
            {totalPlanned > 0 ? (
              <Text style={[styles.budgetLimit, { color: colors.subText }]}>
                Limit: ${totalPlanned.toLocaleString()}
              </Text>
            ) : (
              <Text style={[styles.budgetLimit, { color: colors.subText }]}>
                No budget limits set
              </Text>
            )}
          </View>
          
          {totalPlanned > 0 && (
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[
                styles.progressFill, 
                { 
                  backgroundColor: utilizationPercentage > 100 ? colors.red : colors.primaryBlue, 
                  width: `${Math.min(utilizationPercentage, 100)}%` 
                }
              ]} />
            </View>
          )}
          
          <Text style={[styles.budgetRemaining, { color: colors.subText }]}>
            {remaining > 0 ? (
              <>
                You have <Text style={{ color: colors.green }}>${remaining.toLocaleString()}</Text> remaining for this period.
              </>
            ) : utilizationPercentage > 100 ? (
              <>
                You are <Text style={{ color: colors.red }}>${Math.abs(remaining).toLocaleString()}</Text> over budget for this period.
              </>
            ) : (
              'No budget limits set for tracking.'
            )}
          </Text>
        </View>
      </View>
    );
  };

  const renderFixedVsVariable = () => (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recurring vs. One-Time</Text>
      
      <View style={styles.fixedVariableContainer}>
        <View style={styles.fixedSection}>
          <Text style={[styles.fixedLabel, { color: colors.subText }]}>Recurring</Text>
          <Text style={[styles.fixedPercentage, { color: colors.text }]}>
            {recurringStats?.recurringPercentage || 0}%
          </Text>
          <View style={[styles.fixedBar, { backgroundColor: colors.primaryBlue }]} />
          <Text style={[styles.fixedAmount, { color: colors.text }]}>
            ${recurringStats?.recurringTotal.toLocaleString() || '0'}
          </Text>
        </View>
        
        <View style={styles.variableSection}>
          <Text style={[styles.variableLabel, { color: colors.subText }]}>One-Time</Text>
          <Text style={[styles.variablePercentage, { color: colors.text }]}>
            {recurringStats?.nonRecurringPercentage || 0}%
          </Text>
          <View style={[styles.variableBar, { backgroundColor: colors.green }]} />
          <Text style={[styles.variableAmount, { color: colors.text }]}>
            ${recurringStats?.nonRecurringTotal.toLocaleString() || '0'}
          </Text>
        </View>
      </View>
      
      {recurringStats && (
        <View style={styles.recurringDetails}>
          <Text style={[styles.recurringDetailText, { color: colors.subText }]}>
            {recurringStats.recurringCount} recurring transactions • {recurringStats.nonRecurringCount} one-time transactions
          </Text>
        </View>
      )}
    </View>
  );

  const renderSavingsEstimate = () => (
    <View style={[styles.savingsCard, { backgroundColor: colors.primaryBlue }]}>
      <TouchableOpacity style={styles.savingsIcon}>
        <IconSymbol name="doc.text" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.savingsContent}>
        <Text style={styles.savingsTitle}>Savings Estimate</Text>
        <Text style={styles.savingsSubtitle}>Based on current income & expense trends</Text>
        
        <Text style={styles.savingsAmount}>$1,250.00</Text>
        <Text style={styles.savingsTrend}>+12% vs last month</Text>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primaryBlue} />
      <Text style={[styles.loadingText, { color: colors.subText }]}>Loading statistics...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.red} />
      <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to Load Statistics</Text>
      <Text style={[styles.errorMessage, { color: colors.subText }]}>{error}</Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.primaryBlue }]}
        onPress={loadAnalyticsData}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        {isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderTabs()}
            {renderPeriodSelector()}
            {renderTotalSpent()}
            {renderSpendingTrends()}
            {renderTopCategories()}
            {renderBudgetPerformance()}
            {renderFixedVsVariable()}
            {renderSavingsEstimate()}
          </ScrollView>
        )}
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2A2D32',
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
  totalContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
  },
  chartContainer: {
    height: 200,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  axisText: {
    fontSize: 12,
    textAlign: 'right',
  },
  chartPlot: {
    flex: 1,
    position: 'relative',
    marginLeft: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    top: 0,
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  highlightPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  pointLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  pointLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    paddingTop: 10,
  },
  donutContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  donutChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
  },
  donutSegment: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: 'transparent',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  donutValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 14,
  },
  budgetProgress: {
    gap: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSpent: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetLimit: {
    fontSize: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetRemaining: {
    fontSize: 14,
  },
  fixedVariableContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  fixedSection: {
    flex: 1,
  },
  variableSection: {
    flex: 1,
  },
  fixedLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  variableLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  fixedPercentage: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  variablePercentage: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  fixedBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    width: '60%',
  },
  variableBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    width: '40%',
  },
  fixedAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  variableAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  savingsContent: {
    flex: 1,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  savingsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  savingsAmount: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  savingsTrend: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Budget filter styles
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
  // Recurring details styles
  recurringDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recurringDetailText: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatsScreen;
