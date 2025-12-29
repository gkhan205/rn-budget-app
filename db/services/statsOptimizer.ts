import { sql } from 'drizzle-orm';
import { getDrizzleDb } from '../config';

/**
 * Optimized database utilities for Stats queries
 * Focuses on performance for mobile devices
 */

export class StatsQueryOptimizer {
  
  /**
   * Create database indexes for optimal stats query performance
   * Should be called during app initialization or migration
   */
  static async createStatsIndexes(): Promise<void> {
    const db = getDrizzleDb();
    
    try {
      // Index for date range queries (most common filter)
      await db.run(sql`
        CREATE INDEX IF NOT EXISTS idx_expenses_date 
        ON expenses(date)
      `);
      
      // Composite index for category analytics
      await db.run(sql`
        CREATE INDEX IF NOT EXISTS idx_expenses_category_date 
        ON expenses(category, date)
      `);
      
      // Index for budget filtering
      await db.run(sql`
        CREATE INDEX IF NOT EXISTS idx_expenses_budget_date 
        ON expenses(budget_id, date)
      `);
      
      // Index for recurring expenses analysis
      await db.run(sql`
        CREATE INDEX IF NOT EXISTS idx_expenses_recurring_date 
        ON expenses(is_recurring, date)
      `);
      
      // Composite index for comprehensive filtering
      await db.run(sql`
        CREATE INDEX IF NOT EXISTS idx_expenses_comprehensive 
        ON expenses(budget_id, category, date, is_recurring)
      `);
      
      console.log('Stats database indexes created successfully');
    } catch (error) {
      console.error('Failed to create stats indexes:', error);
    }
  }
  
  /**
   * Analyze query performance and suggest optimizations
   */
  static async analyzeQueryPerformance(query: string): Promise<{
    executionTime: number;
    usesIndex: boolean;
    suggestions: string[];
  }> {
    const db = getDrizzleDb();
    const startTime = Date.now();
    
    try {
      // Execute EXPLAIN QUERY PLAN to analyze performance
      const explanation = await db.all(sql`EXPLAIN QUERY PLAN ${sql.raw(query)}`);
      const executionTime = Date.now() - startTime;
      
      // Check if indexes are being used
      const usesIndex = explanation.some((row: any) => 
        row.detail?.toLowerCase().includes('using index') ||
        row.detail?.toLowerCase().includes('index scan')
      );
      
      const suggestions: string[] = [];
      
      if (!usesIndex) {
        suggestions.push('Consider adding appropriate indexes for this query');
      }
      
      if (executionTime > 100) {
        suggestions.push('Query execution time is high, consider optimization');
      }
      
      // Analyze for common performance issues
      if (query.toLowerCase().includes('select *')) {
        suggestions.push('Avoid SELECT * queries, specify only needed columns');
      }
      
      if (query.toLowerCase().includes('order by') && !query.toLowerCase().includes('limit')) {
        suggestions.push('Consider adding LIMIT to ORDER BY queries for better performance');
      }
      
      return {
        executionTime,
        usesIndex,
        suggestions,
      };
    } catch (error) {
      console.error('Query analysis failed:', error);
      return {
        executionTime: Date.now() - startTime,
        usesIndex: false,
        suggestions: ['Query analysis failed'],
      };
    }
  }
  
