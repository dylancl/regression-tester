import { useState, useRef, useEffect, RefObject } from 'react';
import { FrameConfig } from './useMultiboxTester';

export interface FrameLayout {
  height: number;
  width: number;
  maxHeight: boolean;
  position?: { x: number; y: number };
}

export interface UseFrameLayoutProps {
  frames: FrameConfig[];
  onUpdateFramePosition: (frameId: string, position: { x: number; y: number }) => void;
  onMarkFrameAsCustomSized: (frameId: string) => void;
}

export interface UseFrameLayoutReturn {
  frameLayouts: Record<string, FrameLayout>;
  resizingFrameId: string | null;
  resizeDirection: string | null;
  draggedFrameId: string | null;
  dragOverFrameId: string | null;
  draggingFrame: boolean;
  activeFrameId: string | null;
  frameRefs: RefObject<Record<string, HTMLDivElement | null>>;
  framesContainerRef: RefObject<HTMLDivElement | null>;
  expandedConfigFrames: Set<string>;
  handleFrameMoveStart: (e: React.MouseEvent, frameId: string) => void;
  handleMultiDirectionResize: (e: React.MouseEvent, frameId: string, direction: string) => void;
  toggleMaximizeHeight: (frameId: string) => void;
  resetFrameSize: (frameId: string, defaultWidth?: number) => void;
  toggleConfigPanel: (frameId: string) => void;
  setActiveFrameId: (frameId: string | null) => void;
  setResizingFrameId: (frameId: string | null) => void;
  setResizeDirection: (direction: string | null) => void;
  setDraggedFrameId: (frameId: string | null) => void;
  setDragOverFrameId: (frameId: string | null) => void;
}

