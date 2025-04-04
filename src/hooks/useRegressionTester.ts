import { useState, useEffect } from 'react';
import { SelectedOptions } from '../types';
import {
  countryLanguageCodes,
  generateUrl,
  parseUrlParams,
  createUrlWithParams
} from '../utils';
import {
  saveSingleViewConfig,
  loadSingleViewConfig,
  loadMultiboxFirstFrameConfig,
  defaultOptions
} from '../utils/configStore';

export const useRegressionTester = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(defaultOptions);
  const [currentCountryIndex, setCurrentCountryIndex] = useState<number>(0);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  // Get current country code
  const countryLanguageCode = Object.keys(countryLanguageCodes)[currentCountryIndex];

  // Validate options against the current country's availability
  const validateOptionsForCountry = (options: SelectedOptions, countryCode: string): SelectedOptions => {
    const newOptions = { ...options };
    const hasLexus = countryLanguageCodes[countryCode]?.hasLexus;
    const hasStock = countryLanguageCodes[countryCode]?.hasStock;
    const hasUsed = countryLanguageCodes[countryCode]?.hasUsed !== false;
    
    if (newOptions.brand === 'lexus' && !hasLexus) {
      showNotification(`Lexus is not available for ${countryLanguageCodes[countryCode]?.pretty}, switching to Toyota`);
      newOptions.brand = 'toyota';
    }
    
    // Validate USC context selection
    if (newOptions.uscContext === 'stock' && !hasStock) {
      if (hasUsed) {
        showNotification(`Stock Cars is not available for ${countryLanguageCodes[countryCode]?.pretty}, switching to Used Cars`);
        newOptions.uscContext = 'used';
      } else {
        showNotification(`Stock Cars is not available for ${countryLanguageCodes[countryCode]?.pretty}`);
      }
    } else if (newOptions.uscContext === 'used' && !hasUsed) {
      if (hasStock) {
        showNotification(`Used Cars is not available for ${countryLanguageCodes[countryCode]?.pretty}, switching to Stock Cars`);
        newOptions.uscContext = 'stock';
      } else {
        showNotification(`Used Cars is not available for ${countryLanguageCodes[countryCode]?.pretty}`);
      }
    }
    
    return newOptions;
  };

  // Initialize configuration from either URL params, saved state, or defaults
  useEffect(() => {
    const urlParams = parseUrlParams();

    if (Object.keys(urlParams).length > 0) {
      // URL parameters take precedence
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
      // No URL params, try to load from stored configuration
      // First try to get the Multibox configuration, as that's the most recent when navigating back from Multibox
      const multiboxConfig = loadMultiboxFirstFrameConfig();
      
      if (multiboxConfig) {
        // Find the country index
        const countryIndex = Object.keys(countryLanguageCodes).findIndex(
          key => key === multiboxConfig.countryLanguageCode
        );
        
        if (countryIndex !== -1) {
          setCurrentCountryIndex(countryIndex);
        }
        
        setSelectedOptions(multiboxConfig.selectedOptions);
        const url = generateUrl(multiboxConfig.selectedOptions, multiboxConfig.countryLanguageCode);
        setGeneratedUrl(url);
        setIframeLoading(true);
      } else {
        // If no multibox config, try to load from Single View storage
        const savedConfig = loadSingleViewConfig();
        
        if (savedConfig) {
          // Using saved Single View configuration
          const countryIndex = Object.keys(countryLanguageCodes).findIndex(
            key => key === savedConfig.countryLanguageCode
          );
          
          if (countryIndex !== -1) {
            setCurrentCountryIndex(countryIndex);
          }
          
          setSelectedOptions(savedConfig.selectedOptions);
          const url = generateUrl(savedConfig.selectedOptions, savedConfig.countryLanguageCode);
          setGeneratedUrl(url);
          setIframeLoading(true);
        } else {
          // Fallback to defaults if no saved config
          const defaultCountryCode = Object.keys(countryLanguageCodes)[0];
          const defaultUrl = generateUrl(defaultOptions, defaultCountryCode);
          setGeneratedUrl(defaultUrl);
        }
      }
    }
    
    setInitialLoadComplete(true);
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

  // Update the URL when options or country changes, but only after initial load
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    updateUrl();
    
    // Save current configuration
    saveSingleViewConfig({
      selectedOptions,
      countryLanguageCode
    });
  }, [selectedOptions, countryLanguageCode, initialLoadComplete]);

  // Handle option changes
  const handleOptionChange = (name: string, value: string) => {
    // Make a copy of the current options
    const newOptions = { ...selectedOptions, [name]: value };
    
    // Use the validation function to handle available options
    setIframeLoading(true);
    const validatedOptions = validateOptionsForCountry(newOptions, countryLanguageCode);
    setSelectedOptions(validatedOptions);
    updateBrowserUrl(validatedOptions);
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
    const newIndex = currentCountryIndex + 1;
    const newCountryCode = Object.keys(countryLanguageCodes)[newIndex];
    
    // Validate options for the new country
    const validatedOptions = validateOptionsForCountry(selectedOptions, newCountryCode);
    setSelectedOptions(validatedOptions);
    setCurrentCountryIndex(newIndex);
    
    // Update browser URL with the new country
    const newNmsc = countryLanguageCodes[newCountryCode]?.nmsc;
    updateBrowserUrl(validatedOptions, newCountryCode, newNmsc);
  };

  // Navigate to previous country
  const goToPreviousCountry = () => {
    if (currentCountryIndex <= 0) {
      showNotification("First country - can't go back.");
      return;
    }

    setIframeLoading(true);
    const newIndex = currentCountryIndex - 1;
    const newCountryCode = Object.keys(countryLanguageCodes)[newIndex];
    
    // Validate options for the new country
    const validatedOptions = validateOptionsForCountry(selectedOptions, newCountryCode);
    setSelectedOptions(validatedOptions);
    setCurrentCountryIndex(newIndex);
    
    // Update browser URL with the new country
    const newNmsc = countryLanguageCodes[newCountryCode]?.nmsc;
    updateBrowserUrl(validatedOptions, newCountryCode, newNmsc);
  };

  // Change to specific country
  const changeCountry = (code: string) => {
    const index = Object.keys(countryLanguageCodes).findIndex(key => key === code);
    if (index !== -1) {
      setIframeLoading(true);
      
      // Validate options for the new country
      const validatedOptions = validateOptionsForCountry(selectedOptions, code);
      setSelectedOptions(validatedOptions);
      setCurrentCountryIndex(index);
      
      // Update browser URL with the new country
      const nmsc = countryLanguageCodes[code]?.nmsc;
      updateBrowserUrl(validatedOptions, code, nmsc);
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