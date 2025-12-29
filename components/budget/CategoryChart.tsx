import type { CategorySpend } from '@/hooks/useBudgetDetail';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryChartProps {
  categories: CategorySpend[];
  colors: {
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
  };
  onViewAll?: () => void;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categories,
  colors,
  onViewAll,
}) => {
  // Create pie chart segments
  const createPieChart = () => {
    if (categories.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyChartText, { color: colors.subText }]}>
            No expenses yet
          </Text>
        </View>
      );
    }

    // For now, show a simple representation with the largest category
    const largestCategory = categories[0];
    return (
      <View style={styles.chartCircle}>
        <View 
          style={[
            styles.chartSegment, 
            { 
              backgroundColor: largestCategory?.color || colors.primaryBlue,
              borderColor: colors.cardBackground,
            }
          ]} 
        />
        <View style={styles.chartCenter}>
          <Text style={[styles.chartLabel, { color: colors.text }]}>
            {new Date().toLocaleDateString('en-US', { month: 'short' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.categorySection, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.categorySectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAllText, { color: colors.primaryBlue }]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartPlaceholder}>
          {createPieChart()}
        </View>
        <View style={styles.legendContainer}>
          {categories.length > 0 ? (
            categories.slice(0, 4).map((category, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>{category.name}</Text>
                <Text style={[styles.legendPercent, { color: colors.subText }]}>
                  {category.percentage}%
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noDataText, { color: colors.subText }]}>
              No categories yet
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartPlaceholder: {
    width: 120,
    height: 120,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSegment: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 20,
  },
  chartCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyChart: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#404348',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 12,
    textAlign: 'center',
  },
  legendContainer: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    flex: 1,
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
