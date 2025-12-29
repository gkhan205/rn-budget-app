import type { CategorySpendingStats } from '@/db/services/statsService';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TopCategoriesChartProps {
  categoryStats: CategorySpendingStats[];
  colors: Record<string, string>;
  selectedTab: string;
  getCategoryColors: () => string[];
}

const TopCategoriesChart: React.FC<TopCategoriesChartProps> = ({
  categoryStats,
  colors,
  selectedTab,
  getCategoryColors,
}) => {
  const topCategories = categoryStats.slice(0, 5); // Show top 5 categories
  const totalAmount = topCategories.reduce((sum, cat) => sum + cat.totalAmount, 0);
  const categoryColors = getCategoryColors();

  const formatAmount = (amount: number) => {
    return amount > 1000 
      ? `${(amount / 1000).toFixed(1)}k` 
      : amount.toFixed(0);
  };

  const getChartTitle = () => {
    return selectedTab === 'Income' ? 'Top Income Sources' : 'Top Categories';
  };

  const renderDonutChart = () => (
    <View style={styles.donutContainer}>
      <View style={styles.donutChart}>
        {/* Outer ring with segments */}
        <View style={[styles.donutRing, { borderColor: colors.border }]}>
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
          <Text style={[styles.donutLabel, { color: colors.subText }]}>
            Total
          </Text>
          <Text style={[styles.donutValue, { color: colors.text }]}>
            ${formatAmount(totalAmount)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCategoriesList = () => (
    <View style={styles.categoriesList}>
      {topCategories.map((category, index) => {
        const percentage = totalAmount > 0 
          ? Math.round((category.totalAmount / totalAmount) * 100) 
          : 0;
        
        return (
          <View key={category.category} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[
                styles.categoryDot, 
                { backgroundColor: categoryColors[index] }
              ]} />
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {category.category || (selectedTab === 'Income' ? 'Other Income' : 'Uncategorized')}
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
            No {selectedTab.toLowerCase()} data available
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {getChartTitle()}
      </Text>
      
      {renderDonutChart()}
      {renderCategoriesList()}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
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
});

export default TopCategoriesChart;
