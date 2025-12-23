import MainLayout from '@/components/MainLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

const StatsScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [selectedTab, setSelectedTab] = useState('Expense');

  const colors = {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    border: '#404348',
    chartLine: '#4A9EFF',
  };

  const periods = ['Week', 'Month', 'Year', 'Custom'];

  const categoryData: CategoryData[] = [
    { id: '1', name: 'Groceries', amount: 980, percentage: 40, color: '#4A9EFF' },
    { id: '2', name: 'Rent', amount: 735, percentage: 30, color: '#2ECC71' },
    { id: '3', name: 'Dining', amount: 367, percentage: 15, color: '#F39C12' },
    { id: '4', name: 'Others', amount: 367, percentage: 15, color: '#9BA1A6' },
  ];

  const chartData = [
    { day: '01', value: 120 },
    { day: '05', value: 180 },
    { day: '10', value: 240 },
    { day: '15', value: 200 },
    { day: '20', value: 320 },
    { day: '25', value: 280 },
    { day: '30', value: 420 },
  ];

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
  );

  const renderTotalSpent = () => (
    <View style={styles.totalContainer}>
      <Text style={[styles.totalLabel, { color: colors.subText }]}>Total Spent (Oct 2023)</Text>
      <Text style={[styles.totalAmount, { color: colors.text }]}>$2,450.00</Text>
    </View>
  );

  const renderSpendingTrends = () => (
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
            <Text style={[styles.axisText, { color: colors.subText }]}>500</Text>
            <Text style={[styles.axisText, { color: colors.subText }]}>400</Text>
            <Text style={[styles.axisText, { color: colors.subText }]}>300</Text>
            <Text style={[styles.axisText, { color: colors.subText }]}>200</Text>
            <Text style={[styles.axisText, { color: colors.subText }]}>100</Text>
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
            
            {/* Sample chart line */}
            <View style={styles.chartLine}>
              {chartData.map((point, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartPoint,
                    {
                      left: `${(index / (chartData.length - 1)) * 90}%`,
                      bottom: `${(point.value / 500) * 100}%`,
                      backgroundColor: colors.chartLine,
                    }
                  ]}
                />
              ))}
              
              {/* Highlight specific point with label */}
              <View style={[styles.highlightPoint, { right: '15%', bottom: '84%' }]}>
                <View style={[styles.pointLabel, { backgroundColor: colors.text }]}>
                  <Text style={[styles.pointLabelText, { color: colors.background }]}>$420</Text>
                </View>
                <View style={[styles.point, { backgroundColor: colors.chartLine }]} />
              </View>
            </View>
          </View>
        </View>
        
        {/* X-axis */}
        <View style={styles.xAxis}>
          <Text style={[styles.axisText, { color: colors.subText }]}>01</Text>
          <Text style={[styles.axisText, { color: colors.subText }]}>05</Text>
          <Text style={[styles.axisText, { color: colors.subText }]}>10</Text>
          <Text style={[styles.axisText, { color: colors.subText }]}>15</Text>
          <Text style={[styles.axisText, { color: colors.subText }]}>20</Text>
          <Text style={[styles.axisText, { color: colors.subText }]}>25</Text>
          <Text style={[styles.axisText, { color: colors.subText }]}>30</Text>
        </View>
      </View>
    </View>
  );

  const renderTopCategories = () => (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
      
      {/* Donut Chart Placeholder */}
      <View style={styles.donutContainer}>
        <View style={styles.donutChart}>
          {/* Outer ring with segments */}
          <View style={[styles.donutRing, { borderColor: colors.border }]}>
            {/* Category segments - simplified as colored arcs */}
            <View style={[styles.donutSegment, { borderTopColor: '#4A9EFF', transform: [{ rotate: '0deg' }] }]} />
            <View style={[styles.donutSegment, { borderTopColor: '#2ECC71', transform: [{ rotate: '144deg' }] }]} />
            <View style={[styles.donutSegment, { borderTopColor: '#F39C12', transform: [{ rotate: '252deg' }] }]} />
            <View style={[styles.donutSegment, { borderTopColor: '#9BA1A6', transform: [{ rotate: '306deg' }] }]} />
          </View>
          
          {/* Center text */}
          <View style={styles.donutCenter}>
            <Text style={[styles.donutLabel, { color: colors.subText }]}>Total</Text>
            <Text style={[styles.donutValue, { color: colors.text }]}>$2.4k</Text>
          </View>
        </View>
      </View>
      
      {/* Categories list */}
      <View style={styles.categoriesList}>
        {categoryData.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            </View>
            <View style={styles.categoryValues}>
              <Text style={[styles.categoryAmount, { color: colors.text }]}>${category.amount}</Text>
              <Text style={[styles.categoryPercentage, { color: colors.subText }]}>{category.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBudgetPerformance = () => (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Performance</Text>
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>81% Used</Text>
      </View>
      
      <View style={styles.budgetProgress}>
        <View style={styles.budgetInfo}>
          <Text style={[styles.budgetSpent, { color: colors.primaryBlue }]}>$2,450 Spent</Text>
          <Text style={[styles.budgetLimit, { color: colors.subText }]}>Limit: $3,000</Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primaryBlue, width: '81%' }]} />
        </View>
        
        <Text style={[styles.budgetRemaining, { color: colors.subText }]}>
          You have <Text style={{ color: colors.green }}>$550.00</Text> remaining for this month.
        </Text>
      </View>
    </View>
  );

  const renderFixedVsVariable = () => (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Fixed vs. Variable</Text>
      
      <View style={styles.fixedVariableContainer}>
        <View style={styles.fixedSection}>
          <Text style={[styles.fixedLabel, { color: colors.subText }]}>Fixed</Text>
          <Text style={[styles.fixedPercentage, { color: colors.text }]}>60%</Text>
          <View style={[styles.fixedBar, { backgroundColor: colors.primaryBlue }]} />
          <Text style={[styles.fixedAmount, { color: colors.text }]}>$1,470</Text>
        </View>
        
        <View style={styles.variableSection}>
          <Text style={[styles.variableLabel, { color: colors.subText }]}>Variable</Text>
          <Text style={[styles.variablePercentage, { color: colors.text }]}>40%</Text>
          <View style={[styles.variableBar, { backgroundColor: colors.green }]} />
          <Text style={[styles.variableAmount, { color: colors.text }]}>$980</Text>
        </View>
      </View>
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

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
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
});

export default StatsScreen;
