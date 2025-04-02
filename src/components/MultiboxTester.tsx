import { 
  Box, 
  Snackbar, 
  Alert,
  Fab,
  useMediaQuery,
  MenuItem,
  Menu,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  Add, 
  Fullscreen,
  FullscreenExit,
  AspectRatio,
  Search,
  GridOn,
  GridOff
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
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
  
  // Get multibox tester functionality from hook
  const {
    frames,
    notification,
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
  } = useMultiboxTester();

  // Get frame layout functionality from hook  
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
    toggleConfigPanel,
    setActiveFrameId,
    snapToGrid,
    setSnapToGrid
  } = useFrameLayout({
    frames,
    onUpdateFramePosition: updateFramePosition,
    onMarkFrameAsCustomSized: markFrameAsCustomSized,
  });

  // Get zoom controls functionality from hook
  const {
    zoomLevel,
    showZoomControls,
    handleZoomChange,
    handleZoomIn,
    handleZoomOut,
    toggleZoomControls
  } = useZoomControls();

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, frameId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveFrameId(frameId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveFrameId(null);
  };

  // Toggle grid display
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Toggle snap to grid
  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
    showNotification(snapToGrid ? 'Snap to grid disabled' : 'Snap to grid enabled');
  };

  // Create a callback ref function that correctly sets the frameRefs
  const setFrameRef = useCallback((id: string) => (node: HTMLDivElement | null) => {
    frameRefs.current[id] = node;
  }, [frameRefs]);

  // Grid size in pixels (must match the GRID_SIZE constant in useFrameLayout.ts)
  const gridSize = 20;

  // Calculate grid pattern size adjusted by zoom level
  const adjustedGridSize = gridSize * (100 / zoomLevel);

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      p: 2,
      backgroundColor: theme.palette.background.default
    }}>
      {/* Draggable and resizable frames container - Apply zoom to the entire container */}
      <Box 
        ref={framesContainerRef}
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          position: 'relative',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease',
          padding: zoomLevel < 100 ? `${(100 - zoomLevel) / 2}px` : 0, // Add padding when zoomed out
          minWidth: `${10000 / zoomLevel}%`, // Ensures content doesn't shrink when zooming out
          height: zoomLevel < 100 ? `${(10000 / zoomLevel) * 0.01}%` : 'auto',
          // Grid background
          backgroundSize: showGrid ? `${adjustedGridSize}px ${adjustedGridSize}px` : 'initial',
          backgroundImage: showGrid ? 
            `linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
             linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)` : 
            'none',
          backgroundPosition: '0 0',
        }}
      >
        {frames.map((frame) => {
          // Get layout with position fallback logic
          const layout = frameLayouts[frame.id] || { width: 400, height: 400, maxHeight: false };
          const position = layout.position || frame.position || { x: 0, y: 0 };
          
          return (
            <Box
              key={frame.id}
              ref={setFrameRef(frame.id)}
              sx={{
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
              }}
            >
              <Frame 
                frame={frame}
                layout={layout}
                isActive={activeFrameId === frame.id}
                isDragging={draggedFrameId === frame.id}
                isResizing={resizingFrameId === frame.id}
                isDraggedOver={dragOverFrameId === frame.id}
                isConfigExpanded={expandedConfigFrames.has(frame.id)}
                onMove={handleFrameMoveStart}
                onResize={handleMultiDirectionResize}
                onRemove={removeFrame}
                onCopyUrl={copyUrlToClipboard}
                onMenuOpen={handleMenuOpen}
                onToggleConfig={toggleConfigPanel}
                onIframeLoad={handleIframeLoad}
                onOptionChange={handleOptionChange}
                onChangeCountry={changeCountry}
                onShowNotification={showNotification}
                frameRef={null as unknown as React.RefObject<HTMLDivElement>} // Passing null ref as we're using Box ref
              />
            </Box>
          );
        })}
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
        <MenuItem onClick={() => 
          activeFrameId && resetFrameSize(activeFrameId, isMobile ? (window.innerWidth - 40) : 400)
        }>
          <AspectRatio fontSize="small" sx={{ mr: 1 }} />
          Reset Size
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeFrameId) {
            resetFrameSize(activeFrameId, isMobile ? (window.innerWidth - 40) : 400);
            resetFrameCustomSize(activeFrameId);
          }
          handleMenuClose();
        }}>
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

      {/* Floating action buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          gap: 2,
        }}
      >
        {/* Add frame button */}
        <Tooltip title="Add frame">
          <Fab
            color="primary"
            size="small"
            onClick={addNewFrame}
            sx={{ zIndex: 1000 }}
          >
            <Add />
          </Fab>
        </Tooltip>
        
        {/* Grid toggle button */}
        <Tooltip title={showGrid ? "Hide grid" : "Show grid"}>
          <Fab
            color={showGrid ? "primary" : "default"}
            size="small"
            onClick={toggleGrid}
            sx={{ zIndex: 1000 }}
          >
            {showGrid ? <GridOn /> : <GridOff />}
          </Fab>
        </Tooltip>
        
        {/* Snap to grid toggle button */}
        <Tooltip title={snapToGrid ? "Disable snap to grid" : "Enable snap to grid"}>
          <Fab
            color={snapToGrid ? "primary" : "default"}
            size="small"
            onClick={toggleSnapToGrid}
            sx={{ zIndex: 1000 }}
          >
            <GridOn />
          </Fab>
        </Tooltip>
        
        {/* Zoom button */}
        <Tooltip title="Zoom controls">
          <Fab
            color="primary"
            size="small"
            onClick={toggleZoomControls}
            sx={{ zIndex: 1000 }}
          >
            <Search />
          </Fab>
        </Tooltip>
      </Box>

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

export default MultiboxTester;