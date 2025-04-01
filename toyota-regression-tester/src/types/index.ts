export interface CountryLanguageCode {
  pretty: string;
  hasLexus?: boolean;
  hasStock?: boolean;
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
  [key: string]: string;
}>;

export type Component = 'car-filter' | 'used-stock-cars' | 'used-stock-cars-pdf';
export type Environment = 'localhost' | 'dev' | 'acc' | 'prev' | 'prod';
export type UscContext = 'used' | 'stock';
export type UscEnv = 'uat' | 'production';
export type Brand = 'toyota' | 'lexus';

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}