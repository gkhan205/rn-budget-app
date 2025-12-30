import {
    CURRENCIES,
    Currency,
    getMonthStartDates,
    useCurrentCurrency,
    useMonthStartDate,
    useSettingsInitialized,
    useSettingsStore,
} from '@/state/settingsStore';
import { useCallback, useEffect } from 'react';

interface UseSettingsReturn {
  // Current values
  currentCurrency: Currency;
  monthStartDate: number;
  
  // Actions
  updateCurrency: (currency: Currency) => void;
  updateMonthStartDate: (date: number) => void;
  
  // Options
  availableCurrencies: Currency[];
  monthStartOptions: { value: number; label: string }[];
  
  // Loading state
  isInitialized: boolean;
}

export const useSettings = (): UseSettingsReturn => {
  const { initializeSettings, updateSettings } = useSettingsStore();
  const currentCurrency = useCurrentCurrency();
  const monthStartDate = useMonthStartDate();
  const isInitialized = useSettingsInitialized();

  // Initialize settings on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeSettings();
    }
  }, [initializeSettings, isInitialized]);

  // Action to update currency
  const updateCurrency = useCallback((currency: Currency) => {
    updateSettings({ currency });
  }, [updateSettings]);

  // Action to update month start date
  const updateMonthStartDate = useCallback((date: number) => {
    updateSettings({ monthStartDate: date });
  }, [updateSettings]);

  return {
    // Current values
    currentCurrency,
    monthStartDate,
    
    // Actions
    updateCurrency,
    updateMonthStartDate,
    
    // Options
    availableCurrencies: CURRENCIES,
    monthStartOptions: getMonthStartDates(),
    
    // Loading state
    isInitialized,
  };
};
