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
  Typography,
  Paper,
  Fade,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  ChevronRight,
  Add, 
  Fullscreen,
  FullscreenExit,
  AspectRatio,
  Search,
  GridOn,
  GridOff,
  SyncAlt,
  TuneOutlined,
  VerticalAlignCenter,
  OpenWith,
  Keyboard,
  ViewCompact
} from '@mui/icons-material';
import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { useMultiboxTester } from '../hooks/useMultiboxTester';
import { useFrameLayout } from '../hooks/useFrameLayout';
import { useZoomControls } from '../hooks/useZoomControls';
import { usePanningControls } from '../hooks/usePanningControls';
import { Frame } from './controls/Frame';
import { ZoomControls } from './controls/ZoomControls';
import { DeviceSizeMenu } from './controls/DeviceSizeMenu';

const MultiboxTester = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<null | HTMLElement>(null);
  
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
    toggleZoomControls,
  } = useZoomControls({
    containerRef: containerParentRef
  });
  
  const {
    isPanning,
    isPanningEnabled,
    startPanning,
    stopPanning,
    togglePanningMode
  } = usePanningControls({
    parentRef: containerParentRef
  });

  // Handle Escape key to close keyboard shortcuts panel
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
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

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPanning, stopPanning]);

  // Memoize handlers to prevent unnecessary rerenders
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, frameId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveFrameId(frameId);
  }, [setActiveFrameId]);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setActiveFrameId(null);
  }, [setActiveFrameId]);

  const handleSizeMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSizeMenuAnchorEl(event.currentTarget);
  }, []);

  const handleSizeMenuClose = useCallback(() => {
    setSizeMenuAnchorEl(null);
  }, []);

  const handleSizeSelect = useCallback((width: number, height: number) => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, width, height);
    }
  }, [activeFrameId, resetFrameSize]);

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const toggleSnapToGridHandler = useCallback(() => {
    setSnapToGrid(!snapToGrid);
    showNotification(snapToGrid ? 'Snap to grid disabled' : 'Snap to grid enabled');
  }, [snapToGrid, setSnapToGrid, showNotification]);

  // Toggle keyboard shortcuts info
  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(prev => !prev);
  }, []);

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

  const handleResetFrameSize = useCallback(() => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, isMobile ? (window.innerWidth - 40) : 400);
    }
  }, [activeFrameId, resetFrameSize, isMobile]);

  const handleResetAll = useCallback(() => {
    if (activeFrameId) {
      resetFrameSize(activeFrameId, isMobile ? (window.innerWidth - 40) : 400);
      resetFrameCustomSize(activeFrameId);
    }
    handleMenuClose();
  }, [activeFrameId, resetFrameSize, resetFrameCustomSize, handleMenuClose, isMobile]);

  // Add a function to sync all frame sizes to the active frame's size
  const syncAllFrameSizes = useCallback(() => {
    if (!frames.length) return;
    
    // Get reference width - either from active frame or first frame
    const referenceWidth = activeFrameId && frameLayouts[activeFrameId]?.width 
      ? frameLayouts[activeFrameId].width 
      : frameLayouts[frames[0].id]?.width || 400;

    // Get reference height - either from active frame or first frame
    const referenceHeight = activeFrameId && frameLayouts[activeFrameId]?.height 
      ? frameLayouts[activeFrameId].height 
      : frameLayouts[frames[0].id]?.height || 400;
    
    // Apply this width to all frames
    frames.forEach(frame => {
      if (frame.id !== activeFrameId) {
        resetFrameSize(frame.id, referenceWidth, referenceHeight);
      }
    });
    
    showNotification(`All frames synced to ${referenceWidth}px width and ${referenceHeight}px height`);
  }, [frames, activeFrameId, frameLayouts, resetFrameSize, showNotification]);

  // Memoize each Frame component to prevent unnecessary re-renders
  const frameComponents = useMemo(() => frames.map((frame) => {
    // Get layout with position fallback logic
    const layout = frameLayouts[frame.id] || { width: 400, height: 400, maxHeight: false };
    const position = layout.position || frame.position || { x: 0, y: 0 };
    
    // Only calculate styles that depend on the frame's state
    const frameStyle = {
      width: layout.width || 400,
      height: layout.height || "auto",
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
          onUpdateSyncOption={updateFrameSyncOptions}
          onReload={refreshFrame}
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
        bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#ffffff',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5',
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
        bgcolor: globalSyncEnabled 
          ? (theme.palette.mode === 'dark' ? '#2c5282' : '#e3f2fd') 
          : (theme.palette.mode === 'dark' ? '#333333' : '#ffffff'),
        color: globalSyncEnabled ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: globalSyncEnabled 
            ? (theme.palette.mode === 'dark' ? '#3b6eb4' : '#bbdefb')
            : (theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5'),
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
        bgcolor: showGrid 
          ? (theme.palette.mode === 'dark' ? '#2c5282' : '#e3f2fd') 
          : (theme.palette.mode === 'dark' ? '#333333' : '#ffffff'),
        color: showGrid ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: showGrid 
            ? (theme.palette.mode === 'dark' ? '#3b6eb4' : '#bbdefb')
            : (theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5'),
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
        bgcolor: snapToGrid 
          ? (theme.palette.mode === 'dark' ? '#2c5282' : '#e3f2fd') 
          : (theme.palette.mode === 'dark' ? '#333333' : '#ffffff'),
        color: snapToGrid ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: snapToGrid 
            ? (theme.palette.mode === 'dark' ? '#3b6eb4' : '#bbdefb')
            : (theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5'),
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
        bgcolor: showZoomControls 
          ? (theme.palette.mode === 'dark' ? '#2c5282' : '#e3f2fd') 
          : (theme.palette.mode === 'dark' ? '#333333' : '#ffffff'),
        color: showZoomControls ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: showZoomControls 
            ? (theme.palette.mode === 'dark' ? '#3b6eb4' : '#bbdefb')
            : (theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5'),
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />
  ], [
    theme, showGrid, snapToGrid, globalSyncEnabled, showZoomControls,
    toggleGrid, toggleSnapToGridHandler, toggleGlobalSync, toggleZoomControls, addNewFrame
  ]);

  // Add the panning toggle action to the SpeedDial actions
  const panningToggleSpeedDialAction = useMemo(() => (
    <SpeedDialAction
      key="toggle-panning"
      icon={<OpenWith />}
      tooltipTitle={isPanningEnabled ? "Disable panning mode" : "Enable panning mode"}
      tooltipPlacement="left"
      onClick={togglePanningMode}
      sx={{
        bgcolor: isPanningEnabled 
          ? (theme.palette.mode === 'dark' ? '#2c5282' : '#e3f2fd') 
          : (theme.palette.mode === 'dark' ? '#333333' : '#ffffff'),
        color: isPanningEnabled ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: isPanningEnabled 
            ? (theme.palette.mode === 'dark' ? '#3b6eb4' : '#bbdefb')
            : (theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5'),
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />
  ), [theme, isPanningEnabled, togglePanningMode]);

  // Add SpeedDial actions related to panning
  const panningSpeedDialAction = useMemo(() => (
    <SpeedDialAction
      key="toggle-keyboard-shortcuts"
      icon={<Keyboard />}
      tooltipTitle="Keyboard shortcuts"
      tooltipPlacement="left"
      onClick={toggleKeyboardShortcuts}
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#ffffff',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5',
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />
  ), [theme, toggleKeyboardShortcuts]);

  // Add the sync sizes action to the SpeedDial actions
  const syncSizesSpeedDialAction = useMemo(() => (
    <SpeedDialAction
      key="sync-frame-sizes"
      icon={<ViewCompact />}
      tooltipTitle="Sync all frame sizes"
      tooltipPlacement="left"
      onClick={syncAllFrameSizes}
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? '#333333' : '#ffffff',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? '#444444' : '#f5f5f5',
          transform: 'scale(1.05)',
        },
        boxShadow: theme.shadows[2],
      }}
    />
  ), [theme, syncAllFrameSizes]);

  // Update speedDialActions array to include the sync sizes action
  const updatedSpeedDialActions = useMemo(() => [
    ...speedDialActions,
    syncSizesSpeedDialAction,
    panningToggleSpeedDialAction,
    panningSpeedDialAction
  ], [speedDialActions, syncSizesSpeedDialAction, panningToggleSpeedDialAction, panningSpeedDialAction]);

  return (
    <Box 
      ref={containerParentRef}
      sx={{ 
        height: '100%',
        width: '100%',
        overflow: 'auto',
        p: 2,
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        cursor: isPanningEnabled ? (isPanning ? 'grabbing' : 'grab') : 'default',
      }}
      onMouseDown={(e) => {
        // Don't start panning if clicking on a UI element
        if (isPanningEnabled && (e.target === e.currentTarget || (e.target as HTMLElement).closest('.frames-container'))) {
          startPanning(e);
        }
      }}
    >
      {/* Panning indicator */}
      {isPanningEnabled && (
        <Fade in={true}>
          <Box
            sx={{
              position: 'fixed',
              bottom: showZoomControls ? 80 : 16,
              left: 16,
              zIndex: 1000,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(4px)',
              borderRadius: 2,
              padding: 1,
              display: 'flex',
              alignItems: 'center',
              boxShadow: theme.shadows[3],
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <OpenWith sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="body2">
              Press <b>Space + Drag</b> to pan
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Draggable and resizable frames container - Apply zoom to the entire container */}
      <Box 
        ref={framesContainerRef}
        className="frames-container"
        sx={framesContainerStyle}
      >
        {frameComponents}
      </Box>

      {/* Keyboard shortcuts info panel */}
      <Fade in={showKeyboardShortcuts}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto',
            minWidth: 300,
            maxWidth: 400,
            p: 3,
            zIndex: 1600,
            backdropFilter: 'blur(5px)',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(30, 30, 30, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            display: showKeyboardShortcuts ? 'block' : 'none',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Keyboard sx={{ mr: 1 }} /> Keyboard Shortcuts
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr',
            gap: 2,
            alignItems: 'center'
          }}>
            <Typography variant="body2" fontWeight="bold">Space + Drag</Typography>
            <Typography variant="body2">Pan around the canvas</Typography>
            
            <Typography variant="body2" fontWeight="bold">Ctrl + Scroll</Typography>
            <Typography variant="body2">Zoom in/out</Typography>
            
            <Typography variant="body2" fontWeight="bold">Esc</Typography>
            <Typography variant="body2">Close this panel</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={toggleKeyboardShortcuts}
            >
              Close
            </Typography>
          </Box>
        </Paper>
      </Fade>

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
        <MenuItem onClick={handleSizeMenuOpen}>
          <ListItemIcon>
            <AspectRatio fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Change Frame Size" 
            secondary={activeFrameId ? `Current: ${frameLayouts[activeFrameId]?.width || 400}px` : undefined}
          />
          <ChevronRight fontSize="small" />
        </MenuItem>
        <Divider />
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
        currentWidth={activeFrameId ? (frameLayouts[activeFrameId]?.width || 400) : 400}
        onClose={handleSizeMenuClose}
        onSelect={handleSizeSelect}
        onCloseParentMenu={handleMenuClose} // Add this to close the parent menu
      />

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
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1501,
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
        direction="up"
        openIcon={<TuneOutlined />}
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
        {updatedSpeedDialActions}
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