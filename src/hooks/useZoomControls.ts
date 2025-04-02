import { useState, useCallback, useMemo } from 'react';

export interface UseZoomControlsReturn {
  zoomLevel: number;
  showZoomControls: boolean;
  handleZoomChange: (event: Event, newValue: number | number[]) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleZoomControls: () => void;
}

export const useZoomControls = (): UseZoomControlsReturn => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showZoomControls, setShowZoomControls] = useState<boolean>(false);

  // Memoize zoom handlers to prevent unnecessary rerenders
  const handleZoomChange = useCallback((_event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  }, []);

  const toggleZoomControls = useCallback(() => {
    setShowZoomControls(prev => !prev);
  }, []);

  return {
    zoomLevel,
    showZoomControls,
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    toggleZoomControls,
  };
};