import { useCurrentCurrency } from '../state/settingsStore';
import {
  formatCurrency,
  formatCurrencyShort,
  parseCurrency,
} from '../utils/budgetCalculations';

/**
 * Hook to get formatted currency functions with current settings
 */
export const useCurrencyFormatter = () => {
  const currency = useCurrentCurrency();

  return {
    format: (amount: number, showSign: boolean = false) =>
      formatCurrency(amount, currency, showSign),
    formatShort: (amount: number) =>
      formatCurrencyShort(amount, currency.symbol),
    parse: parseCurrency,
    currency,
    symbol: currency.symbol,
  };
};
