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

// Helper to get cursor style based on resize direction
const getCursorStyleForDirection = (direction: string): string => {
  switch (direction) {
    case 'n': return 'ns-resize';
    case 's': return 'ns-resize';
    case 'e': return 'ew-resize';
    case 'w': return 'ew-resize';
    case 'ne': return 'nesw-resize';
    case 'nw': return 'nwse-resize';
    case 'se': return 'nwse-resize';
    case 'sw': return 'nesw-resize';
    default: return 'default';
  }
};

// Padding to automatically add when frames approach container edges
const CONTAINER_PADDING = 200;

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
  
  // Store original cursor style to restore when done resizing
  const originalCursorRef = useRef<string>('');
  
  // Reference to the resize handle element for pointer lock
  const resizeHandleRef = useRef<HTMLElement | null>(null);
  
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
    
    // Set minimum container dimensions with extra padding
    framesContainerRef.current.style.minWidth = `${maxRight + CONTAINER_PADDING}px`;
    framesContainerRef.current.style.minHeight = `${maxBottom + CONTAINER_PADDING}px`;
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
    
    // Store original cursor
    originalCursorRef.current = document.body.style.cursor;
    
    // Set cursor for dragging
    document.body.style.cursor = 'grabbing';
    
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
      
      // Check if we need to expand the container
      if (framesContainerRef.current) {
        const currentWidth = parseInt(framesContainerRef.current.style.minWidth || '0', 10);
        const currentHeight = parseInt(framesContainerRef.current.style.minHeight || '0', 10);
        
        const frameWidth = frameLayouts[frameId]?.width || 400;
        const frameHeight = frameLayouts[frameId]?.height || 400;
        
        const requiredWidth = newX + frameWidth + CONTAINER_PADDING;
        const requiredHeight = newY + frameHeight + CONTAINER_PADDING;
        
        // Expand container if needed
        if (requiredWidth > currentWidth) {
          framesContainerRef.current.style.minWidth = `${requiredWidth}px`;
        }
        
        if (requiredHeight > currentHeight) {
          framesContainerRef.current.style.minHeight = `${requiredHeight}px`;
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
      
      // Restore cursor
      document.body.style.cursor = originalCursorRef.current;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  };

  // Handle resize from all directions with locked pointer
  const handleMultiDirectionResize = (e: React.MouseEvent, frameId: string, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingFrameId(frameId);
    setResizeDirection(direction);
    setActiveFrameId(frameId);
    
    const frameElement = frameRefs.current[frameId];
    if (!frameElement || !framesContainerRef.current) return;
    
    // Store the resize handle element for pointer lock
    resizeHandleRef.current = e.target as HTMLElement;
    
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
    
    // Store original cursor
    originalCursorRef.current = document.body.style.cursor;
    
    // Set cursor based on resize direction
    const cursorStyle = getCursorStyleForDirection(direction);
    document.body.style.cursor = cursorStyle;
    
    // Lock the pointer to the resize handle
    if (resizeHandleRef.current) {
      resizeHandleRef.current.requestPointerLock();
    }
    
    // Track movement for locked pointer
    let accumulatedMovementX = 0;
    let accumulatedMovementY = 0;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;
      
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      // When pointer is locked, use movementX and movementY instead of absolute coordinates
      if (document.pointerLockElement === resizeHandleRef.current) {
        // Accumulate movements
        accumulatedMovementX += moveEvent.movementX;
        accumulatedMovementY += moveEvent.movementY;
      } else {
        // Fallback to regular coordinates if pointer lock fails
        accumulatedMovementX = moveEvent.clientX - startX;
        accumulatedMovementY = moveEvent.clientY - startY;
      }
      
      // Calculate new dimensions based on resize direction
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosition.x;
      let newY = startPosition.y;
      
      // Handle resizing logic for different directions
      if (direction.includes('e')) { // Right edge
        newWidth = Math.max(300, startWidth + accumulatedMovementX);
      }
      if (direction.includes('w')) { // Left edge
        const width = Math.max(300, startWidth - accumulatedMovementX);
        newWidth = width;
        newX = startPosition.x + (startWidth - width);
      }
      if (direction.includes('s')) { // Bottom edge
        newHeight = Math.max(200, startHeight + accumulatedMovementY);
      }
      if (direction.includes('n')) { // Top edge
        const height = Math.max(200, startHeight - accumulatedMovementY);
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
      
      // Auto-scrolling logic with locked pointer
      const scrollContainer = framesContainerRef.current?.parentElement;
      if (scrollContainer) {
        // With pointer lock, we need to determine scroll direction based on position
        // and size changes, not mouse position
        let needToScrollRight = false;
        let needToScrollLeft = false;
        let needToScrollDown = false;
        let needToScrollUp = false;
        
        // Right edge reaches view border
        if (direction.includes('e') && newX + newWidth > scrollContainer.scrollLeft + scrollContainer.clientWidth - 50) {
          needToScrollRight = true;
        }
        
        // Left edge reaches view border
        if (direction.includes('w') && newX < scrollContainer.scrollLeft + 50) {
          needToScrollLeft = true;
        }
        
        // Bottom edge reaches view border
        if (direction.includes('s') && newY + newHeight > scrollContainer.scrollTop + scrollContainer.clientHeight - 50) {
          needToScrollDown = true;
        }
        
        // Top edge reaches view border
        if (direction.includes('n') && newY < scrollContainer.scrollTop + 50) {
          needToScrollUp = true;
        }
        
        // Clear any existing scroll interval
        if (scrollInterval) {
          window.clearInterval(scrollInterval);
          scrollInterval = null;
        }
        
        if (needToScrollRight || needToScrollLeft || needToScrollDown || needToScrollUp) {
          const scrollSpeed = 15;
          scrollInterval = window.setInterval(() => {
            // Horizontal scrolling
            if (needToScrollRight) {
              scrollContainer.scrollLeft += scrollSpeed;
            } else if (needToScrollLeft) {
              scrollContainer.scrollLeft -= scrollSpeed;
            }
            
            // Vertical scrolling
            if (needToScrollDown) {
              scrollContainer.scrollTop += scrollSpeed;
            } else if (needToScrollUp) {
              scrollContainer.scrollTop -= scrollSpeed;
            }
          }, 16);
        }
      }
      
      // Check if we need to expand the container
      if (framesContainerRef.current) {
        const currentWidth = parseInt(framesContainerRef.current.style.minWidth || '0', 10);
        const currentHeight = parseInt(framesContainerRef.current.style.minHeight || '0', 10);
        
        const requiredWidth = newX + newWidth + CONTAINER_PADDING;
        const requiredHeight = newY + newHeight + CONTAINER_PADDING;
        
        // Expand container dynamically if needed
        if (requiredWidth > currentWidth) {
          framesContainerRef.current.style.minWidth = `${requiredWidth}px`;
        }
        
        if (requiredHeight > currentHeight) {
          framesContainerRef.current.style.minHeight = `${requiredHeight}px`;
        }
      }
    };
    
    const handleMouseUp = () => {
      isResizing = false;
      
      // Get the current position of the resize handle before releasing pointer lock
      let handleRect: DOMRect | null = null;
      
      if (resizeHandleRef.current) {
        handleRect = resizeHandleRef.current.getBoundingClientRect();
      }
      
      // Release pointer lock
      if (document.pointerLockElement === resizeHandleRef.current) {
        document.exitPointerLock();
        
        // After releasing pointer lock, position the cursor at the handle if we have coordinates
        if (handleRect) {
          // Use a slight delay to ensure pointer lock is fully released
          setTimeout(() => {
            try {
              // Position mouse at center of handle
              const x = handleRect!.left + handleRect!.width / 2;
              const y = handleRect!.top + handleRect!.height / 2;
              
              // Some browsers support moveMouse - but this is non-standard and may not work everywhere
              if ('moveMouse' in window) {
                (window as any).moveMouse(x, y);
              }
            } catch (e) {
              // Silently handle any errors - this is just a nice-to-have feature
              console.warn("Could not move mouse cursor", e);
            }
          }, 10);
        }
      }
      
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
      
      // Restore cursor style
      document.body.style.cursor = originalCursorRef.current;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
    
    const handleMouseLeave = (event: MouseEvent) => {
      // Only handle mouse leave for the document if pointer isn't locked
      if (document.pointerLockElement !== resizeHandleRef.current &&
          event && event.target && (event.target as Node)?.nodeName === 'HTML') {
        handleMouseUp();
      }
    };
    
    const handlePointerLockChange = () => {
      // If pointer lock is exited unexpectedly, end resizing
      if (document.pointerLockElement !== resizeHandleRef.current && isResizing) {
        handleMouseUp();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
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