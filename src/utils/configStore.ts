import { SelectedOptions } from '../types';
import { countryLanguageCodes } from './index';

// Storage keys
const SINGLE_VIEW_CONFIG_KEY = 'toyota-regression-tester-single-view-config';
const MULTIBOX_VIEW_CONFIG_KEY = 'toyota-regression-tester-multibox-view-config';

// Default configuration
export const defaultOptions: SelectedOptions = {
  environment: 'prev',
  component: 'car-filter',
  uscContext: 'used',
  uscEnv: 'uat',
  brand: 'toyota',
  variantBrand: 'toyota',
  device: 'desktop', // Default to desktop view
};

// Type for saved configuration
interface SavedConfig {
  selectedOptions: SelectedOptions;
  countryLanguageCode: string;
}

// Save Single View configuration
export const saveSingleViewConfig = (config: SavedConfig): void => {
  try {
    localStorage.setItem(SINGLE_VIEW_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save Single View configuration', error);
  }
};

// Load Single View configuration
export const loadSingleViewConfig = (): SavedConfig | null => {
  try {
    const savedConfig = localStorage.getItem(SINGLE_VIEW_CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Failed to load Single View configuration', error);
  }
  
  // Return default config if nothing is saved
  return {
    selectedOptions: { ...defaultOptions },
    countryLanguageCode: Object.keys(countryLanguageCodes)[0]
  };
};

// Save Multibox first frame configuration to reuse in Single View
export const saveMultiboxFirstFrameConfig = (config: SavedConfig): void => {
  try {
    localStorage.setItem(MULTIBOX_VIEW_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save Multibox configuration', error);
  }
};

// Load Multibox configuration
export const loadMultiboxFirstFrameConfig = (): SavedConfig | null => {
  try {
    const savedConfig = localStorage.getItem(MULTIBOX_VIEW_CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Failed to load Multibox configuration', error);
  }
  
  return null; // Return null so we can explicitly handle fallback logic where this is called
};