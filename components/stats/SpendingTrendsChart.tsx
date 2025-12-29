import type { DailySpendingTrend } from '@/db/services/statsService';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SpendingTrendsChartProps {
  dailyTrends: DailySpendingTrend[];
  colors: Record<string, string>;
  selectedTab?: string;
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
  dailyTrends,
  colors,
  selectedTab = 'Expense',
}) => {
  const chartPoints = dailyTrends.slice(0, 7); // Show up to 7 points for readability
  const maxValue = Math.max(...dailyTrends.map(d => d.totalAmount), 500); // Minimum scale of 500

  const getChartTitle = () => {
    return selectedTab === 'Income' ? 'Income Trends' : 'Spending Trends';
  };

  const getHighestPoint = () => {
    if (chartPoints.length === 0) return null;
    
    const highestPoint = chartPoints.reduce((max, current) => 
      current.totalAmount > max.totalAmount ? current : max
    );
    const highestIndex = chartPoints.findIndex(p => p === highestPoint);
    
    return { point: highestPoint, index: highestIndex };
  };

  const renderYAxis = () => (
    <View style={styles.yAxis}>
      <Text style={[styles.axisText, { color: colors.subText }]}>
        {Math.round(maxValue)}
      </Text>
      <Text style={[styles.axisText, { color: colors.subText }]}>
        {Math.round(maxValue * 0.8)}
      </Text>
      <Text style={[styles.axisText, { color: colors.subText }]}>
        {Math.round(maxValue * 0.6)}
      </Text>
      <Text style={[styles.axisText, { color: colors.subText }]}>
        {Math.round(maxValue * 0.4)}
      </Text>
      <Text style={[styles.axisText, { color: colors.subText }]}>
        {Math.round(maxValue * 0.2)}
      </Text>
      <Text style={[styles.axisText, { color: colors.subText }]}>0</Text>
    </View>
  );

  const renderGridLines = () => (
    <>
      <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
      <View style={[styles.gridLine, { backgroundColor: colors.border, top: '20%' }]} />
      <View style={[styles.gridLine, { backgroundColor: colors.border, top: '40%' }]} />
      <View style={[styles.gridLine, { backgroundColor: colors.border, top: '60%' }]} />
      <View style={[styles.gridLine, { backgroundColor: colors.border, top: '80%' }]} />
    </>
  );

  const renderChartPoints = () => {
    const highest = getHighestPoint();
    
    return (
      <>
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
        
        {highest && (
          <View style={[
            styles.highlightPoint, 
            { 
              left: `${(highest.index / Math.max(chartPoints.length - 1, 1)) * 90}%`, 
              bottom: `${(highest.point.totalAmount / maxValue) * 100}%` 
            }
          ]}>
            <View style={[styles.pointLabel, { backgroundColor: colors.text }]}>
              <Text style={[styles.pointLabelText, { color: colors.background }]}>
                ${highest.point.totalAmount.toFixed(0)}
              </Text>
            </View>
            <View style={[styles.point, { backgroundColor: colors.chartLine }]} />
          </View>
        )}
      </>
    );
  };

  const renderXAxis = () => (
    <View style={styles.xAxis}>
      {chartPoints.map((point, index) => (
        <Text key={index} style={[styles.axisText, { color: colors.subText }]}>
          {new Date(point.date).getDate()}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {getChartTitle()}
        </Text>
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>
          Daily
        </Text>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartArea}>
          {renderYAxis()}
          
          <View style={styles.chartPlot}>
            {renderGridLines()}
            <View style={styles.chartLine}>
              {renderChartPoints()}
            </View>
          </View>
        </View>
        
        {renderXAxis()}
      </View>
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
});

export default SpendingTrendsChart;
