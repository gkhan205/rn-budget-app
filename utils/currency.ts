import { useCurrentCurrency } from '../state/settingsStore';

/**
 * Format amount with currency symbol based on current settings
 */
export const formatCurrency = (
  amount: number,
  currency?: { symbol: string }
): string => {
  // If currency is provided, use it, otherwise fall back to current currency from settings
  const symbol = currency?.symbol || '₹'; // Default to Indian Rupee if no settings available
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Format amount with currency symbol (no decimals)
 */
export const formatCurrencyShort = (
  amount: number,
  currency?: { symbol: string }
): string => {
  const symbol = currency?.symbol || '₹';

  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }

  return `${symbol}${amount.toFixed(0)}`;
};

/**
 * Hook to get formatted currency with current settings
 */
export const useCurrencyFormatter = () => {
  const currency = useCurrentCurrency();

  return {
    format: (amount: number) => formatCurrency(amount, currency),
    formatShort: (amount: number) => formatCurrencyShort(amount, currency),
    currency,
  };
};

/**
 * Format amount for display with proper decimal handling
 */
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Parse currency string to number (remove symbol and convert to number)
 */
export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except decimal point and minus sign
  const numericString = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};
