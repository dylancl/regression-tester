import { useState, useEffect, useCallback } from 'react';
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
import { deviceSizes } from '../utils/deviceSizes';

// Frame dimensions interface
interface FrameDimensions {
  width: number;
  height: number;
  isResponsiveMode: boolean;
  deviceName?: string;
}

export const useRegressionTester = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(defaultOptions);
  const [currentCountryIndex, setCurrentCountryIndex] = useState<number>(0);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  
  // New states for responsive mode
  const [frameDimensions, setFrameDimensions] = useState<FrameDimensions>({
    width: window.innerWidth - 400, // Default width (accounting for sidebar)
    height: window.innerHeight - 100, // Default height
    isResponsiveMode: false,
  });
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);

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

  // Toggle responsive mode
  const toggleResponsiveMode = useCallback(() => {
    setFrameDimensions(prev => {
      // Default to iPhone 12/13/14 size when enabling responsive mode
      if (!prev.isResponsiveMode) {
        const mobileDevice = deviceSizes.find(d => d.name === 'iPhone 12/13/14');
        if (mobileDevice) {
          return {
            width: mobileDevice.width,
            height: mobileDevice.height,
            isResponsiveMode: true,
            deviceName: mobileDevice.name
          };
        }
        // Fallback if device not found
        return {
          width: 390,
          height: 844,
          isResponsiveMode: true,
          deviceName: 'Mobile'
        };
      }
      // When disabling responsive mode, go back to full size
      return {
        width: window.innerWidth - (sidebarOpen ? 400 : 50),
        height: window.innerHeight - 100,
        isResponsiveMode: false
      };
    });
    
    showNotification(frameDimensions.isResponsiveMode 
      ? 'Exited responsive mode' 
      : 'Entered responsive mode');
  }, [frameDimensions.isResponsiveMode, sidebarOpen]);

  // Handle resizing
  const handleResize = useCallback((e: React.MouseEvent<Element>, direction: string) => {
    e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = frameDimensions.width;
    const startHeight = frameDimensions.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Calculate new dimensions based on resize direction
      if (direction.includes('e')) {
        newWidth = Math.max(320, startWidth + (moveEvent.clientX - startX));
      }
      if (direction.includes('w')) {
        newWidth = Math.max(320, startWidth - (moveEvent.clientX - startX));
      }
      if (direction.includes('s')) {
        newHeight = Math.max(568, startHeight + (moveEvent.clientY - startY));
      }
      if (direction.includes('n')) {
        newHeight = Math.max(568, startHeight - (moveEvent.clientY - startY));
      }

      // Find if dimensions match a known device
      const matchingDevice = deviceSizes.find(
        device => Math.abs(device.width - newWidth) <= 5 && Math.abs(device.height - newHeight) <= 5
      );

      setFrameDimensions({
        width: newWidth,
        height: newHeight,
        isResponsiveMode: true,
        deviceName: matchingDevice?.name
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [frameDimensions.width, frameDimensions.height]);

  // Change to specific device size
  const changeDeviceSize = useCallback((width: number, height: number) => {
    const device = deviceSizes.find(
      d => d.width === width && d.height === height
    );

    setFrameDimensions({
      width,
      height,
      isResponsiveMode: true,
      deviceName: device?.name
    });

    showNotification(`Changed to ${device?.name || `${width}×${height}`}`);
  }, []);

  // Rotate dimensions
  const rotateDimensions = useCallback(() => {
    setFrameDimensions(prev => ({
      width: prev.height,
      height: prev.width,
      isResponsiveMode: prev.isResponsiveMode,
      deviceName: prev.deviceName ? `${prev.deviceName} (Rotated)` : undefined
    }));
    
    showNotification('Rotated dimensions');
  }, []);

  return {
    selectedOptions,
    countryLanguageCode,
    currentCountryIndex,
    generatedUrl,
    notification,
    iframeLoading,
    sidebarOpen,
    frameDimensions,
    isResizing,
    handleOptionChange,
    goToNextCountry,
    goToPreviousCountry,
    changeCountry,
    copyUrlToClipboard,
    handleIframeLoad,
    toggleSidebar,
    toggleResponsiveMode,
    handleResize,
    changeDeviceSize,
    rotateDimensions,
  };
};