import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { FrameConfig } from './useMultiboxTester';

// Constants
const CONTAINER_PADDING = 200;
const MIN_FRAME_WIDTH = 400;
const MIN_FRAME_HEIGHT = 800;
const DEFAULT_FRAME_SIZE = 800;
const SCROLL_THRESHOLD = 100;
const SCROLL_SPEED = 15;
const SCROLL_INTERVAL_MS = 16;
const GRID_SIZE = 20; // Size of grid cells in pixels

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
  snapToGrid?: boolean;
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
  resetFrameSize: (frameId: string, defaultWidth?: number, defaultHeight?: number) => void;
  toggleConfigPanel: (frameId: string) => void;
  setActiveFrameId: (frameId: string | null) => void;
  setResizingFrameId: (frameId: string | null) => void;
  setResizeDirection: (direction: string | null) => void;
  setDraggedFrameId: (frameId: string | null) => void;
  setDragOverFrameId: (frameId: string | null) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
}

// Helper function to snap position to grid
const snapToGridValue = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Memoize cursor styles to avoid recreating this object on each render
const CURSOR_STYLES: Record<string, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize'
};

// Get cursor style for resize direction
const getCursorStyleForDirection = (direction: string): string => {
  return CURSOR_STYLES[direction] || 'default';
};

