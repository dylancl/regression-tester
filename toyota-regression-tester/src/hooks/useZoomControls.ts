import { useState } from 'react';

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

  // Handle zoom change from slider
  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  // Toggle zoom controls visibility
  const toggleZoomControls = () => {
    setShowZoomControls(prev => !prev);
  };

  return {
    zoomLevel,
    showZoomControls,
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    toggleZoomControls,
  };
};