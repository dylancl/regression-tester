import { CountryLanguageCodes, SelectedOptions } from '../types';

// Country language code map, organized by NMSC (National Marketing and Sales Company)
export const countryLanguageCodes: CountryLanguageCodes = {
  'fr/fr': {
    pretty: 'France',
    hasLexus: true,
    nmsc: 'TFR',
  },
  'es/es': {
    pretty: 'Spain',
    hasLexus: true,
    nmsc: 'TES',
  },
  'se/sv': {
    pretty: 'Sweden',
    hasLexus: true,
    hasStock: true,
    nmsc: 'TSW',
  },
  'dk/da': {
    pretty: 'Denmark',
    hasLexus: true,
    hasStock: true,
    nmsc: 'TDK',
  },
  'fi/fi': {
    pretty: 'Finland',
    hasLexus: true,
    nmsc: 'TAF',
  },
  'be/nl': {
    pretty: 'Belgium (Dutch)',
    nmsc: 'TBEL',
  },
  'be/fr': {
    pretty: 'Belgium (French)',
    nmsc: 'TBEL',
  },
  'be/lu': {
    pretty: 'Belgium (Luxembourg)',
    nmsc: 'TBEL',
  },
  'gr/el': {
    pretty: 'Greece',
    nmsc: 'THEL',
  },
  'it/it': {
    pretty: 'Italy',
    hasLexus: true,
    nmsc: 'TMI',
  },
  'ro/ro': {
    pretty: 'Romania',
    hasStock: true,
    nmsc: 'TROM',
  },
  'bg/bg': {
    pretty: 'Bulgaria',
    hasStock: true,
    nmsc: 'TBG',
  },
  'tr/tr': {
    pretty: 'Turkey',
    nmsc: 'TTMS',
  },
  'de/de': {
    pretty: 'Germany',
    hasLexus: true,
    hasStock: true,
    nmsc: 'TDG',
  },
  'si/sl': {
    pretty: 'Slovenia',
    nmsc: 'TAD',
  },
  'rs/sr': {
    pretty: 'Serbia',
    nmsc: 'TAD',
  },
  'hr/hr': {
    pretty: 'Croatia',
    nmsc: 'TAD',
  },
  'ba/hr': {
    pretty: 'Bosnia and Herzegovina',
    nmsc: 'TAD',
  },
  'ee/et': {
    pretty: 'Estonia',
    hasLexus: true,
    nmsc: 'TBA',
  },
  'lv/lv': {
    pretty: 'Latvia',
    hasLexus: true,
    nmsc: 'TBA',
  },
  'lt/lt': {
    pretty: 'Lithuania',
    hasLexus: true,
    nmsc: 'TBA',
  },
  'az/az': {
    pretty: 'Azerbaijan',
    nmsc: 'TCA',
  },
  'ge/ka': {
    pretty: 'Georgia',
    nmsc: 'TCA',
  },
  'is/is': {
    pretty: 'Iceland',
    nmsc: 'TIC',
  },
  'cy/en': {
    pretty: 'Cyprus',
    nmsc: 'TCY',
  },
};

/**
 * Remove trailing slash and whitespace from a URL
 */
export const removeLastSlashAndWhitespace = (url: string): string => 
  url.replace(/\/\s*$/, '');

/**
 * Build a query string from selected options
 */
export const buildQueryString = (selectedOptions: SelectedOptions): string => {
  return Object.keys(selectedOptions)
    .map((key) => `${key}=${selectedOptions[key]}`)
    .join('&');
};

/**
 * Generate a URL based on the selected options and country language code
 */
export const generateUrl = (
  selectedOptions: SelectedOptions, 
  countryLanguageCode: string
): string => {
  const {
    component,
    environment,
    ...rest
  } = selectedOptions;

  let url: string;
  let environmentString: string = '';

  // Build the base URL based on environment
  switch (environment) {
    case 'localhost':
      url = `http://localhost:5001/${countryLanguageCode}`;
      break;
    case 'dev':
    case 'acc':
    case 'prev':
      environmentString = environment;
      url = `https://usc-webcomponents${environmentString}.toyota-europe.com/${countryLanguageCode}`;
      break;
    case 'prod':
      url = `https://usc-webcomponents.toyota-europe.com/${countryLanguageCode}`;
      break;
    default:
      url = `https://usc-webcomponents.toyota-europe.com/${countryLanguageCode}`;
  }

  // Modify the URL based on the selected component
  const restOptions = {...rest};
  
  // For car-filter, we need to use uscContext as carFilter
  if (component === 'car-filter') {
    restOptions.carFilter = restOptions.uscContext;
    delete restOptions.uscContext;
    url += `/car-filter?${buildQueryString(restOptions)}`;
  } else {
    // For other components, add authorPreview=true
    url += `/${component}?authorPreview=true&${buildQueryString(restOptions)}`;
  }

  return url;
};

/**
 * Parse URL parameters into selected options
 */
export const parseUrlParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const selectedOptions: Record<string, string> = {};
  
  // Special handling for country parameter which may contain a slash
  const countryParam = params.get('country');
  if (countryParam) {
    selectedOptions['country'] = countryParam;
  }
  
  // Process other parameters
  params.forEach((value, key) => {
    if (key !== 'country') { // Skip country since we already handled it
      selectedOptions[key] = value;
    }
  });
  
  return selectedOptions;
};

/**
 * Create a URL with the current options
 */
export const createUrlWithParams = (
  selectedOptions: SelectedOptions, 
  countryCode?: string,
  nmsc?: string
): string => {
  const queryParams = { ...selectedOptions };
  
  // Add country and NMSC information if provided
  if (countryCode) {
    queryParams.country = countryCode;
  }
  
  if (nmsc) {
    queryParams.nmsc = nmsc;
  }
  
  const queryString = buildQueryString(queryParams);
  
  // Get the base path from Vite environment
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Create URL with the base path included
  return `${removeLastSlashAndWhitespace(window.location.origin)}${basePath}?${queryString}`;
};

/**
 * Group countries by NMSC for better organization in dropdowns
 */
export const getCountriesByNmsc = (): Record<string, string[]> => {
  const nmscGroups: Record<string, string[]> = {};
  
  Object.keys(countryLanguageCodes).forEach((key) => {
    const nmsc = countryLanguageCodes[key].nmsc;
    if (!nmscGroups[nmsc]) {
      nmscGroups[nmsc] = [];
    }
    nmscGroups[nmsc].push(key);
  });
  
  return nmscGroups;
};