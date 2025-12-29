# Stats Components

A collection of reusable, performant React Native components for displaying financial statistics and analytics in the budget app.

## Architecture

### Components Structure

The stats module follows a clean component architecture with separated concerns:

```
components/stats/
├── index.ts                    # Component exports
├── theme.ts                   # Shared theme constants
├── performanceUtils.ts        # Performance utilities
├── StatsHeader.tsx           # Header with navigation
├── FilterControls.tsx        # Period and budget filters
├── TotalSpentDisplay.tsx     # Total spending summary
├── SpendingTrendsChart.tsx   # Daily trends visualization
├── TopCategoriesChart.tsx    # Category breakdown with donut chart
├── BudgetPerformanceCard.tsx # Budget utilization metrics
├── RecurringVsOneTimeCard.tsx # Transaction type breakdown
├── SavingsEstimateCard.tsx   # Savings projections
└── StatsStates.tsx           # Loading and error states
```

### Business Logic

All business logic is centralized in the custom `useStats` hook:

- Data fetching and caching
- Filter state management
- Performance optimizations
- Error handling
- Loading states

## Component Guidelines

### Component Size Limits

All components are designed to be:
- **Under 200 lines** for better readability
- **Single responsibility** - each component handles one UI concern
- **Highly reusable** with prop-based customization
- **Performance optimized** with memoization where appropriate

### Performance Optimizations

1. **Data Processing**: Large datasets are optimized for mobile rendering
   - Daily trends limited to 30 data points maximum
   - Categories grouped into "Others" when more than 5 exist
   - Parallel data fetching using `Promise.all()`

2. **Rendering Optimizations**:
   - Memoized calculations using `useMemo`
   - Optimized chart data processing
   - Efficient color palette generation

3. **Database Query Optimizations**:
   - Aggregated SQL queries in `StatsService`
   - Indexed fields for fast filtering
   - Single queries with JOINs instead of multiple N+1 queries

## Usage

### Basic Implementation

```tsx
import { useStats } from '@/hooks/useStats';
import { StatsHeader, FilterControls, TopCategoriesChart } from '@/components/stats';

const MyStatsScreen = () => {
  const {
    statsData,
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    getCategoryColors,
  } = useStats();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refreshData} />;

  return (
    <ScrollView>
      <StatsHeader onBackPress={() => router.back()} />
      <FilterControls 
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />
      <TopCategoriesChart
        categoryStats={statsData.categoryStats}
        getCategoryColors={getCategoryColors}
      />
    </ScrollView>
  );
};
```

### Custom Styling

All components accept a `colors` prop for theme customization:

```tsx
import { StatsTheme } from '@/components/stats/theme';

const customColors = {
  ...StatsTheme.colors,
  primaryBlue: '#007AFF', // Custom brand color
  background: '#000000',  // Dark mode
};

<TopCategoriesChart
  categoryStats={data}
  colors={customColors}
  getCategoryColors={getCategoryColors}
/>
```

## Performance Considerations

### Mobile Optimization

1. **Chart Rendering**: Limited data points prevent UI lag on slower devices
2. **Memory Management**: Components unmount cleanly without memory leaks
3. **Database Queries**: Optimized SQL with proper indexing
4. **Data Processing**: Client-side aggregations are minimized

### Query Optimization

The `StatsService` uses optimized SQL queries:

```sql
-- Example: Category spending with single query
SELECT 
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  ROUND(AVG(amount), 2) as avg_amount
FROM expenses 
WHERE date BETWEEN ? AND ?
  AND budget_id = ?
GROUP BY category
ORDER BY total_amount DESC;
```

### Caching Strategy

- Filter changes trigger optimized data refetch
- `useFocusEffect` ensures fresh data on screen navigation
- Memoized calculations prevent unnecessary re-computations

## Theme System

Consistent styling across all stats components using the shared theme:

```typescript
export const StatsTheme = {
  colors: {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    primaryBlue: '#4A9EFF',
    // ... more colors
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  borderRadius: { sm: 6, md: 8, lg: 12, xl: 16 },
  typography: { small: 12, body: 14, title: 18 },
};
```

## Testing

Components are designed for easy testing:

- Pure functions for data processing
- Mocked services for unit testing  
- Prop-driven behavior for component testing
- Accessible components with proper labels

## Future Enhancements

1. **Interactive Charts**: Add touch interactions to charts
2. **Export Functionality**: PDF/CSV export of stats data
3. **Comparison Views**: Compare different time periods
4. **Predictive Analytics**: ML-based spending predictions
5. **Real-time Updates**: WebSocket integration for live data