export const useFrameLayout = ({
  frames,
  onUpdateFramePosition,
  onMarkFrameAsCustomSized,
}: UseFrameLayoutProps): UseFrameLayoutReturn => {
  const [frameLayouts, setFrameLayouts] = useState<Record<string, FrameLayout>>({});
  const [resizingFrameId, setResizingFrameId] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);
  const [dragOverFrameId, setDragOverFrameId] = useState<string | null>(null);
  const [draggingFrame, setDraggingFrame] = useState<boolean>(false);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null);
  const [expandedConfigFrames, setExpandedConfigFrames] = useState<Set<string>>(new Set());
  
  // Fix type issue by using proper RefObject type
  const framesContainerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Adjust container size to accommodate all frames
  useEffect(() => {
    if (!framesContainerRef.current) return;
    
    // Find the frame that extends farthest right and bottom
    let maxRight = 0;
    let maxBottom = 0;
    
    frames.forEach(frame => {
      const layout = frameLayouts[frame.id];
      const position = layout?.position || frame.position || { x: 0, y: 0 };
      
      if (layout) {
        const right = position.x + layout.width;
        const bottom = position.y + layout.height;
        
        maxRight = Math.max(maxRight, right);
        maxBottom = Math.max(maxBottom, bottom);
      }
    });
    
    // Set minimum container dimensions
    framesContainerRef.current.style.minWidth = `${maxRight + 100}px`;
    framesContainerRef.current.style.minHeight = `${maxBottom + 100}px`;
  }, [frames, frameLayouts]);

  // Initialize frame layouts when frames change
  useEffect(() => {
    const newLayouts: Record<string, FrameLayout> = {};
    
    frames.forEach(frame => {
      if (!frameLayouts[frame.id]) {
        // New frame - use position from frame.position if available
        newLayouts[frame.id] = {
          height: 400,
          width: 400,
          maxHeight: false,
          position: frame.position // Important: use the position from the hook
        };
      } else {
        // Keep existing layout
        newLayouts[frame.id] = frameLayouts[frame.id];
      }
    });
    
    setFrameLayouts(prevLayouts => ({...prevLayouts, ...newLayouts}));
  }, [frames]);

  // Sync positions from frameLayouts back to the hook - critical fix!
  useEffect(() => {
    if (draggingFrame || resizingFrameId) return; // Don't sync during active interactions
    
    // Sync layout positions back to the frames in the hook
    Object.entries(frameLayouts).forEach(([frameId, layout]) => {
      if (layout.position) {
        const frame = frames.find(f => f.id === frameId);
        if (frame && 
            (frame.position?.x !== layout.position?.x || 
             frame.position?.y !== layout.position?.y)) {
          onUpdateFramePosition(frameId, layout.position);
        }
      }
    });
  }, [frameLayouts, draggingFrame, resizingFrameId, frames, onUpdateFramePosition]);

  // Handle frame movement (dragging)
  const handleFrameMoveStart = (e: React.MouseEvent, frameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow moving via the header's drag handle or direct header area
    if (!(e.target as HTMLElement).closest('.frame-drag-handle')) {
      return;
    }
    
    setDraggingFrame(true);
    setActiveFrameId(frameId);
    
    const frameElement = frameRefs.current[frameId];
    if (!frameElement || !framesContainerRef.current) return;
    
    const frameRect = frameElement.getBoundingClientRect();
    const containerRect = framesContainerRef.current.getBoundingClientRect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = frameRect.left - containerRect.left + framesContainerRef.current.scrollLeft;
    const startTop = frameRect.top - containerRect.top + framesContainerRef.current.scrollTop;
    
    // Ensure we have position in layout
    const frameLayout = frameLayouts[frameId] || { 
      width: frameRect.width, 
      height: frameRect.height, 
      maxHeight: false,
      position: { x: startLeft, y: startTop }
    };
    
    // Get the starting position
    const startPosition = frameLayout.position || { x: startLeft, y: startTop };
    
    // Force position update in local layout state
    setFrameLayouts(prev => ({
      ...prev,
      [frameId]: {
        ...prev[frameId] || frameLayout,
        position: startPosition
      }
    }));
    
    // Set up for grid positioning
    onMarkFrameAsCustomSized(frameId);
    
    // Handle auto-scrolling
    let scrollInterval: number | null = null;
    let isMouseDown = true;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown) return;
      
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Calculate new position
      const newX = Math.max(0, startPosition.x + deltaX);
      const newY = Math.max(0, startPosition.y + deltaY);
      
      // Update local state immediately for visual feedback
      setFrameLayouts(prev => ({
        ...prev,
        [frameId]: {
          ...prev[frameId],
          position: { x: newX, y: newY }
        }
      }));
      
      // Handle auto-scrolling during drag
      const scrollContainer = framesContainerRef.current?.parentElement;
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollThreshold = 50;
        const scrollSpeed = 15;
        
        // Clear any existing scroll interval
        if (scrollInterval) {
          window.clearInterval(scrollInterval);
          scrollInterval = null;
        }
        
        // Check if we need to scroll
        const needsHorizontalScroll = 
          moveEvent.clientX > containerRect.right - scrollThreshold || 
          moveEvent.clientX < containerRect.left + scrollThreshold;
          
        const needsVerticalScroll = 
          moveEvent.clientY > containerRect.bottom - scrollThreshold || 
          moveEvent.clientY < containerRect.top + scrollThreshold;
      
        if (needsHorizontalScroll || needsVerticalScroll) {
          scrollInterval = window.setInterval(() => {
            if (!isMouseDown) {
              if (scrollInterval) {
                window.clearInterval(scrollInterval);
                scrollInterval = null;
              }
              return;
            }
            
            // Horizontal scrolling
            if (moveEvent.clientX > containerRect.right - scrollThreshold) {
              scrollContainer.scrollLeft += scrollSpeed;
            } else if (moveEvent.clientX < containerRect.left + scrollThreshold) {
              scrollContainer.scrollLeft -= scrollSpeed;
            }
            
            // Vertical scrolling
            if (moveEvent.clientY > containerRect.bottom - scrollThreshold) {
              scrollContainer.scrollTop += scrollSpeed;
            } else if (moveEvent.clientY < containerRect.top + scrollThreshold) {
              scrollContainer.scrollTop -= scrollSpeed;
            }
          }, 16);
        }
      }
    };
    
    const handleMouseUp = () => {
      isMouseDown = false;
      setDraggingFrame(false);
      setActiveFrameId(null);
      
      // Important: Update the position in the hook's state
      const finalPos = frameLayouts[frameId]?.position;
      if (finalPos) {
        onUpdateFramePosition(frameId, finalPos);
      }
      
      // Clear auto-scroll
      if (scrollInterval) {
        window.clearInterval(scrollInterval);
        scrollInterval = null;
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  };

  // Handle resize from all directions
  const handleMultiDirectionResize = (e: React.MouseEvent, frameId: string, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingFrameId(frameId);
    setResizeDirection(direction);
    setActiveFrameId(frameId);
    
    const frameElement = frameRefs.current[frameId];
    if (!frameElement || !framesContainerRef.current) return;
    
    const frameRect = frameElement.getBoundingClientRect();
    const containerRect = framesContainerRef.current.getBoundingClientRect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = frameLayouts[frameId]?.width || frameRect.width;
    const startHeight = frameLayouts[frameId]?.height || frameRect.height;
    const startPosition = frameLayouts[frameId]?.position || { 
      x: frameRect.left - containerRect.left + framesContainerRef.current.scrollLeft, 
      y: frameRect.top - containerRect.top + framesContainerRef.current.scrollTop 
    };
    
    // Mark as custom sized immediately
    onMarkFrameAsCustomSized(frameId);
    
    // Auto-scrolling support
    let scrollInterval: number | null = null;
    let isResizing = true;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;
      
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      // Calculate deltas from the start position for consistent resizing
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Calculate new dimensions based on resize direction
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosition.x;
      let newY = startPosition.y;
      
      // Handle resizing logic for different directions
      if (direction.includes('e')) { // Right edge
        newWidth = Math.max(300, startWidth + deltaX);
      }
      if (direction.includes('w')) { // Left edge
        const width = Math.max(300, startWidth - deltaX);
        newWidth = width;
        newX = startPosition.x + (startWidth - width);
      }
      if (direction.includes('s')) { // Bottom edge
        newHeight = Math.max(200, startHeight + deltaY);
      }
      if (direction.includes('n')) { // Top edge
        const height = Math.max(200, startHeight - deltaY);
        newHeight = height;
        newY = startPosition.y + (startHeight - height);
      }
      
      // Update the frame layout - this affects visual position only
      setFrameLayouts(prev => ({
        ...prev,
        [frameId]: {
          ...prev[frameId],
          width: newWidth,
          height: newHeight,
          position: { x: newX, y: newY },
          maxHeight: false,
        }
      }));
      
      // Auto-scrolling logic 
      const scrollContainer = framesContainerRef.current?.parentElement;
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollThreshold = 50;
        const scrollSpeed = 15;
        
        // Clear any existing scroll interval
        if (scrollInterval) {
          window.clearInterval(scrollInterval);
          scrollInterval = null;
        }
        
        // Check if we need to scroll
        const needsHorizontalScroll = 
          moveEvent.clientX > containerRect.right - scrollThreshold || 
          moveEvent.clientX < containerRect.left + scrollThreshold;
          
        const needsVerticalScroll = 
          moveEvent.clientY > containerRect.bottom - scrollThreshold || 
          moveEvent.clientY < containerRect.top + scrollThreshold;
      
        if (needsHorizontalScroll || needsVerticalScroll) {
          scrollInterval = window.setInterval(() => {
            // Horizontal scrolling
            if (moveEvent.clientX > containerRect.right - scrollThreshold) {
              scrollContainer.scrollLeft += scrollSpeed;
            } else if (moveEvent.clientX < containerRect.left + scrollThreshold) {
              scrollContainer.scrollLeft -= scrollSpeed;
            }
            
            // Vertical scrolling
            if (moveEvent.clientY > containerRect.bottom - scrollThreshold) {
              scrollContainer.scrollTop += scrollSpeed;
            } else if (moveEvent.clientY < containerRect.top + scrollThreshold) {
              scrollContainer.scrollTop -= scrollSpeed;
            }
          }, 16);
        }
      }
    };
    
    const handleMouseUp = () => {
      isResizing = false;
      
      // Get final layout from local state
      const finalLayout = frameLayouts[frameId];
      
      if (finalLayout?.position) {
        // Update position in hook state
        onUpdateFramePosition(frameId, finalLayout.position);
      }
      
      // Reset UI state
      setResizingFrameId(null);
      setResizeDirection(null);
      setActiveFrameId(null);
      
      // Clear auto-scroll
      if (scrollInterval) {
        window.clearInterval(scrollInterval);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseLeave = () => {
      // Only handle mouse leave for the document
      if (event && (event.target as Node)?.nodeName !== 'HTML') {
        return;
      }
      handleMouseUp();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
  };

  // Toggle maximize frame height
  const toggleMaximizeHeight = (frameId: string) => {
    setFrameLayouts(prev => {
      const newLayout = {
        ...prev[frameId],
        height: prev[frameId].maxHeight ? 400 : window.innerHeight - 180,
        maxHeight: !prev[frameId].maxHeight
      };
      
      // Also update frame hook state
      onMarkFrameAsCustomSized(frameId);
      if (newLayout.position) {
        onUpdateFramePosition(frameId, newLayout.position);
      }
      
      return {
        ...prev,
        [frameId]: newLayout
      };
    });
  };

  // Reset frame size
  const resetFrameSize = (frameId: string, defaultWidth: number = 400) => {
    setFrameLayouts(prev => {
      const position = prev[frameId]?.position;
      // Keep the existing position
      return {
        ...prev,
        [frameId]: {
          height: 400,
          width: defaultWidth,
          maxHeight: false,
          position
        }
      };
    });
  };

  // Toggle config panel visibility for a frame
  const toggleConfigPanel = (frameId: string) => {
    setExpandedConfigFrames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(frameId)) {
        newSet.delete(frameId);
      } else {
        newSet.add(frameId);
      }
      return newSet;
    });
  };

  return {
    frameLayouts,
    resizingFrameId,
    resizeDirection,
    draggedFrameId,
    dragOverFrameId,
    draggingFrame,
    activeFrameId,
    frameRefs,
    framesContainerRef,
    expandedConfigFrames,
    handleFrameMoveStart,
    handleMultiDirectionResize,
    toggleMaximizeHeight,
    resetFrameSize,
    toggleConfigPanel,
    setActiveFrameId,
    setResizingFrameId,
    setResizeDirection,
    setDraggedFrameId,
    setDragOverFrameId,
  };
};