export const useFrameLayout = ({
  frames,
  onUpdateFramePosition,
  onMarkFrameAsCustomSized,
  snapToGrid: initialSnapToGrid = false,
}: UseFrameLayoutProps): UseFrameLayoutReturn => {
  const [frameLayouts, setFrameLayouts] = useState<Record<string, FrameLayout>>({});
  const [resizingFrameId, setResizingFrameId] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);
  const [dragOverFrameId, setDragOverFrameId] = useState<string | null>(null);
  const [draggingFrame, setDraggingFrame] = useState<boolean>(false);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null);
  const [expandedConfigFrames, setExpandedConfigFrames] = useState<Set<string>>(new Set());
  const [snapToGrid, setSnapToGrid] = useState<boolean>(initialSnapToGrid);

  const framesContainerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const originalCursorRef = useRef<string>('');
  const resizeHandleRef = useRef<HTMLElement | null>(null);
  const mousePositionRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  // Use a ref to track layout batch updates for better performance
  const pendingLayoutUpdates = useRef<Record<string, FrameLayout>>({});
  const layoutUpdateTimeoutRef = useRef<number | null>(null);

  // Batch layout updates for better performance
  const batchLayoutUpdates = useCallback(() => {
    if (Object.keys(pendingLayoutUpdates.current).length === 0) return;
    
    setFrameLayouts(prev => ({
      ...prev,
      ...pendingLayoutUpdates.current
    }));
    
    pendingLayoutUpdates.current = {};
    layoutUpdateTimeoutRef.current = null;
  }, []);

  // Schedule layout update with debouncing
  const scheduleLayoutUpdate = useCallback((frameId: string, layout: Partial<FrameLayout>) => {
    pendingLayoutUpdates.current[frameId] = {
      ...(frameLayouts[frameId] || {
        width: DEFAULT_FRAME_SIZE,
        height: DEFAULT_FRAME_SIZE,
        maxHeight: false
      }),
      ...layout
    } as FrameLayout;
    
    if (layoutUpdateTimeoutRef.current !== null) {
      window.cancelAnimationFrame(layoutUpdateTimeoutRef.current);
    }
    
    layoutUpdateTimeoutRef.current = window.requestAnimationFrame(batchLayoutUpdates);
  }, [frameLayouts, batchLayoutUpdates]);

  // Clean up any pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (layoutUpdateTimeoutRef.current !== null) {
        window.cancelAnimationFrame(layoutUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Adjust container size to fit all frames
  useEffect(() => {
    const container = framesContainerRef.current;
    if (!container) return;

    // Use requestAnimationFrame for layout calculations
    const rafId = requestAnimationFrame(() => {
      let maxRight = 0;
      let maxBottom = 0;

      frames.forEach(frame => {
        const layout = frameLayouts[frame.id];
        const position = layout?.position || frame.position || { x: 0, y: 0 };

        if (layout) {
          maxRight = Math.max(maxRight, position.x + layout.width);
          maxBottom = Math.max(maxBottom, position.y + layout.height);
        }
      });

      container.style.minWidth = `${maxRight + CONTAINER_PADDING}px`;
      container.style.minHeight = `${maxBottom + CONTAINER_PADDING}px`;
    });

    return () => cancelAnimationFrame(rafId);
  }, [frames, frameLayouts]);

  // Initialize new frames with default layout
  useEffect(() => {
    const newLayouts: Record<string, FrameLayout> = {};

    frames.forEach(frame => {
      if (!frameLayouts[frame.id]) {
        newLayouts[frame.id] = {
          height: DEFAULT_FRAME_SIZE,
          width: DEFAULT_FRAME_SIZE,
          maxHeight: false,
          position: frame.position
        };
      }
    });

    if (Object.keys(newLayouts).length > 0) {
      setFrameLayouts(prev => ({ ...prev, ...newLayouts }));
    }
  }, [frames, frameLayouts]);

  // Sync positions back to the parent hook using a debounced update
  // to avoid excessive state updates during dragging or resizing
  useEffect(() => {
    if (draggingFrame || resizingFrameId) return;
    
    let syncTimeout: number | null = null;
    
    const syncPositions = () => {
      Object.entries(frameLayouts).forEach(([frameId, layout]) => {
        if (!layout.position) return;

        const frame = frames.find(f => f.id === frameId);
        if (!frame) return;

        const framePos = frame.position;
        const layoutPos = layout.position;

        if (framePos?.x !== layoutPos.x || framePos?.y !== layoutPos.y) {
          onUpdateFramePosition(frameId, layoutPos);
        }
      });
    };
    
    syncTimeout = window.setTimeout(syncPositions, 100);
    
    return () => {
      if (syncTimeout) window.clearTimeout(syncTimeout);
    };
  }, [frameLayouts, draggingFrame, resizingFrameId, frames, onUpdateFramePosition]);

  // Helper function for setting up auto-scroll
  const setupAutoScroll = useCallback((
    isActive: RefObject<boolean>,
    getScrollDirections: () => { horizontal: number, vertical: number }
  ) => {
    let scrollInterval: number | null = null;

    const startAutoScroll = () => {
      const scrollContainer = framesContainerRef.current?.parentElement;
      if (!scrollContainer) return;

      if (scrollInterval) {
        window.clearInterval(scrollInterval);
      }

      scrollInterval = window.setInterval(() => {
        if (!isActive.current) {
          clearAutoScroll();
          return;
        }

        const { horizontal, vertical } = getScrollDirections();

        if (horizontal !== 0) {
          scrollContainer.scrollLeft += horizontal * SCROLL_SPEED;
        }

        if (vertical !== 0) {
          scrollContainer.scrollTop += vertical * SCROLL_SPEED;
        }
      }, SCROLL_INTERVAL_MS);
    };

    const clearAutoScroll = () => {
      if (scrollInterval) {
        window.clearInterval(scrollInterval);
        scrollInterval = null;
      }
    };

    return { startAutoScroll, clearAutoScroll };
  }, []);

  // Helper to expand container if needed - memoized to avoid recreation
  const expandContainerIfNeeded = useCallback((x: number, y: number, width: number, height: number) => {
    const container = framesContainerRef.current;
    if (!container) return;

    const currentWidth = parseInt(container.style.minWidth || '0', 10);
    const currentHeight = parseInt(container.style.minHeight || '0', 10);

    const requiredWidth = x + width + CONTAINER_PADDING;
    const requiredHeight = y + height + CONTAINER_PADDING;

    if (requiredWidth > currentWidth) {
      container.style.minWidth = `${requiredWidth}px`;
    }

    if (requiredHeight > currentHeight) {
      container.style.minHeight = `${requiredHeight}px`;
    }
  }, []);

  // Helper function to snap position to grid if enabled
  const maybeSnapToGrid = useCallback((position: { x: number, y: number }): { x: number, y: number } => {
    if (!snapToGrid) return position;
    return {
      x: snapToGridValue(position.x, GRID_SIZE),
      y: snapToGridValue(position.y, GRID_SIZE)
    };
  }, [snapToGrid]);

  // Helper function to snap dimensions to grid if enabled
  const maybeSnapDimensions = useCallback((dimensions: { width: number, height: number }): { width: number, height: number } => {
    if (!snapToGrid) return dimensions;
    return {
      width: Math.max(MIN_FRAME_WIDTH, snapToGridValue(dimensions.width, GRID_SIZE)),
      height: Math.max(MIN_FRAME_HEIGHT, snapToGridValue(dimensions.height, GRID_SIZE))
    };
  }, [snapToGrid]);

  // Frame drag handler - optimized with debounced updates
  const handleFrameMoveStart = useCallback((e: React.MouseEvent, frameId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!(e.target as HTMLElement).closest('.frame-drag-handle')) {
      return;
    }

    setDraggingFrame(true);
    setActiveFrameId(frameId);

    const frameElement = frameRefs.current[frameId];
    const container = framesContainerRef.current;
    if (!frameElement || !container) return;

    // Store the drag handle element for pointer lock
    const dragHandleElement = (e.target as HTMLElement).closest('.frame-drag-handle') as HTMLElement;

    const frameRect = frameElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Get current scale/zoom from transform style
    const transformStyle = window.getComputedStyle(container).transform;
    const matrix = new DOMMatrix(transformStyle);
    const scale = matrix.a || 1; // The 'a' value in the matrix represents scale

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = frameRect.left - containerRect.left + container.scrollLeft;
    const startTop = frameRect.top - containerRect.top + container.scrollTop;

    const frameLayout = frameLayouts[frameId] || {
      width: frameRect.width,
      height: frameRect.height,
      maxHeight: false,
      position: { x: startLeft, y: startTop }
    };

    const startPosition = frameLayout.position || { x: startLeft, y: startTop };

    // Initial update without debouncing
    scheduleLayoutUpdate(frameId, {
      position: startPosition
    });

    onMarkFrameAsCustomSized(frameId);

    const isMouseDown = { current: true };

    originalCursorRef.current = document.body.style.cursor;
    document.body.style.cursor = 'grabbing';
    
    // Apply pointer lock if available
    if (dragHandleElement) {
      dragHandleElement.requestPointerLock();
    }

    // Track movements when using pointer lock
    let accumulatedMovementX = 0;
    let accumulatedMovementY = 0;

    // Track the last time we updated the position
    let lastPositionUpdate = performance.now();
    let lastPosition = { x: startPosition.x, y: startPosition.y };

    const getScrollDirections = () => {
      const scrollContainer = container.parentElement;
      if (!scrollContainer) return { horizontal: 0, vertical: 0 };

      const containerRect = scrollContainer.getBoundingClientRect();
      const mouseX = mousePositionRef.current.x;
      const mouseY = mousePositionRef.current.y;

      let horizontal = 0;
      let vertical = 0;

      if (mouseX > containerRect.right - SCROLL_THRESHOLD) horizontal = 1;
      else if (mouseX < containerRect.left + SCROLL_THRESHOLD) horizontal = -1;

      if (mouseY > containerRect.bottom - SCROLL_THRESHOLD) vertical = 1;
      else if (mouseY < containerRect.top + SCROLL_THRESHOLD) vertical = -1;

      return { horizontal, vertical };
    };

    const { startAutoScroll, clearAutoScroll } = setupAutoScroll(isMouseDown, getScrollDirections);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown.current) return;

      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      // Store mouse position for auto-scroll
      mousePositionRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };

      // Account for zoom level and pointer lock in movement calculations
      let deltaX, deltaY;
      
      if (document.pointerLockElement === dragHandleElement) {
        // When pointer is locked, use movementX/Y directly
        accumulatedMovementX += moveEvent.movementX;
        accumulatedMovementY += moveEvent.movementY;
        deltaX = accumulatedMovementX / scale;
        deltaY = accumulatedMovementY / scale;
      } else {
        // When pointer is not locked, calculate delta from start position
        deltaX = (moveEvent.clientX - startX) / scale;
        deltaY = (moveEvent.clientY - startY) / scale;
      }

      let newX = Math.max(0, startPosition.x + deltaX);
      // Apply the same header height constraint we use for resize
      const headerHeight = 60; // Same as in resize handler
      let newY = Math.max(headerHeight, startPosition.y + deltaY);

      // Apply grid snapping if enabled
      const snappedPosition = maybeSnapToGrid({ x: newX, y: newY });
      newX = snappedPosition.x;
      newY = snappedPosition.y;

      // Use debounced updates for better performance
      const now = performance.now();
      if (now - lastPositionUpdate > 16 || 
          Math.abs(newX - lastPosition.x) > 10 || 
          Math.abs(newY - lastPosition.y) > 10) {
        
        scheduleLayoutUpdate(frameId, {
          position: { x: newX, y: newY }
        });
        
        lastPositionUpdate = now;
        lastPosition = { x: newX, y: newY };
      }

      const scrollContainer = container.parentElement;
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();

        const needsScroll =
          moveEvent.clientX > containerRect.right - SCROLL_THRESHOLD ||
          moveEvent.clientX < containerRect.left + SCROLL_THRESHOLD ||
          moveEvent.clientY > containerRect.bottom - SCROLL_THRESHOLD ||
          moveEvent.clientY < containerRect.top + SCROLL_THRESHOLD;

        if (needsScroll) {
          startAutoScroll();
        }
      }

      const frameWidth = frameLayouts[frameId]?.width || DEFAULT_FRAME_SIZE;
      const frameHeight = frameLayouts[frameId]?.height || DEFAULT_FRAME_SIZE;
      expandContainerIfNeeded(newX, newY, frameWidth, frameHeight);
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      setDraggingFrame(false);
      setActiveFrameId(null);

      // Exit pointer lock if active
      if (document.pointerLockElement === dragHandleElement) {
        document.exitPointerLock();
      }

      // Force any pending layout updates to be applied
      batchLayoutUpdates();

      const finalPos = frameLayouts[frameId]?.position || lastPosition;
      onUpdateFramePosition(frameId, finalPos);

      clearAutoScroll();
      document.body.style.cursor = originalCursorRef.current;

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (document.pointerLockElement !== dragHandleElement &&
        event?.target && (event.target as Node)?.nodeName === 'HTML') {
        handleMouseUp();
      }
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== dragHandleElement && isMouseDown.current) {
        handleMouseUp();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
  }, [
    frameLayouts, 
    maybeSnapToGrid, 
    setupAutoScroll, 
    expandContainerIfNeeded, 
    scheduleLayoutUpdate,
    batchLayoutUpdates,
    onMarkFrameAsCustomSized, 
    onUpdateFramePosition
  ]);

  // Frame resize handler - optimized with debounced updates
  const handleMultiDirectionResize = useCallback((e: React.MouseEvent, frameId: string, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    setResizingFrameId(frameId);
    setResizeDirection(direction);
    setActiveFrameId(frameId);

    const frameElement = frameRefs.current[frameId];
    const container = framesContainerRef.current;
    if (!frameElement || !container) return;

    resizeHandleRef.current = e.target as HTMLElement;

    // Get current scale/zoom from transform style
    const transformStyle = window.getComputedStyle(container).transform;
    const matrix = new DOMMatrix(transformStyle);
    const scale = matrix.a || 1; // The 'a' value in the matrix represents scale

    const frameRect = frameElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = frameLayouts[frameId]?.width || frameRect.width;
    const startHeight = frameLayouts[frameId]?.height || frameRect.height;
    const startPosition = frameLayouts[frameId]?.position || {
      x: frameRect.left - containerRect.left + container.scrollLeft,
      y: frameRect.top - containerRect.top + container.scrollTop
    };

    onMarkFrameAsCustomSized(frameId);

    const isResizing = { current: true };
    originalCursorRef.current = document.body.style.cursor;
    document.body.style.cursor = getCursorStyleForDirection(direction);

    if (resizeHandleRef.current) {
      resizeHandleRef.current.requestPointerLock();
    }

    let accumulatedMovementX = 0;
    let accumulatedMovementY = 0;
    
    // Track the last time we updated the position
    let lastResizeUpdate = performance.now();
    let lastDimensions = { 
      x: startPosition.x, 
      y: startPosition.y, 
      width: startWidth, 
      height: startHeight 
    };

    const getScrollDirections = () => {
      const scrollContainer = container.parentElement;
      if (!scrollContainer) return { horizontal: 0, vertical: 0 };

      const { x: newX, y: newY, width: newWidth, height: newHeight } = calculateNewDimensions();

      let horizontal = 0;
      let vertical = 0;

      // Determine scroll direction based on edge positions relative to viewport
      if (direction.includes('e') &&
        newX + newWidth > scrollContainer.scrollLeft + scrollContainer.clientWidth - SCROLL_THRESHOLD) {
        horizontal = 1;
      } else if (direction.includes('w') && newX < scrollContainer.scrollLeft + SCROLL_THRESHOLD) {
        horizontal = -1;
      }

      if (direction.includes('s') &&
        newY + newHeight > scrollContainer.scrollTop + scrollContainer.clientHeight - SCROLL_THRESHOLD) {
        vertical = 1;
      } else if (direction.includes('n') && newY < scrollContainer.scrollTop + SCROLL_THRESHOLD) {
        vertical = -1;
      }

      return { horizontal, vertical };
    };

    const { startAutoScroll, clearAutoScroll } = setupAutoScroll(isResizing, getScrollDirections);

    const calculateNewDimensions = () => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosition.x;
      let newY = startPosition.y;

      // Adjusted movements accounting for zoom level
      const adjustedMovementX = accumulatedMovementX / scale;
      const adjustedMovementY = accumulatedMovementY / scale;

      if (direction.includes('e')) {
        newWidth = Math.max(MIN_FRAME_WIDTH, startWidth + adjustedMovementX);
      }
      if (direction.includes('w')) {
        const width = Math.max(MIN_FRAME_WIDTH, startWidth - adjustedMovementX);
        newWidth = width;
        newX = startPosition.x + (startWidth - width);
      }
      if (direction.includes('s')) {
        newHeight = Math.max(MIN_FRAME_HEIGHT, startHeight + adjustedMovementY);
      }
      if (direction.includes('n')) {
        // Don't allow resizing above a minimum top position (under header)
        const headerHeight = 60; // header height in pixels
        
        const height = Math.max(MIN_FRAME_HEIGHT, startHeight - adjustedMovementY);
        newHeight = height;
        
        // New Y position after resize
        const potentialY = startPosition.y + (startHeight - height);
        // Ensure we don't go above the header
        newY = Math.max(headerHeight, potentialY);
        
        // If we constrained Y, adjust height accordingly
        if (newY > potentialY) {
          newHeight = startHeight - ((newY - startPosition.y) * scale);
        }
      }

      // Apply grid snapping if enabled
      if (snapToGrid) {
        const snappedPosition = maybeSnapToGrid({ x: newX, y: newY });
        newX = snappedPosition.x;
        newY = snappedPosition.y;
        
        const snappedDimensions = maybeSnapDimensions({ width: newWidth, height: newHeight });
        newWidth = snappedDimensions.width;
        newHeight = snappedDimensions.height;
      }

      return { x: newX, y: newY, width: newWidth, height: newHeight };
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;

      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      if (document.pointerLockElement === resizeHandleRef.current) {
        accumulatedMovementX += moveEvent.movementX;
        accumulatedMovementY += moveEvent.movementY;
      } else {
        accumulatedMovementX = moveEvent.clientX - startX;
        accumulatedMovementY = moveEvent.clientY - startY;
      }

      const { x: newX, y: newY, width: newWidth, height: newHeight } = calculateNewDimensions();

      // Use debounced updates for better performance during resize
      const now = performance.now();
      if (now - lastResizeUpdate > 16 || 
          Math.abs(newWidth - lastDimensions.width) > 5 || 
          Math.abs(newHeight - lastDimensions.height) > 5 ||
          Math.abs(newX - lastDimensions.x) > 5 || 
          Math.abs(newY - lastDimensions.y) > 5) {
        
        scheduleLayoutUpdate(frameId, {
          width: newWidth,
          height: newHeight,
          position: { x: newX, y: newY },
          maxHeight: false,
        });
        
        lastResizeUpdate = now;
        lastDimensions = { x: newX, y: newY, width: newWidth, height: newHeight };
      }

      startAutoScroll();
      expandContainerIfNeeded(newX, newY, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;

      if (document.pointerLockElement === resizeHandleRef.current) {
        document.exitPointerLock();
      }

      // Force any pending layout updates to be applied
      batchLayoutUpdates();

      const finalLayout = frameLayouts[frameId];
      if (finalLayout?.position) {
        onUpdateFramePosition(frameId, finalLayout.position);
      }

      setResizingFrameId(null);
      setResizeDirection(null);
      setActiveFrameId(null);

      clearAutoScroll();
      document.body.style.cursor = originalCursorRef.current;

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (document.pointerLockElement !== resizeHandleRef.current &&
        event?.target && (event.target as Node)?.nodeName === 'HTML') {
        handleMouseUp();
      }
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== resizeHandleRef.current && isResizing.current) {
        handleMouseUp();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
  }, [
    frameLayouts, 
    maybeSnapToGrid, 
    maybeSnapDimensions, 
    setupAutoScroll,
    expandContainerIfNeeded,
    scheduleLayoutUpdate,
    batchLayoutUpdates,
    onMarkFrameAsCustomSized,
    onUpdateFramePosition,
    snapToGrid
  ]);

  // Toggle frame height maximization - memoized for performance
  const toggleMaximizeHeight = useCallback((frameId: string) => {
    setFrameLayouts(prev => {
      const currentLayout = prev[frameId];
      if (!currentLayout) return prev;

      const newHeight = currentLayout.maxHeight ? DEFAULT_FRAME_SIZE : window.innerHeight - 180;
      const newLayout = {
        ...currentLayout,
        height: newHeight,
        maxHeight: !currentLayout.maxHeight
      };

      onMarkFrameAsCustomSized(frameId);
      if (newLayout.position) {
        onUpdateFramePosition(frameId, newLayout.position);
      }

      return { ...prev, [frameId]: newLayout };
    });
  }, [onMarkFrameAsCustomSized, onUpdateFramePosition]);

  // Reset frame size - memoized for performance
  const resetFrameSize = useCallback((frameId: string, defaultWidth: number = DEFAULT_FRAME_SIZE, defaultHeight: number = DEFAULT_FRAME_SIZE) => {
    setFrameLayouts(prev => {
      const position = prev[frameId]?.position;
      return {
        ...prev,
        [frameId]: {
          height: defaultHeight,
          width: defaultWidth,
          maxHeight: false,
          position
        }
      };
    });
  }, []);

  // Toggle config panel expansion - memoized for performance
  const toggleConfigPanel = useCallback((frameId: string) => {
    setExpandedConfigFrames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(frameId)) {
        newSet.delete(frameId);
      } else {
        newSet.add(frameId);
      }
      return newSet;
    });
  }, []);

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
    snapToGrid,
    setSnapToGrid,
  };
};