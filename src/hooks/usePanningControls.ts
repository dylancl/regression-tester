import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

export interface UsePanningControlsProps {
  parentRef: RefObject<HTMLDivElement | null>;
}

export interface UsePanningControlsReturn {
  isPanning: boolean;
  isPanningEnabled: boolean;
  startPanning: (e: React.MouseEvent | MouseEvent) => void;
  stopPanning: () => void;
  togglePanningMode: () => void;
}

export const usePanningControls = ({
  parentRef,
}: UsePanningControlsProps): UsePanningControlsReturn => {
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isPanningEnabled, setIsPanningEnabled] = useState<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startScrollRef = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
  const isSpacePressed = useRef<boolean>(false);
  const originalOverflowRef = useRef<string>('');
  const iframeStylesRef = useRef<Map<HTMLIFrameElement, string>>(new Map());
  
  // Helper to disable/enable pointer events on iframes
  const setIframesPointerEvents = useCallback((value: string) => {
    // Find all iframes in the container
    const iframes = document.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
      // Store original pointer-events value if we haven't already
      if (!iframeStylesRef.current.has(iframe)) {
        iframeStylesRef.current.set(iframe, iframe.style.pointerEvents || 'auto');
      }
      
      // Set the new pointer-events value
      iframe.style.pointerEvents = value;
    });
  }, []);
  
  // Helper to restore original iframe styles
  const restoreIframeStyles = useCallback(() => {
    iframeStylesRef.current.forEach((originalStyle, iframe) => {
      iframe.style.pointerEvents = originalStyle;
    });
    
    // Clear the stored styles
    iframeStylesRef.current.clear();
  }, []);
  
  // Modified approach: Use a more aggressive space key handling strategy
  useEffect(() => {
    // Store original document overflow style
    originalOverflowRef.current = document.documentElement.style.overflow;
    
    // Direct DOM event handler to block space key at the capture phase
    // This runs before React event handlers and captures the events early
    const preventSpaceScroll = (e: KeyboardEvent) => {
      // Check both key and code to be sure we catch all space keys
      if (e.key === ' ' || e.code === 'Space') {
        // Completely block this event
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // If it's a keydown and not a repeat, enable panning mode
        if (e.type === 'keydown' && !e.repeat && !isSpacePressed.current) {
          isSpacePressed.current = true;
          setIsPanningEnabled(true);
          
          // Change cursor to indicate panning is available
          document.body.style.cursor = 'grab';
          
          // Disable scrolling on the HTML element while space is pressed
          document.documentElement.style.overflow = 'hidden';
          
          // Disable pointer events on iframes to allow mouse events to pass through
          setIframesPointerEvents('none');
        }
        
        // If it's a keyup, disable panning mode
        if (e.type === 'keyup') {
          isSpacePressed.current = false;
          setIsPanningEnabled(false);
          
          // Reset cursor
          document.body.style.cursor = '';
          
          // Restore original overflow
          document.documentElement.style.overflow = originalOverflowRef.current;
          
          // Restore iframe pointer events
          setIframesPointerEvents('auto');
          restoreIframeStyles();
          
          // Make sure to stop panning
          stopPanning();
        }
        
        return false;
      }
    };
    
    // Create a function that stops scroll when space is pressed
    const preventScrollWhileSpacePressed = (e: Event) => {
      if (isSpacePressed.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    // Add low-level event listeners to document directly
    document.addEventListener('keydown', preventSpaceScroll, { capture: true, passive: false });
    document.addEventListener('keypress', preventSpaceScroll, { capture: true, passive: false });
    document.addEventListener('keyup', preventSpaceScroll, { capture: true, passive: false });
    
    // Prevent scroll events while space is pressed
    document.addEventListener('scroll', preventScrollWhileSpacePressed, { capture: true, passive: false });
    document.addEventListener('wheel', preventScrollWhileSpacePressed, { capture: true, passive: false });
    
    // Listen for focus changes to handle edge cases
    document.addEventListener('focusin', () => {
      if (isSpacePressed.current) {
        // Re-apply the overflow style if focus changes while space is pressed
        document.documentElement.style.overflow = 'hidden';
        // Re-disable pointer events on iframes
        setIframesPointerEvents('none');
      }
    }, { capture: true });
    
    // Handle when window loses focus
    window.addEventListener('blur', () => {
      // If the user switches away from the window while space is pressed,
      // we should clean up as if they released the key
      if (isSpacePressed.current) {
        isSpacePressed.current = false;
        setIsPanningEnabled(false);
        document.body.style.cursor = '';
        document.documentElement.style.overflow = originalOverflowRef.current;
        restoreIframeStyles();
        stopPanning();
      }
    });
    
    return () => {
      // Clean up all event listeners
      document.removeEventListener('keydown', preventSpaceScroll, { capture: true });
      document.removeEventListener('keypress', preventSpaceScroll, { capture: true });
      document.removeEventListener('keyup', preventSpaceScroll, { capture: true });
      document.removeEventListener('scroll', preventScrollWhileSpacePressed, { capture: true });
      document.removeEventListener('wheel', preventScrollWhileSpacePressed, { capture: true });
      
      // Restore original styles
      document.documentElement.style.overflow = originalOverflowRef.current;
      document.body.style.cursor = '';
      restoreIframeStyles();
    };
  }, [setIframesPointerEvents, restoreIframeStyles]);
  
  // Pan the container based on mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning || !parentRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    parentRef.current.scrollLeft = startScrollRef.current.left - deltaX;
    parentRef.current.scrollTop = startScrollRef.current.top - deltaY;
    
    // Update cursor to indicate active panning
    document.body.style.cursor = 'grabbing';
  }, [isPanning, parentRef]);
  
  // Clean up mouse events when panning stops
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', stopPanning);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopPanning);
      };
    }
  }, [isPanning, handleMouseMove]);
  
  // Start panning when mouse is pressed and space is held
  const startPanning = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isPanningEnabled || !parentRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsPanning(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startScrollRef.current = { 
      left: parentRef.current.scrollLeft, 
      top: parentRef.current.scrollTop 
    };
    
    // Update cursor to indicate active panning
    document.body.style.cursor = 'grabbing';
    
    // Ensure iframes have pointer-events disabled during active panning
    setIframesPointerEvents('none');
  }, [isPanningEnabled, parentRef, setIframesPointerEvents]);
  
  // Stop panning
  const stopPanning = useCallback(() => {
    setIsPanning(false);
    
    // Reset cursor to grab if space is still pressed, otherwise to default
    document.body.style.cursor = isSpacePressed.current ? 'grab' : '';
    
    // Only restore iframe pointer events if space is no longer pressed
    if (!isSpacePressed.current) {
      restoreIframeStyles();
    }
  }, [restoreIframeStyles]);
  
  // Toggle panning mode manually
  const togglePanningMode = useCallback(() => {
    setIsPanningEnabled(prev => !prev);
  }, []);
  
  return {
    isPanning,
    isPanningEnabled,
    startPanning,
    stopPanning,
    togglePanningMode,
  };
};