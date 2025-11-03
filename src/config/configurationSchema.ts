import { componentMap, countryLanguageCodes } from '../utils';
import { CountryLanguageCode } from '../types';

export type FieldType = 'select' | 'text';

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: string, options: Record<string, string>) => boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean | ((countryCode?: string) => boolean);
  helperText?: string;
}

export interface ConfigurationField {
  key: string;
  label: string;
  description: string;
  type: FieldType;
  defaultValue: string;
  syncEnabled: boolean;
  validationRules?: ValidationRule;
  selectOptions?: SelectOption[];
  dependsOn?: string[]; // Fields this field depends on for conditional logic
  conditionalLogic?: (
    selectedOptions: Record<string, string>,
    countryCode?: string
  ) => {
    disabled?: boolean;
    helperText?: string;
    options?: SelectOption[];
  };
}

export const configurationSchema: ConfigurationField[] = [
  {
    key: 'environment',
    label: 'Environment',
    description: 'Select the deployment environment',
    type: 'select',
    defaultValue: 'prev',
    syncEnabled: true,
    selectOptions: [
      { value: 'localhost', label: 'Localhost' },
      { value: 'dev', label: 'Development' },
      { value: 'acc', label: 'Acceptance' },
      { value: 'prev', label: 'Preview' },
      { value: 'prod', label: 'Production' },
    ],
  },
  {
    key: 'component',
    label: 'Component',
    description: 'Select the component to test',
    type: 'select',
    defaultValue: 'car-filter',
    syncEnabled: true,
    selectOptions: Object.entries(componentMap).map(
      ([key, { title, description }]) => ({
        value: key,
        label: title,
        helperText: description,
      })
    ),
  },
  {
    key: 'uscContext',
    label: 'USC Context',
    description: 'Used or Stock cars',
    type: 'select',
    defaultValue: 'used',
    syncEnabled: true,
    dependsOn: ['component'],
    conditionalLogic: (selectedOptions, countryCode) => {
      const countrySettings = (
        countryCode ? countryLanguageCodes[countryCode] : {}
      ) as CountryLanguageCode;
      const hasStock = countrySettings?.hasStock || false;
      const hasUsed = countrySettings?.hasUsed !== false;

      return {
        disabled: selectedOptions.component === 'used-stock-cars-pdf',
        helperText:
          !hasStock && selectedOptions.uscContext === 'used'
            ? 'Stock is not available for this country'
            : !hasUsed && selectedOptions.uscContext === 'stock'
            ? 'Used is not available for this country'
            : 'Used or Stock cars',
        options: [
          {
            value: 'used',
            label: 'Used',
            disabled: !hasUsed,
            helperText: !hasUsed ? '(Not Available)' : undefined,
          },
          {
            value: 'stock',
            label: 'Stock',
            disabled: !hasStock,
            helperText: !hasStock ? '(Not Available)' : undefined,
          },
        ],
      };
    },
  },
  {
    key: 'uscEnv',
    label: 'USC Environment',
    description: 'Backend environment',
    type: 'select',
    defaultValue: 'uat',
    syncEnabled: true,
    selectOptions: [
      { value: 'uat', label: 'UAT' },
      { value: 'production', label: 'Production' },
    ],
  },
  {
    key: 'brand',
    label: 'Brand',
    description: 'Brand selection',
    type: 'select',
    defaultValue: 'toyota',
    syncEnabled: true,
    conditionalLogic: (selectedOptions, countryCode) => {
      const countrySettings = (
        countryCode ? countryLanguageCodes[countryCode] : {}
      ) as CountryLanguageCode;
      const hasLexus = countrySettings?.hasLexus || false;

      return {
        helperText:
          !hasLexus && selectedOptions.brand === 'toyota'
            ? 'Lexus is not available for this country'
            : 'Brand selection',
        options: [
          { value: 'toyota', label: 'Toyota' },
          {
            value: 'lexus',
            label: 'Lexus',
            disabled: !hasLexus,
            helperText: !hasLexus ? '(Not Available)' : undefined,
          },
        ],
      };
    },
  },
  {
    key: 'variantBrand',
    label: 'Variant Brand',
    description: 'Variant brand for the component',
    type: 'select',
    defaultValue: 'toyota',
    syncEnabled: true,
    selectOptions: [
      { value: 'toyota', label: 'Toyota' },
      { value: 'lexus', label: 'Lexus' },
    ],
  },
  {
    key: 'retailerscreen',
    label: 'Retailer Screen',
    description: 'Enable or disable retailer screen mode',
    type: 'select',
    defaultValue: 'false',
    syncEnabled: true,
    selectOptions: [
      { value: 'true', label: 'Enabled' },
      { value: 'false', label: 'Disabled' },
    ],
  },
  {
    key: 'tyCode',
    label: 'tyCode',
    description: 'Optional Toyota Code',
    type: 'text',
    defaultValue: '',
    syncEnabled: true,
    validationRules: {
      pattern: /^[a-zA-Z0-9]*$/,
    },
  },
];

export const getSyncableSettings = () => {
  return configurationSchema
    .filter((field) => field.syncEnabled)
    .map((field) => ({
      key: field.key,
      label: field.label,
      description: field.description,
    }));
};

export const getDefaultSyncOptions = (): Record<string, boolean> => {
  const syncOptions: Record<string, boolean> = {};
  configurationSchema.forEach((field) => {
    if (field.syncEnabled) {
      syncOptions[field.key] = true;
    }
  });
  return syncOptions;
};

export const getDefaultOptions = (): Record<string, string> => {
  const defaultOptions: Record<string, string> = {};
  configurationSchema.forEach((field) => {
    defaultOptions[field.key] = field.defaultValue;
  });
  return defaultOptions;
};
