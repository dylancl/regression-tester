import { 
  Box, 
  Snackbar, 
  Alert,
  useMediaQuery,
  MenuItem,
  Menu,
  useTheme,
  SpeedDial,
  SpeedDialAction,
  alpha,
} from '@mui/material';
import { 
  Add, 
  Fullscreen,
  FullscreenExit,
  AspectRatio,
  Search,
  GridOn,
  GridOff,
  SyncAlt,
  TuneOutlined,
  VerticalAlignCenter
} from '@mui/icons-material';
import { useState, useCallback, useMemo, memo } from 'react';
import { useMultiboxTester } from '../hooks/useMultiboxTester';
import { useFrameLayout } from '../hooks/useFrameLayout';
import { useZoomControls } from '../hooks/useZoomControls';
import { Frame } from './controls/Frame';
import { ZoomControls } from './controls/ZoomControls';

const MultiboxTester = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  
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
    setSnapToGrid
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
    toggleZoomControls
  } = useZoomControls();

  // Memoize handlers to prevent unnecessary rerenders
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, frameId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveFrameId(frameId);
  }, [setActiveFrameId]);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setActiveFrameId(null);
  }, [setActiveFrameId]);

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const toggleSnapToGridHandler = useCallback(() => {
    setSnapToGrid(!snapToGrid);
    showNotification(snapToGrid ? 'Snap to grid disabled' : 'Snap to grid enabled');
  }, [snapToGrid, setSnapToGrid, showNotification]);

  // Create a callback ref function that correctly sets the frameRefs
  const setFrameRef = useCallback((id: string) => (node: HTMLDivElement | null) => {
    frameRefs.current[id] = node;
  }, [frameRefs]);

  // Calculate grid pattern size adjusted by zoom level
  const gridSize = 20;
  const adjustedGridSize = useMemo(() => gridSize * (100 / zoomLevel), [gridSize, zoomLevel]);

  // Memoize grid background style to avoid recalculation on each render
  const gridBackgroundStyle = useMemo(() => ({
    backgroundSize: showGrid ? `${adjustedGridSize}px ${adjustedGridSize}px` : 'initial',
    backgroundImage: showGrid ? 
      `linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
       linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)` : 
      'none',
    '&::after': showGrid ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      background: `radial-gradient(
        circle at center,
        transparent 30%,
        ${theme.palette.background.default} 100%
      )`,
      zIndex: 0
    } : {}
  }), [showGrid, adjustedGridSize, theme.palette.divider, theme.palette.background.default]);

  // Memoize container style to prevent recalculation on each render
  const framesContainerStyle = useMemo(() => ({
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: 2,
    position: 'relative',
    transform: `scale(${zoomLevel / 100})`,
    transformOrigin: 'top left',
    transition: 'transform 0.2s ease',
    padding: zoomLevel < 100 ? `${(100 - zoomLevel) / 2}px` : 0,
    minWidth: `${10000 / zoomLevel}%`,
    height: zoomLevel < 100 ? `${(10000 / zoomLevel) * 0.01}%` : 'auto',
    ...gridBackgroundStyle
  }), [zoomLevel, gridBackgroundStyle]);

  // Menu items for frame options - memoized to avoid recreating on each render
  const menuItemMaximizeHeight = useMemo(() => (
    <MenuItem onClick={() => activeFrameId && toggleMaximizeHeight(activeFrameId)}>
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
  ), [activeFrameId, frameLayouts, toggleMaximizeHeight]);

  // Handler for resetting frame size - memoized to avoid recreating function on each render
  const handleResetFrameSize = useCallback(() => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, isMobile ? (window.innerWidth - 40) : 400);
    }
  }, [activeFrameId, resetFrameSize, isMobile]);

  // Handler for resetting all frame properties - memoized to avoid recreating function on each render
  const handleResetAll = useCallback(() => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, isMobile ? (window.innerWidth - 40) : 400);
      resetFrameCustomSize(activeFrameId);
    }
    handleMenuClose();
  }, [activeFrameId, resetFrameSize, resetFrameCustomSize, handleMenuClose, isMobile]);

  // Memoize each Frame component to prevent unnecessary re-renders
  const frameComponents = useMemo(() => frames.map((frame) => {
    // Get layout with position fallback logic
    const layout = frameLayouts[frame.id] || { width: 400, height: 400, maxHeight: false };
    const position = layout.position || frame.position || { x: 0, y: 0 };
    
    // Only calculate styles that depend on the frame's state
    const frameStyle = {
      width: layout.width || 400,
      height: 'auto',
      position: 'absolute',
      left: position.x,
      top: position.y,
      // Only use transitions when not actively dragging/resizing
      transition: (draggedFrameId === frame.id || resizingFrameId === frame.id || draggingFrame) 
        ? 'none' 
        : 'all 0.2s ease',
      opacity: draggedFrameId === frame.id ? 0.6 : 1,
      transform: dragOverFrameId === frame.id ? 'scale(1.01)' : 'scale(1)',
      zIndex: activeFrameId === frame.id ? 1001 : (draggingFrame && draggedFrameId === frame.id) ? 1000 : 1,
      boxShadow: (resizingFrameId === frame.id || activeFrameId === frame.id) ? theme.shadows[8] : theme.shadows[2],
    };

    return (
      <Box
        key={frame.id}
        ref={setFrameRef(frame.id)}
        sx={frameStyle}
      >
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
        />
      </Box>
    );
  }), [
    frames, frameLayouts, draggedFrameId, resizingFrameId, draggingFrame, 
    activeFrameId, expandedConfigFrames, globalSyncEnabled, theme.shadows,
    handleFrameMoveStart, handleMultiDirectionResize, removeFrame, copyUrlToClipboard,
    handleMenuOpen, toggleFrameSync, handleIframeLoad, handleOptionChange,
    changeCountry, showNotification, setFrameRef, dragOverFrameId
  ]);

  // Memoize SpeedDial action components to prevent unnecessary re-renders
  const speedDialActions = useMemo(() => [
    <SpeedDialAction
      key="add-frame"
      icon={<Add />}
      tooltipTitle="Add new frame"
      tooltipPlacement="left"
      onClick={addNewFrame}
      sx={{
        bgcolor: theme.palette.background.paper,
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />,
    <SpeedDialAction
      key="toggle-sync"
      icon={<SyncAlt />}
      tooltipTitle={globalSyncEnabled ? "Disable global sync" : "Enable global sync"}
      tooltipPlacement="left"
      onClick={toggleGlobalSync}
      sx={{
        bgcolor: globalSyncEnabled ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
        color: globalSyncEnabled ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: globalSyncEnabled 
            ? alpha(theme.palette.primary.main, 0.2) 
            : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'),
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />,
    <SpeedDialAction
      key="toggle-grid"
      icon={showGrid ? <GridOn /> : <GridOff />}
      tooltipTitle={showGrid ? "Hide grid" : "Show grid"}
      tooltipPlacement="left"
      onClick={toggleGrid}
      sx={{
        bgcolor: showGrid ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
        color: showGrid ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: showGrid 
            ? alpha(theme.palette.primary.main, 0.2) 
            : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'),
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />,
    <SpeedDialAction
      key="toggle-snap"
      icon={<VerticalAlignCenter />}
      tooltipTitle={snapToGrid ? "Disable snap to grid" : "Enable snap to grid"}
      tooltipPlacement="left"
      onClick={toggleSnapToGridHandler}
      sx={{
        bgcolor: snapToGrid ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
        color: snapToGrid ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: snapToGrid 
            ? alpha(theme.palette.primary.main, 0.2) 
            : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'),
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />,
    <SpeedDialAction
      key="toggle-zoom"
      icon={<Search />}
      tooltipTitle="Zoom controls"
      tooltipPlacement="left"
      onClick={toggleZoomControls}
      sx={{
        bgcolor: showZoomControls ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
        color: showZoomControls ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: showZoomControls 
            ? alpha(theme.palette.primary.main, 0.2) 
            : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'),
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />
  ], [
    theme, showGrid, snapToGrid, globalSyncEnabled, showZoomControls,
    toggleGrid, toggleSnapToGridHandler, toggleGlobalSync, toggleZoomControls, addNewFrame
  ]);

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      p: 2,
      backgroundColor: theme.palette.background.default,
      position: 'relative'
    }}>
      {/* Draggable and resizable frames container - Apply zoom to the entire container */}
      <Box 
        ref={framesContainerRef}
        sx={framesContainerStyle}
      >
        {frameComponents}
      </Box>

      {/* Frame Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {menuItemMaximizeHeight}
        <MenuItem onClick={handleResetFrameSize}>
          <AspectRatio fontSize="small" sx={{ mr: 1 }} />
          Reset Size
        </MenuItem>
        <MenuItem onClick={handleResetAll}>
          <AspectRatio fontSize="small" sx={{ mr: 1 }} />
          Reset All
        </MenuItem>
      </Menu>

      {/* Notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          variant="filled"
          sx={{
            backgroundColor: theme.palette.primary.main,
          }}
        >
          {notification}
        </Alert>
      </Snackbar>

      {/* SpeedDial component for actions */}
      <SpeedDial
        ariaLabel="Action controls"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          '& .MuiFab-primary': {
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            transition: 'all 0.3s ease',
          },
          '& .MuiSpeedDial-actions': {
            gap: 0.5,
          }
        }}
        icon={<TuneOutlined />}
        FabProps={{
          sx: {
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'scale(1.05)',
            }
          }
        }}
      >
        {speedDialActions}
      </SpeedDial>

      {/* Zoom controls panel */}
      {showZoomControls && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 80,
            zIndex: 1000,
            transition: theme.transitions.create('all'),
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

export default memo(MultiboxTester);