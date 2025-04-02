import { useState, useEffect } from 'react';
import { SelectedOptions } from '../types';
import {
  countryLanguageCodes,
  generateUrl,
  parseUrlParams,
  createUrlWithParams
} from '../utils';

// Default options
const defaultOptions: SelectedOptions = {
  environment: 'prev',
  component: 'car-filter',
  uscContext: 'used',
  uscEnv: 'uat',
  brand: 'toyota',
  variantBrand: 'toyota',
};

export const useRegressionTester = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(defaultOptions);
  const [currentCountryIndex, setCurrentCountryIndex] = useState<number>(0);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Get current country code
  const countryLanguageCode = Object.keys(countryLanguageCodes)[currentCountryIndex];

  // Initialize from URL params and generate initial URL
  useEffect(() => {
    const urlParams = parseUrlParams();

    if (Object.keys(urlParams).length > 0) {
      const { country, nmsc, ...optionParams } = urlParams;

      // If country param is present, determine the correct country index
      let initialCountryIndex = 0;
      if (country) {
        const countryIndex = Object.keys(countryLanguageCodes).findIndex(
          key => key === country
        );
        if (countryIndex !== -1) {
          initialCountryIndex = countryIndex;
        }
      }

      // Set states with the correct values
      setCurrentCountryIndex(initialCountryIndex);
      setSelectedOptions({ ...defaultOptions, ...optionParams });

      // Generate the URL directly with the correct country code, don't rely on state updates yet
      const initialCountryCode = Object.keys(countryLanguageCodes)[initialCountryIndex];
      const initialUrl = generateUrl({ ...defaultOptions, ...optionParams }, initialCountryCode);

      // Set the iframe URL and mark as loading
      setGeneratedUrl(initialUrl);
      setIframeLoading(true);
    } else {
      // No params, use defaults and generate URL
      const defaultCountryCode = Object.keys(countryLanguageCodes)[0];
      const defaultUrl = generateUrl(defaultOptions, defaultCountryCode);
      setGeneratedUrl(defaultUrl);
    }
  }, []);

  // Show notification for 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [notification]);

  // Update the URL when options or country changes
  useEffect(() => {
    updateUrl();
  }, [selectedOptions, currentCountryIndex]);

  // Handle option changes
  const handleOptionChange = (name: string, value: string) => {
    // Make a copy of the current options
    const newOptions = { ...selectedOptions, [name]: value };

    const hasLexus = countryLanguageCodes[countryLanguageCode]?.hasLexus;
    const hasStock = countryLanguageCodes[countryLanguageCode]?.hasStock;

    if (name === 'brand' && value === 'lexus' && !hasLexus) {
      showNotification('Lexus is not available for this country');
      newOptions.brand = 'toyota';
    }

    if (name === 'uscContext' && value === 'stock' && !hasStock) {
      showNotification('Stock Cars is not set up for this country');
      newOptions.uscContext = 'used';
    }

    setIframeLoading(true);    
    setSelectedOptions(newOptions);
    updateBrowserUrl(newOptions);
  };

  // Generate URL based on current options and country
  const updateUrl = () => {
    const url = generateUrl(selectedOptions, countryLanguageCode);
    setGeneratedUrl(url);
  };

  // Update browser URL with current options
  const updateBrowserUrl = (options: SelectedOptions, countryCode?: string, nmsc?: string) => {
    const codeToUse = countryCode || countryLanguageCode;
    const nmscToUse = nmsc || countryLanguageCodes[countryLanguageCode]?.nmsc;

    const newUrl = createUrlWithParams(options, codeToUse, nmscToUse);
    window.history.pushState({}, '', newUrl);
  };

  // Navigate to next country
  const goToNextCountry = () => {
    if (currentCountryIndex >= Object.keys(countryLanguageCodes).length - 1) {
      showNotification("No more countries available - can't go forward.");
      return;
    }

    setIframeLoading(true);
    setCurrentCountryIndex(currentCountryIndex + 1);
    // Update browser URL with current country after changing index
    const newIndex = currentCountryIndex + 1;
    const newCountryCode = Object.keys(countryLanguageCodes)[newIndex];
    const newNmsc = countryLanguageCodes[newCountryCode]?.nmsc;
    updateBrowserUrl(selectedOptions, newCountryCode, newNmsc);
  };

  // Navigate to previous country
  const goToPreviousCountry = () => {
    if (currentCountryIndex <= 0) {
      showNotification("First country - can't go back.");
      return;
    }

    setIframeLoading(true);
    setCurrentCountryIndex(currentCountryIndex - 1);
    // Update browser URL with current country after changing index
    const newIndex = currentCountryIndex - 1;
    const newCountryCode = Object.keys(countryLanguageCodes)[newIndex];
    const newNmsc = countryLanguageCodes[newCountryCode]?.nmsc;
    updateBrowserUrl(selectedOptions, newCountryCode, newNmsc);
  };

  // Change to specific country
  const changeCountry = (code: string) => {
    const index = Object.keys(countryLanguageCodes).findIndex(key => key === code);
    if (index !== -1) {
      setIframeLoading(true);
      setCurrentCountryIndex(index);
      // Update browser URL with the new country
      const nmsc = countryLanguageCodes[code]?.nmsc;
      updateBrowserUrl(selectedOptions, code, nmsc);
    }
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      showNotification('URL copied to clipboard');
    } catch (err) {
      showNotification('Failed to copy URL');
    }
  };

  // Handle iframe load completion
  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return {
    selectedOptions,
    countryLanguageCode,
    currentCountryIndex,
    generatedUrl,
    notification,
    iframeLoading,
    sidebarOpen,
    handleOptionChange,
    goToNextCountry,
    goToPreviousCountry,
    changeCountry,
    copyUrlToClipboard,
    handleIframeLoad,
    toggleSidebar,
  };
};