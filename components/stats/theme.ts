/**
 * Theme constants for Stats components
 * Provides consistent colors and styling across all stats components
 */

export const StatsTheme = {
  colors: {
    background: '#1A1B1F',
    cardBackground: '#2A2D32',
    text: '#FFFFFF',
    subText: '#9BA1A6',
    primaryBlue: '#4A9EFF',
    green: '#2ECC71',
    red: '#E74C3C',
    orange: '#FF8A4A',
    purple: '#9B59B6',
    yellow: '#F39C12',
    darkOrange: '#E67E22',
    darkPurple: '#8E44AD',
    border: '#404348',
    chartLine: '#4A9EFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
  },
  typography: {
    small: 12,
    body: 14,
    subtitle: 16,
    title: 18,
    heading: 20,
    large: 24,
    xlarge: 28,
    xxlarge: 32,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export type StatsThemeType = typeof StatsTheme;
