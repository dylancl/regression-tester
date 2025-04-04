import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseZoomControlsProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  controlsHideDelay?: number; // ms to keep controls visible after zooming
}

export interface UseZoomControlsReturn {
  zoomLevel: number;
  showZoomControls: boolean;
  handleZoomChange: (event: Event, newValue: number | number[]) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleZoomControls: () => void;
  setShowZoomControls: (show: boolean) => void;
}

export const useZoomControls = (props?: UseZoomControlsProps): UseZoomControlsReturn => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showZoomControls, setShowZoomControls] = useState<boolean>(false);
  const { containerRef, controlsHideDelay = 2000 } = props || {};
  
  // Use ref for timeout to keep controls visible
  const hideControlsTimeoutRef = useRef<number | null>(null);
  
  // Clear timeout helper
  const clearHideControlsTimeout = () => {
    if (hideControlsTimeoutRef.current !== null) {
      window.clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  // Schedule hiding the controls after delay
  const scheduleHideControls = useCallback(() => {
    clearHideControlsTimeout();
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setShowZoomControls(false);
    }, controlsHideDelay);
  }, [controlsHideDelay]);

  // Memoize zoom handlers to prevent unnecessary rerenders
  const handleZoomChange = useCallback((_event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
    setShowZoomControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
    setShowZoomControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  const toggleZoomControls = useCallback(() => {
    setShowZoomControls(prev => {
      if (!prev) {
        // If we're showing the controls, cancel any pending hide
        clearHideControlsTimeout();
      }
      return !prev;
    });
  }, []);

  // Add Ctrl+Scroll zoom functionality
  useEffect(() => {
    const targetElement = containerRef?.current || window;
    
    const handleWheel = (e: Event) => {
      // addEventListener requires a generic Event type, we know it's a WheelEvent here
      const wheelEvent = e as WheelEvent;
      // Only handle zoom when Ctrl key is pressed
      if (wheelEvent.ctrlKey || wheelEvent.metaKey) { // Support both Ctrl and Cmd (for Mac)
        wheelEvent.preventDefault();
        
        // Show zoom controls
        setShowZoomControls(true);
        
        // Determine zoom direction and change immediately
        if (wheelEvent.deltaY < 0) {
          // Zoom in
          setZoomLevel(prev => Math.min(prev + 5, 200));
        } else {
          // Zoom out
          setZoomLevel(prev => Math.max(prev - 5, 50));
        }
        
        // Reset the hide timeout
        scheduleHideControls();
      }
    };
    
    // Add event listener with passive: false to allow preventDefault
    targetElement.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      targetElement.removeEventListener('wheel', handleWheel);
      clearHideControlsTimeout();
    };
  }, [containerRef, scheduleHideControls]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearHideControlsTimeout();
    };
  }, []);

  return {
    zoomLevel,
    showZoomControls,
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    toggleZoomControls,
    setShowZoomControls,
  };
};