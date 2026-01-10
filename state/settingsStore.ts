import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Currency interface
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  locale: string;
}

// Settings data interface
export interface SettingsData {
  id: string;
  currency: Currency;
  monthStartDate: number; // 1-31
  budgetCarryover: boolean;
  defaultAccountId: string | null;
  theme: 'light' | 'dark' | 'system';
  appLock: 'none' | 'faceId' | 'touchId' | 'passcode';
  createdAt: Date;
  updatedAt: Date;
}

// Interface for updating settings
export interface UpdateSettingsData {
  currency?: Currency;
  monthStartDate?: number;
  budgetCarryover?: boolean;
  defaultAccountId?: string | null;
  theme?: 'light' | 'dark' | 'system';
  appLock?: 'none' | 'faceId' | 'touchId' | 'passcode';
}

// Store state interface
interface SettingsState {
  settings: SettingsData | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Store actions interface
interface SettingsActions {
  initializeSettings: () => void;
  updateSettings: (updates: UpdateSettingsData) => void;
  setSettings: (settings: SettingsData) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  // Convenience getters
  getCurrency: () => Currency;
  getMonthStartDate: () => number;
  getBudgetCarryover: () => boolean;
  getTheme: () => 'light' | 'dark' | 'system';
  getAppLock: () => 'none' | 'faceId' | 'touchId' | 'passcode';
}

// Combined store interface
export interface SettingsStore extends SettingsState, SettingsActions {}

// Popular currencies list
export const CURRENCIES: Currency[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: 'India',
    locale: 'en-IN',
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    country: 'United States',
    locale: 'en-US',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    country: 'European Union',
    locale: 'de-DE',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    country: 'United Kingdom',
    locale: 'en-GB',
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    country: 'Japan',
    locale: 'ja-JP',
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    country: 'China',
    locale: 'zh-CN',
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    country: 'Canada',
    locale: 'en-CA',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    country: 'Australia',
    locale: 'en-AU',
  },
  {
    code: 'CHF',
    symbol: 'Fr',
    name: 'Swiss Franc',
    country: 'Switzerland',
    locale: 'de-CH',
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    country: 'Singapore',
    locale: 'en-SG',
  },
  {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    country: 'Hong Kong',
    locale: 'en-HK',
  },
  {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    country: 'Sweden',
    locale: 'sv-SE',
  },
  {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    country: 'Norway',
    locale: 'nb-NO',
  },
  {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    country: 'Denmark',
    locale: 'da-DK',
  },
  {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Złoty',
    country: 'Poland',
    locale: 'pl-PL',
  },
  {
    code: 'CZK',
    symbol: 'Kč',
    name: 'Czech Koruna',
    country: 'Czech Republic',
    locale: 'cs-CZ',
  },
  {
    code: 'HUF',
    symbol: 'Ft',
    name: 'Hungarian Forint',
    country: 'Hungary',
    locale: 'hu-HU',
  },
  {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    country: 'Russia',
    locale: 'ru-RU',
  },
  {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    country: 'Brazil',
    locale: 'pt-BR',
  },
  {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    country: 'Mexico',
    locale: 'es-MX',
  },
  {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    country: 'South Korea',
    locale: 'ko-KR',
  },
  {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    country: 'Thailand',
    locale: 'th-TH',
  },
  {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    country: 'Malaysia',
    locale: 'ms-MY',
  },
  {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    country: 'Indonesia',
    locale: 'id-ID',
  },
  {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    country: 'Philippines',
    locale: 'en-PH',
  },
  {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    country: 'Vietnam',
    locale: 'vi-VN',
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    country: 'United Arab Emirates',
    locale: 'ar-AE',
  },
  {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    country: 'Saudi Arabia',
    locale: 'ar-SA',
  },
  {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    country: 'South Africa',
    locale: 'en-ZA',
  },
  {
    code: 'EGP',
    symbol: '£',
    name: 'Egyptian Pound',
    country: 'Egypt',
    locale: 'ar-EG',
  },
];

// Default settings
const DEFAULT_SETTINGS: SettingsData = {
  id: 'app-settings',
  currency: CURRENCIES[0], // Indian Rupee as default
  monthStartDate: 1,
  budgetCarryover: false,
  defaultAccountId: null,
  theme: 'dark',
  appLock: 'none',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper function to get currency by code
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find((currency) => currency.code === code);
};

// Helper function to generate month start dates (1-28 to avoid month-end issues)
export const getMonthStartDates = (): { value: number; label: string }[] => {
  const dates = [];
  for (let i = 1; i <= 28; i++) {
    const suffix = i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th';
    dates.push({
      value: i,
      label: `${i}${suffix}`,
    });
  }
  return dates;
};

// Create the Zustand store with immer for immutable updates
export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      settings: null,
      isLoading: false,
      isInitialized: false,

      // Actions
      initializeSettings: () => {
        set((state) => {
          if (!state.settings) {
            state.settings = DEFAULT_SETTINGS;
          }
          state.isInitialized = true;
        });
      },

      updateSettings: (updates: UpdateSettingsData) => {
        set((state) => {
          if (state.settings) {
            Object.assign(state.settings, updates);
            state.settings.updatedAt = new Date();
          }
        });
      },

      setSettings: (settings: SettingsData) => {
        set((state) => {
          state.settings = settings;
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setInitialized: (initialized: boolean) => {
        set((state) => {
          state.isInitialized = initialized;
        });
      },

      // Convenience getters
      getCurrency: () => {
        const { settings } = get();
        return settings?.currency || DEFAULT_SETTINGS.currency;
      },

      getMonthStartDate: () => {
        const { settings } = get();
        return settings?.monthStartDate || DEFAULT_SETTINGS.monthStartDate;
      },

      getBudgetCarryover: () => {
        const { settings } = get();
        return settings?.budgetCarryover || DEFAULT_SETTINGS.budgetCarryover;
      },

      getTheme: () => {
        const { settings } = get();
        return settings?.theme || DEFAULT_SETTINGS.theme;
      },

      getAppLock: () => {
        const { settings } = get();
        return settings?.appLock || DEFAULT_SETTINGS.appLock;
      },
    }))
  )
);

// Convenience hooks for common selections
export const useCurrentCurrency = () => {
  return useSettingsStore((state) => state.getCurrency());
};

export const useMonthStartDate = () => {
  return useSettingsStore((state) => state.getMonthStartDate());
};

export const useTheme = () => {
  return useSettingsStore((state) => state.getTheme());
};

export const useAppLock = () => {
  return useSettingsStore((state) => state.getAppLock());
};

export const useSettingsLoading = () => {
  return useSettingsStore((state) => state.isLoading);
};

export const useSettingsInitialized = () => {
  return useSettingsStore((state) => state.isInitialized);
};
