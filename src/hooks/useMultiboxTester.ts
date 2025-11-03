import { useState, useEffect } from 'react';
import { SelectedOptions } from '../types';
import { countryLanguageCodes, generateUrl } from '../utils';
import { getDefaultSyncOptions } from '../config/configurationSchema';
import {
  defaultOptions,
  loadSingleViewConfig,
  saveMultiboxFirstFrameConfig,
} from '../utils/configStore';

// Main configuration interface for each frame
export interface FrameConfig {
  id: string;
  selectedOptions: SelectedOptions;
  countryLanguageCode: string;
  generatedUrl: string;
  iframeLoading: boolean;
  syncEnabled?: boolean; // For per-frame sync functionality
  syncOptions?: Record<string, boolean>; // For granular sync control of specific settings
  customSized?: boolean; // For manual frame resizing
  position?: { x: number; y: number };
}

export const useMultiboxTester = () => {
  // Core state management
  const [frames, setFrames] = useState<FrameConfig[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [globalSyncEnabled, setGlobalSyncEnabled] = useState<boolean>(false);

  // Initialize default frames on first load
  useEffect(() => {
    if (frames.length === 0) {
      addInitialFrames();
    }
  }, []);

  // Save first frame configuration when it changes
  useEffect(() => {
    if (frames.length > 0) {
      const firstFrame = frames[0];
      saveMultiboxFirstFrameConfig({
        selectedOptions: firstFrame.selectedOptions,
        countryLanguageCode: firstFrame.countryLanguageCode,
      });
    }
  }, [frames]);

  // Creates initial frames for comparison
  const addInitialFrames = () => {
    // Try to load configuration from Single View
    const savedConfig = loadSingleViewConfig();

    // Create first frame using saved config if available, otherwise use defaults
    const frame1 = savedConfig
      ? createFrameConfigWithSavedConfig(
          0,
          savedConfig.selectedOptions,
          savedConfig.countryLanguageCode
        )
      : createFrameConfig(0);

    // Second frame always uses defaults but with offset position
    const frame2 = createFrameConfig(1);

    const initialFrames: FrameConfig[] = [frame1, frame2];
    setFrames(initialFrames);
  };

  // Factory function for creating frame configurations with saved config
  const createFrameConfigWithSavedConfig = (
    index: number,
    savedOptions: SelectedOptions,
    countryCode: string
  ): FrameConfig => {
    const id = `frame-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const initialUrl = generateUrl(savedOptions, countryCode);
    const offset = 60; // Separation between frames

    return {
      id,
      selectedOptions: { ...savedOptions },
      countryLanguageCode: countryCode,
      generatedUrl: initialUrl,
      iframeLoading: true,
      customSized: false,
      syncEnabled: false,
      syncOptions: getDefaultSyncOptions(),
      position: {
        x: 100 + offset * index,
        y: 100 + offset * index,
      },
    };
  };

  // Factory function for creating frame configurations
  const createFrameConfig = (index: number): FrameConfig => {
    const id = `frame-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const defaultCountryCode = Object.keys(countryLanguageCodes)[0];
    const initialUrl = generateUrl(defaultOptions, defaultCountryCode);
    const offset = 60; // Separation between frames

    return {
      id,
      selectedOptions: { ...defaultOptions },
      countryLanguageCode: defaultCountryCode,
      generatedUrl: initialUrl,
      iframeLoading: true,
      customSized: false,
      syncEnabled: false,
      syncOptions: getDefaultSyncOptions(),
      position: {
        x: 100 + offset * index,
        y: 100 + offset * index,
      },
    };
  };

  // Auto-hide notifications after timeout
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

  // Frame management functions
  const addNewFrame = () => {
    const newFrame = createFrameConfig(frames.length);
    setFrames((current) => [...current, newFrame]);
  };

  const updateFramePosition = (
    frameId: string,
    position: { x: number; y: number }
  ) => {
    setFrames((current) =>
      current.map((frame) =>
        frame.id === frameId ? { ...frame, position, customSized: true } : frame
      )
    );
  };

  const reorderFrames = (sourceId: string, targetId: string) => {
    setFrames((currentFrames) => {
      const updatedFrames = [...currentFrames];

      const sourceIndex = updatedFrames.findIndex(
        (frame) => frame.id === sourceId
      );
      const targetIndex = updatedFrames.findIndex(
        (frame) => frame.id === targetId
      );

      if (sourceIndex === -1 || targetIndex === -1) return currentFrames;

      const [sourceFrame] = updatedFrames.splice(sourceIndex, 1);
      updatedFrames.splice(targetIndex, 0, sourceFrame);

      return updatedFrames;
    });
  };

  const removeFrame = (id: string) => {
    if (frames.length <= 1) {
      showNotification('Cannot remove the last frame');
      return;
    }

    setFrames((current) => current.filter((frame) => frame.id !== id));
  };

  // Core configuration handling with sync functionality
  const handleOptionChange = (frameId: string, name: string, value: string) => {
    setFrames((current) => {
      const updatedFrames = [...current];
      const sourceFrameIndex = updatedFrames.findIndex(
        (frame) => frame.id === frameId
      );

      if (sourceFrameIndex === -1) return current;

      // Update source frame configuration
      const sourceFrame = updatedFrames[sourceFrameIndex];
      const newOptions = { ...sourceFrame.selectedOptions, [name]: value };

      // Handle country-specific limitations
      const hasLexus =
        countryLanguageCodes[sourceFrame.countryLanguageCode]?.hasLexus;
      const hasStock =
        countryLanguageCodes[sourceFrame.countryLanguageCode]?.hasStock;
      const hasUsed =
        countryLanguageCodes[sourceFrame.countryLanguageCode]?.hasUsed !==
        false;

      if (name === 'brand' && value === 'lexus' && !hasLexus) {
        showNotification('Lexus is not available for this country');
        newOptions.brand = 'toyota';
      }

      if (name === 'uscContext' && value === 'stock' && !hasStock) {
        showNotification('Stock Cars is not set up for this country');
        newOptions.uscContext = 'used';
      }

      if (name === 'uscContext' && value === 'used' && !hasUsed) {
        showNotification('Used Cars is not available for this country');
        newOptions.uscContext = 'stock';
      }

      // Update source frame with new configuration
      const generatedUrl = generateUrl(
        newOptions,
        sourceFrame.countryLanguageCode
      );

      updatedFrames[sourceFrameIndex] = {
        ...sourceFrame,
        selectedOptions: newOptions,
        generatedUrl,
        iframeLoading: true,
      };

      // Sync changes to other frames if enabled
      const shouldSync = globalSyncEnabled || sourceFrame.syncEnabled;
      if (shouldSync) {
        // Check if this specific option should be synced
        const shouldSyncThisOption = sourceFrame.syncOptions?.[name] !== false;

        if (shouldSyncThisOption) {
          showNotification(`Syncing ${name} to other frames`);

          updatedFrames.forEach((frame, index) => {
            if (index !== sourceFrameIndex) {
              // Handle country-specific compatibility for target frames
              const frameHasLexus =
                countryLanguageCodes[frame.countryLanguageCode]?.hasLexus;
              const frameHasStock =
                countryLanguageCodes[frame.countryLanguageCode]?.hasStock;
              const frameHasUsed =
                countryLanguageCodes[frame.countryLanguageCode]?.hasUsed !==
                false;
              const updatedOptions = { ...frame.selectedOptions };

              if (name === 'brand' && value === 'lexus') {
                updatedOptions.brand = frameHasLexus ? value : 'toyota';
              } else if (name === 'uscContext' && value === 'stock') {
                updatedOptions.uscContext = frameHasStock
                  ? value
                  : frameHasUsed
                  ? 'used'
                  : 'stock';
              } else if (name === 'uscContext' && value === 'used') {
                updatedOptions.uscContext = frameHasUsed
                  ? value
                  : frameHasStock
                  ? 'stock'
                  : 'used';
              } else {
                updatedOptions[name] = value;
              }

              // Update target frame
              const frameGeneratedUrl = generateUrl(
                updatedOptions,
                frame.countryLanguageCode
              );
              updatedFrames[index] = {
                ...frame,
                selectedOptions: updatedOptions,
                generatedUrl: frameGeneratedUrl,
                iframeLoading: true,
              };
            }
          });
        } else {
          showNotification(`Sync for "${name}" is disabled in settings`);
        }
      }

      return updatedFrames;
    });
  };

  // Country change handler with sync functionality
  const changeCountry = (frameId: string, code: string) => {
    setFrames((current) => {
      const updatedFrames = [...current];
      const sourceFrameIndex = updatedFrames.findIndex(
        (frame) => frame.id === frameId
      );

      if (sourceFrameIndex === -1) return current;

      // Update source frame country
      const sourceFrame = updatedFrames[sourceFrameIndex];
      const generatedUrl = generateUrl(sourceFrame.selectedOptions, code);

      updatedFrames[sourceFrameIndex] = {
        ...sourceFrame,
        countryLanguageCode: code,
        generatedUrl,
        iframeLoading: true,
      };

      // Sync country to other frames if enabled
      const shouldSync = globalSyncEnabled || sourceFrame.syncEnabled;
      if (shouldSync) {
        // Check if country should be synced
        const shouldSyncCountry = sourceFrame.syncOptions?.country !== false;

        if (shouldSyncCountry) {
          showNotification('Syncing country to other frames');

          updatedFrames.forEach((frame, index) => {
            if (index !== sourceFrameIndex) {
              const frameGeneratedUrl = generateUrl(
                frame.selectedOptions,
                code
              );

              updatedFrames[index] = {
                ...frame,
                countryLanguageCode: code,
                generatedUrl: frameGeneratedUrl,
                iframeLoading: true,
              };
            }
          });
        } else {
          showNotification('Country sync is disabled in settings');
        }
      }

      return updatedFrames;
    });
  };

  // Utility functions
  const copyUrlToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showNotification('URL copied to clipboard');
    } catch (err) {
      showNotification(`Failed to copy URL. ${(err as Error).message}`);
    }
  };

  const handleIframeLoad = (frameId: string) => {
    setFrames((current) =>
      current.map((frame) =>
        frame.id === frameId ? { ...frame, iframeLoading: false } : frame
      )
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showNotification = (message: string) => {
    setNotification(message);
  };

  // Frame sizing functions
  const markFrameAsCustomSized = (frameId: string) => {
    setFrames((current) =>
      current.map((frame) =>
        frame.id === frameId ? { ...frame, customSized: true } : frame
      )
    );
  };

  const resetFrameCustomSize = (frameId: string) => {
    setFrames((current) =>
      current.map((frame) =>
        frame.id === frameId ? { ...frame, customSized: false } : frame
      )
    );
  };

  // Sync configuration toggles
  const toggleFrameSync = (frameId: string) => {
    const frame = frames.find((f) => f.id === frameId);
    if (!frame) return;

    const newSyncState = !frame.syncEnabled;

    setFrames((current) =>
      current.map((f) =>
        f.id === frameId ? { ...f, syncEnabled: newSyncState } : f
      )
    );

    const countryName =
      countryLanguageCodes[frame.countryLanguageCode]?.pretty || 'Frame';
    showNotification(
      newSyncState
        ? `Frame sync enabled for ${countryName}`
        : `Frame sync disabled for ${countryName}`
    );
  };

  const toggleGlobalSync = () => {
    const newGlobalSyncState = !globalSyncEnabled;
    setGlobalSyncEnabled(newGlobalSyncState);
    showNotification(
      newGlobalSyncState ? 'Global sync enabled' : 'Global sync disabled'
    );
  };

  // Update sync options for a specific frame
  const updateFrameSyncOptions = (
    frameId: string,
    optionName: string,
    enabled: boolean
  ) => {
    setFrames((current) =>
      current.map((frame) =>
        frame.id === frameId
          ? {
              ...frame,
              syncOptions: {
                ...(frame.syncOptions || {}),
                [optionName]: enabled,
              },
            }
          : frame
      )
    );

    showNotification(
      `${enabled ? 'Enabled' : 'Disabled'} syncing ${optionName}`
    );
  };

  // Refreshes the current frame
  const refreshFrame = (frameId: string) => {
    const frame = frames.find((f) => f.id === frameId);
    if (frame) {
      // We add a timestamp to the URL to force reload
      // This is needed as the iframe might cache the URL, which would prevent it from reloading
      const timestamp = Date.now();
      const separator = frame.generatedUrl.includes('?') ? '&' : '?';
      const refreshedUrl = `${frame.generatedUrl}${separator}_t=${timestamp}`;

      setFrames((current) =>
        current.map((f) =>
          f.id === frameId
            ? { ...f, generatedUrl: refreshedUrl, iframeLoading: true }
            : f
        )
      );

      showNotification('Reloading frame...');
    }
  };

  // Expose interface for the hook
  return {
    frames,
    notification,
    sidebarOpen,
    globalSyncEnabled,
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
    toggleFrameSync,
    toggleGlobalSync,
    updateFrameSyncOptions,
    refreshFrame,
  };
};
