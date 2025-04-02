import { useState, useEffect } from 'react';
import { SelectedOptions } from '../types';
import { countryLanguageCodes, generateUrl } from '../utils';

// Default options for new frames
const defaultOptions: SelectedOptions = {
  environment: 'prev',
  component: 'car-filter',
  uscContext: 'used',
  uscEnv: 'uat',
  brand: 'toyota',
  variantBrand: 'toyota',
};

// Interface for frame configuration
export interface FrameConfig {
  id: string;
  selectedOptions: SelectedOptions;
  countryLanguageCode: string;
  generatedUrl: string;
  iframeLoading: boolean;
  customSized?: boolean; // Track if the frame has been manually resized
  position?: { x: number, y: number }; // Track frame position
}

export const useMultiboxTester = () => {
  // Array of frame configurations
  const [frames, setFrames] = useState<FrameConfig[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Initialize with default frames
  useEffect(() => {
    if (frames.length === 0) {
      // Start with two frames for comparison by default - with proper positioning
      addInitialFrames();
    }
  }, []);

  // Initialize frames with proper spacing
  const addInitialFrames = () => {
    const initialFrames: FrameConfig[] = [
      createFrameConfig(0),
      createFrameConfig(1)
    ];
    setFrames(initialFrames);
  };

  // Create a new frame config with proper positioning
  const createFrameConfig = (index: number): FrameConfig => {
    // Generate a unique ID for the frame
    const id = `frame-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Get default country code
    const defaultCountryCode = Object.keys(countryLanguageCodes)[0];
    
    // Generate initial URL
    const initialUrl = generateUrl(defaultOptions, defaultCountryCode);
    
    // Calculate position with significant offset to avoid overlapping
    const offset = 60; // Clear separation between frames
    
    return {
      id,
      selectedOptions: { ...defaultOptions },
      countryLanguageCode: defaultCountryCode,
      generatedUrl: initialUrl,
      iframeLoading: true,
      customSized: false,
      position: { 
        x: 100 + (offset * index), 
        y: 100 + (offset * index) 
      }
    };
  };

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

  // Add a new frame with default options
  const addNewFrame = () => {
    const newFrame = createFrameConfig(frames.length);
    
    // Add to frames array
    setFrames(current => [...current, newFrame]);
  };

  // Update frame position (called from MultiboxTester)
  const updateFramePosition = (frameId: string, position: { x: number, y: number }) => {
    setFrames(current => 
      current.map(frame => 
        frame.id === frameId 
          ? { ...frame, position, customSized: true } 
          : frame
      )
    );
  };

  // Reorder frames when dragged and dropped
  const reorderFrames = (sourceId: string, targetId: string) => {
    setFrames(currentFrames => {
      // Create a copy of the current frames
      const updatedFrames = [...currentFrames];
      
      // Find the indices of the source and target frames
      const sourceIndex = updatedFrames.findIndex(frame => frame.id === sourceId);
      const targetIndex = updatedFrames.findIndex(frame => frame.id === targetId);
      
      if (sourceIndex === -1 || targetIndex === -1) return currentFrames;
      
      // Remove the source frame
      const [sourceFrame] = updatedFrames.splice(sourceIndex, 1);
      
      // Insert the source frame at the target position
      updatedFrames.splice(targetIndex, 0, sourceFrame);
      
      return updatedFrames;
    });
  };

  // Remove a frame by ID
  const removeFrame = (id: string) => {
    if (frames.length <= 1) {
      showNotification("Cannot remove the last frame");
      return;
    }
    
    setFrames(current => current.filter(frame => frame.id !== id));
  };

  // Handle option changes for a specific frame
  const handleOptionChange = (frameId: string, name: string, value: string) => {
    setFrames(current => 
      current.map(frame => {
        if (frame.id !== frameId) return frame;
        
        // Make a copy of the current options
        const newOptions = { ...frame.selectedOptions, [name]: value };
        
        // Handle incompatible options
        const hasLexus = countryLanguageCodes[frame.countryLanguageCode]?.hasLexus;
        const hasStock = countryLanguageCodes[frame.countryLanguageCode]?.hasStock;
        
        // Reset brand if Lexus is not available for this country
        if (name === 'brand' && value === 'lexus' && !hasLexus) {
          showNotification('Lexus is not available for this country');
          newOptions.brand = 'toyota';
        }
        
        // Reset uscContext if Stock is not available for this country
        if (name === 'uscContext' && value === 'stock' && !hasStock) {
          showNotification('Stock Cars is not set up for this country');
          newOptions.uscContext = 'used';
        }
        
        // Generate new URL based on the updated options
        const generatedUrl = generateUrl(newOptions, frame.countryLanguageCode);
        
        return {
          ...frame,
          selectedOptions: newOptions,
          generatedUrl,
          iframeLoading: true
        };
      })
    );
  };

  // Change country for a specific frame
  const changeCountry = (frameId: string, code: string) => {
    setFrames(current => 
      current.map(frame => {
        if (frame.id !== frameId) return frame;
        
        // Generate new URL with the changed country
        const generatedUrl = generateUrl(frame.selectedOptions, code);
        
        return {
          ...frame,
          countryLanguageCode: code,
          generatedUrl,
          iframeLoading: true
        };
      })
    );
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showNotification('URL copied to clipboard');
    } catch (err) {
      showNotification('Failed to copy URL');
    }
  };

  // Handle iframe load completion
  const handleIframeLoad = (frameId: string) => {
    setFrames(current => 
      current.map(frame => 
        frame.id === frameId 
          ? { ...frame, iframeLoading: false } 
          : frame
      )
    );
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
  };

  // Mark a frame as custom sized
  const markFrameAsCustomSized = (frameId: string) => {
    setFrames(current => 
      current.map(frame => 
        frame.id === frameId 
          ? { ...frame, customSized: true } 
          : frame
      )
    );
  };

  // Reset frame custom size flag
  const resetFrameCustomSize = (frameId: string) => {
    setFrames(current => 
      current.map(frame => 
        frame.id === frameId 
          ? { ...frame, customSized: false } 
          : frame
      )
    );
  };

  return {
    frames,
    notification,
    sidebarOpen,
    addNewFrame,
    removeFrame,
    handleOptionChange,
    changeCountry,
    copyUrlToClipboard,
    handleIframeLoad,
    toggleSidebar,
    showNotification,
    reorderFrames,
    markFrameAsCustomSized,
    resetFrameCustomSize,
    updateFramePosition,
  };
};