export interface CountryLanguageCode {
  pretty: string;
  hasLexus?: boolean;
  hasStock?: boolean;
  hasUsed?: boolean;
  nmsc: string;
}

export interface CountryLanguageCodes {
  [key: string]: CountryLanguageCode;
}

export type SelectedOptions = Partial<{
  environment: string;
  component: string;
  uscContext: string;
  uscEnv: string;
  brand: string;
  variantBrand: string;
  device: string; // New property for device type (mobile/desktop)
  [key: string]: string;
}>;

export type Component = 'car-filter' | 'used-stock-cars' | 'used-stock-cars-pdf';
export type Environment = 'localhost' | 'dev' | 'acc' | 'prev' | 'prod';
export type UscContext = 'used' | 'stock';
export type UscEnv = 'uat' | 'production';
export type Brand = 'toyota' | 'lexus';
export type DeviceType = 'desktop' | 'mobile'; // New type for device options

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}