  /**
   * Get optimized query hints for common stats patterns
   */
  static getQueryOptimizationHints(): Record<string, string> {
    return {
      categorySpending: `
        -- Optimized category spending query
        -- Uses composite index on (category, date) 
        SELECT category, SUM(amount), COUNT(*), AVG(amount)
        FROM expenses 
        WHERE date >= ? AND date <= ?
        GROUP BY category 
        ORDER BY SUM(amount) DESC
        LIMIT 10; -- Limit results for mobile performance
      `,
      
      dailyTrends: `
        -- Optimized daily trends query
        -- Uses date index with DATE() function optimization
        SELECT DATE(date) as day, SUM(amount), COUNT(*)
        FROM expenses 
        WHERE date >= ? AND date <= ?
        GROUP BY DATE(date)
        ORDER BY day ASC;
      `,
      
      budgetPerformance: `
        -- Optimized budget performance with JOIN
        -- Single query instead of multiple N+1 queries
        SELECT 
          b.id, b.name, b.income as planned,
          COALESCE(SUM(e.amount), 0) as actual
        FROM budgets b
        LEFT JOIN expenses e ON b.id = e.budget_id 
          AND e.date >= ? AND e.date <= ?
        WHERE b.is_archived = 0
        GROUP BY b.id, b.name, b.income;
      `,
      
      recurringAnalysis: `
        -- Optimized recurring vs non-recurring analysis
        -- Uses conditional aggregation for single pass
        SELECT 
          SUM(CASE WHEN is_recurring = 1 THEN amount ELSE 0 END) as recurring,
          SUM(CASE WHEN is_recurring = 0 OR is_recurring IS NULL THEN amount ELSE 0 END) as non_recurring,
          COUNT(CASE WHEN is_recurring = 1 THEN 1 END) as recurring_count,
          COUNT(CASE WHEN is_recurring = 0 OR is_recurring IS NULL THEN 1 END) as non_recurring_count
        FROM expenses 
        WHERE date >= ? AND date <= ?;
      `
    };
  }
  
  /**
   * Optimize data for mobile chart rendering
   */
  static optimizeChartData<T extends { date?: string; totalAmount?: number }>(
    data: T[], 
    maxPoints: number = 30
  ): T[] {
    if (data.length <= maxPoints) return data;
    
    // Use sampling to reduce data points while preserving trends
    const step = Math.floor(data.length / maxPoints);
    const sampled: T[] = [];
    
    for (let i = 0; i < data.length; i += step) {
      // Take the average of points in this segment for smoother visualization
      const segment = data.slice(i, Math.min(i + step, data.length));
      
      if (segment.length > 0) {
        const avgPoint = { ...segment[0] };
        if (avgPoint.totalAmount !== undefined) {
          avgPoint.totalAmount = segment.reduce((sum, point) => 
            sum + (point.totalAmount || 0), 0
          ) / segment.length;
        }
        sampled.push(avgPoint);
      }
    }
    
    return sampled;
  }
  
  /**
   * Memory-efficient category grouping for mobile
   */
  static groupSmallCategories<T extends { category: string; totalAmount: number; transactionCount: number }>(
    categories: T[], 
    maxCategories: number = 5
  ): T[] {
    if (categories.length <= maxCategories) return categories;
    
    const topCategories = categories.slice(0, maxCategories - 1);
    const smallCategories = categories.slice(maxCategories - 1);
    
    if (smallCategories.length === 0) return topCategories;
    
    // Aggregate smaller categories into "Others"
    const othersGroup = smallCategories.reduce((acc, category) => ({
      category: 'Others',
      totalAmount: acc.totalAmount + category.totalAmount,
      transactionCount: acc.transactionCount + category.transactionCount,
    }), { category: 'Others', totalAmount: 0, transactionCount: 0 } as any);
    
    return [...topCategories, othersGroup];
  }
}

/**
 * Performance monitoring utilities
 */
export class StatsPerformanceMonitor {
  private static queryTimes: Map<string, number[]> = new Map();
  
  static startTimer(queryName: string): string {
    const timerId = `${queryName}_${Date.now()}_${Math.random()}`;
    return timerId;
  }
  
  static endTimer(timerId: string, queryName: string): void {
    const [, startTime] = timerId.split('_');
    const duration = Date.now() - parseInt(startTime);
    
    if (!this.queryTimes.has(queryName)) {
      this.queryTimes.set(queryName, []);
    }
    
    const times = this.queryTimes.get(queryName)!;
    times.push(duration);
    
    // Keep only last 10 measurements
    if (times.length > 10) {
      times.shift();
    }
    
    // Log slow queries
    if (duration > 200) {
      console.warn(`Slow stats query detected: ${queryName} took ${duration}ms`);
    }
  }
  
  static getPerformanceReport(): Record<string, { avg: number; max: number; count: number }> {
    const report: Record<string, { avg: number; max: number; count: number }> = {};
    
    for (const [queryName, times] of this.queryTimes) {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const max = Math.max(...times);
      
      report[queryName] = {
        avg: Math.round(avg),
        max,
        count: times.length,
      };
    }
    
    return report;
  }
}
