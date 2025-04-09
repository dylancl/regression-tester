import {
  Box,
  Menu,
  useMediaQuery,
  MenuItem,
  useTheme,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ChevronRight,
  Fullscreen,
  FullscreenExit,
  AspectRatio,
} from "@mui/icons-material";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useMultiboxTester } from "../hooks/useMultiboxTester";
import { useFrameLayout } from "../hooks/useFrameLayout";
import { useZoomControls } from "../hooks/useZoomControls";
import { usePanningControls } from "../hooks/usePanningControls";
import { Frame } from "./controls/Frame";
import { ZoomControls } from "./controls/ZoomControls";
import { DeviceSizeMenu } from "./controls/DeviceSizeMenu";

// Import our new shared components
import NotificationSnackbar from "./common/NotificationSnackbar";
import ActionSpeedDial from "./common/ActionSpeedDial";
import KeyboardShortcutsPanel from "./common/KeyboardShortcutsPanel";
import FrameGridContainer from "./common/FrameGridContainer";

const MultiboxTester = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    useState<boolean>(false);
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  // Container refs for panning
  const containerParentRef = useRef<HTMLDivElement>(null);

  const {
    frames,
    notification,
    globalSyncEnabled,
    addNewFrame,
    removeFrame,
    handleOptionChange,
    changeCountry,
    copyUrlToClipboard,
    handleIframeLoad,
    showNotification,
    markFrameAsCustomSized,
    resetFrameCustomSize,
    updateFramePosition,
    toggleFrameSync,
    toggleGlobalSync,
    updateFrameSyncOptions,
    refreshFrame,
  } = useMultiboxTester();

  const {
    frameLayouts,
    resizingFrameId,
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
    setActiveFrameId,
    snapToGrid,
    setSnapToGrid,
  } = useFrameLayout({
    frames,
    onUpdateFramePosition: updateFramePosition,
    onMarkFrameAsCustomSized: markFrameAsCustomSized,
  });

  const {
    zoomLevel,
    showZoomControls,
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    toggleZoomControls,
  } = useZoomControls({
    containerRef: containerParentRef,
  });

  const {
    isPanning,
    isPanningEnabled,
    startPanning,
    stopPanning,
    togglePanningMode,
  } = usePanningControls({
    parentRef: containerParentRef,
  });

  // Handle Escape key to close keyboard shortcuts panel
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showKeyboardShortcuts]);

  // Add global mouseup and mouseleave event handlers to stop panning
  useEffect(() => {
    const handleMouseUp = () => {
      if (isPanning) {
        stopPanning();
      }
    };

    const handleMouseLeave = () => {
      if (isPanning) {
        stopPanning();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPanning, stopPanning]);

  // Memoize handlers to prevent unnecessary rerenders
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, frameId: string) => {
      setMenuAnchorEl(event.currentTarget);
      setActiveFrameId(frameId);
    },
    [setActiveFrameId]
  );

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setActiveFrameId(null);
  }, [setActiveFrameId]);

  const handleSizeMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setSizeMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleSizeMenuClose = useCallback(() => {
    setSizeMenuAnchorEl(null);
  }, []);

  const handleSizeSelect = useCallback(
    (width: number, height: number) => {
      if (activeFrameId) {
        resetFrameSize(activeFrameId, width, height);
      }
    },
    [activeFrameId, resetFrameSize]
  );

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  const toggleSnapToGridHandler = useCallback(() => {
    setSnapToGrid(!snapToGrid);
    showNotification(
      snapToGrid ? "Snap to grid disabled" : "Snap to grid enabled"
    );
  }, [snapToGrid, setSnapToGrid, showNotification]);

  // Toggle keyboard shortcuts info
  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts((prev) => !prev);
  }, []);

  // Create a callback ref function that correctly sets the frameRefs
  const setFrameRef = useCallback(
    (id: string) => (node: HTMLDivElement | null) => {
      frameRefs.current[id] = node;
    },
    [frameRefs]
  );

  const handleResetFrameSize = useCallback(() => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, isMobile ? window.innerWidth - 40 : 400);
    }
  }, [activeFrameId, resetFrameSize, isMobile]);

  const handleResetAll = useCallback(() => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, isMobile ? window.innerWidth - 40 : 400);
      resetFrameCustomSize(activeFrameId);
    }
    handleMenuClose();
  }, [
    activeFrameId,
    resetFrameSize,
    resetFrameCustomSize,
    handleMenuClose,
    isMobile,
  ]);

  // Add a function to sync all frame sizes to the active frame's size
  const syncAllFrameSizes = useCallback(() => {
    if (!frames.length) return;

    // Get reference width - either from active frame or first frame
    const referenceWidth =
      activeFrameId && frameLayouts[activeFrameId]?.width
        ? frameLayouts[activeFrameId].width
        : frameLayouts[frames[0].id]?.width || 400;

    // Get reference height - either from active frame or first frame
    const referenceHeight =
      activeFrameId && frameLayouts[activeFrameId]?.height
        ? frameLayouts[activeFrameId].height
        : frameLayouts[frames[0].id]?.height || 400;

    // Apply this width to all frames
    frames.forEach((frame) => {
      if (frame.id !== activeFrameId) {
        resetFrameSize(frame.id, referenceWidth, referenceHeight);
      }
    });

    showNotification(
      `All frames synced to ${referenceWidth}px width and ${referenceHeight}px height`
    );
  }, [frames, activeFrameId, frameLayouts, resetFrameSize, showNotification]);

  // Memoize each Frame component to prevent unnecessary re-renders
  const frameComponents = useMemo(
    () =>
      frames.map((frame) => {
        // Get layout with position fallback logic
        const layout = frameLayouts[frame.id] || {
          width: 400,
          height: 400,
          maxHeight: false,
        };
        const position = layout.position || frame.position || { x: 0, y: 0 };

        // Only calculate styles that depend on the frame's state
        const frameStyle = {
          width: layout.width || 400,
          height: layout.height || "auto",
          position: "absolute",
          left: position.x,
          top: position.y,
          // Only use transitions when not actively dragging/resizing
          transition:
            draggedFrameId === frame.id ||
            resizingFrameId === frame.id ||
            draggingFrame
              ? "none"
              : "all 0.2s ease",
          opacity: draggedFrameId === frame.id ? 0.6 : 1,
          transform: dragOverFrameId === frame.id ? "scale(1.01)" : "scale(1)",
          zIndex:
            activeFrameId === frame.id
              ? 1001
              : draggingFrame && draggedFrameId === frame.id
              ? 1000
              : 1,
          boxShadow:
            resizingFrameId === frame.id || activeFrameId === frame.id
              ? theme.shadows[8]
              : theme.shadows[2],
        };

        return (
          <Box key={frame.id} ref={setFrameRef(frame.id)} sx={frameStyle}>
            <Frame
              frame={frame}
              layout={layout}
              isActive={activeFrameId === frame.id}
              isDragging={draggedFrameId === frame.id}
              isResizing={resizingFrameId === frame.id}
              isDraggedOver={dragOverFrameId === frame.id}
              isConfigExpanded={expandedConfigFrames.has(frame.id)}
              globalSyncEnabled={globalSyncEnabled}
              onMove={handleFrameMoveStart}
              onResize={handleMultiDirectionResize}
              onRemove={removeFrame}
              onCopyUrl={copyUrlToClipboard}
              onMenuOpen={handleMenuOpen}
              onToggleSync={toggleFrameSync}
              onIframeLoad={handleIframeLoad}
              onOptionChange={handleOptionChange}
              onChangeCountry={changeCountry}
              onShowNotification={showNotification}
              frameRef={null as unknown as React.RefObject<HTMLDivElement>} // Passing null ref as we're using Box ref
              onUpdateSyncOption={updateFrameSyncOptions}
              onReload={refreshFrame}
            />
          </Box>
        );
      }),
    [
      frames,
      frameLayouts,
      draggedFrameId,
      resizingFrameId,
      draggingFrame,
      activeFrameId,
      expandedConfigFrames,
      globalSyncEnabled,
      theme.shadows,
      handleFrameMoveStart,
      handleMultiDirectionResize,
      removeFrame,
      copyUrlToClipboard,
      handleMenuOpen,
      toggleFrameSync,
      handleIframeLoad,
      handleOptionChange,
      changeCountry,
      showNotification,
      setFrameRef,
      dragOverFrameId,
    ]
  );

  // Menu items for frame options - memoized to avoid recreating on each render
  const menuItemMaximizeHeight = useMemo(
    () => (
      <MenuItem
        onClick={() => activeFrameId && toggleMaximizeHeight(activeFrameId)}
      >
        {activeFrameId && frameLayouts[activeFrameId]?.maxHeight ? (
          <>
            <FullscreenExit fontSize="small" sx={{ mr: 1 }} />
            Reset Height
          </>
        ) : (
          <>
            <Fullscreen fontSize="small" sx={{ mr: 1 }} />
            Maximize Height
          </>
        )}
      </MenuItem>
    ),
    [activeFrameId, frameLayouts, toggleMaximizeHeight]
  );

  return (
    <Box
      ref={containerParentRef}
      sx={{
        height: "100%",
        width: "100%",
        overflow: "auto",
        p: 2,
        backgroundColor: theme.palette.background.default,
        position: "relative",
        cursor: isPanningEnabled
          ? isPanning
            ? "grabbing"
            : "grab"
          : "default",
      }}
    >
      {/* Frame Grid Container - using our new component */}
      <FrameGridContainer
        showGrid={showGrid}
        zoomLevel={zoomLevel}
        isPanningEnabled={isPanningEnabled}
        isPanning={isPanning}
        onStartPanning={startPanning}
        containerRef={framesContainerRef}
        parentRef={containerParentRef}
      >
        {frameComponents}
      </FrameGridContainer>

      {/* Keyboard Shortcuts Panel - using our new component */}
      <KeyboardShortcutsPanel
        visible={showKeyboardShortcuts}
        onClose={toggleKeyboardShortcuts}
      />

      {/* Frame Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {menuItemMaximizeHeight}
        <MenuItem onClick={handleSizeMenuOpen}>
          <ListItemIcon>
            <AspectRatio fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Change Frame Size"
            secondary={
              activeFrameId
                ? `Current: ${frameLayouts[activeFrameId]?.width || 400}px`
                : undefined
            }
          />
          <ChevronRight fontSize="small" />
        </MenuItem>
        <MenuItem onClick={() => handleResetFrameSize()}>
          <ListItemIcon>
            <AspectRatio fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Reset Size" />
        </MenuItem>
        <MenuItem onClick={handleResetAll}>
          <ListItemIcon>
            <AspectRatio fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Reset All" />
        </MenuItem>
      </Menu>

      {/* Device Size Menu */}
      <DeviceSizeMenu
        anchorEl={sizeMenuAnchorEl}
        currentWidth={
          activeFrameId ? frameLayouts[activeFrameId]?.width || 400 : 400
        }
        onClose={handleSizeMenuClose}
        onSelect={handleSizeSelect}
        onCloseParentMenu={handleMenuClose} // Add this to close the parent menu
      />

      {/* Notification Snackbar - using our new component */}
      <NotificationSnackbar message={notification} open={!!notification} />

      {/* Action SpeedDial - using our new component */}
      <ActionSpeedDial
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
        globalSyncEnabled={globalSyncEnabled}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        showZoomControls={showZoomControls}
        isPanningEnabled={isPanningEnabled}
        onAddFrame={addNewFrame}
        onToggleGlobalSync={toggleGlobalSync}
        onToggleGrid={toggleGrid}
        onToggleSnapToGrid={toggleSnapToGridHandler}
        onToggleZoomControls={toggleZoomControls}
        onTogglePanningMode={togglePanningMode}
        onSyncFrameSizes={syncAllFrameSizes}
        onShowKeyboardShortcuts={toggleKeyboardShortcuts}
      />

      {/* Zoom controls panel */}
      {showZoomControls && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 80,
            zIndex: 1000,
            transition: theme.transitions.create("all"),
          }}
        >
          <ZoomControls
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </Box>
      )}
    </Box>
  );
};

export default MultiboxTester;
