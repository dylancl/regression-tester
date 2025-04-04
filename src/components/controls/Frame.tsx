import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  ButtonGroup,
  Chip,
  alpha,
} from '@mui/material';
import {
  ContentCopy,
  Close,
  OpenWith,
  Sync,
  SyncDisabled,
  SettingsInputComponent,
  Refresh,
  Settings,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { FrameConfig } from '../../hooks/useMultiboxTester';
import { FrameLayout } from '../../hooks/useFrameLayout';
import { countryLanguageCodes } from '../../utils';
import { ResizeHandles } from './ResizeHandles';
import FloatingConfigMenu from './FloatingConfigMenu';
import SyncOptionsMenu from './SyncOptionsMenu';
import LoadingIndicator from './LoadingIndicator';
import FrameTitle from './FrameTitle';

interface FrameProps {
  onRemove: (frameId: string) => void;
  onCopyUrl: (url: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, frameId: string) => void;
  onToggleSync: (frameId: string) => void;
  onIframeLoad: (frameId: string) => void;
  onOptionChange: (frameId: string, name: string, value: string) => void;
  onChangeCountry: (frameId: string, code: string) => void;
  onShowNotification: (message: string) => void;
  onUpdateSyncOption: (frameId: string, optionName: string, enabled: boolean) => void;
  onReload: (frameId: string) => void;
  frameRef: React.RefObject<HTMLDivElement>;
  frame: FrameConfig;
  layout: FrameLayout;
  isActive?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  isDraggedOver?: boolean;
  isConfigExpanded?: boolean;
  globalSyncEnabled: boolean;
  onMove: (e: React.MouseEvent<HTMLElement>, frameId: string) => void;
  onResize: (e: React.MouseEvent<Element>, frameId: string, direction: string) => void;
}

export const Frame = memo<FrameProps>(({
  frame,
  layout,
  isActive,
  isDragging,
  isResizing,
  isDraggedOver,
  globalSyncEnabled,
  onMove,
  onResize,
  onRemove,
  onCopyUrl,
  onMenuOpen,
  onToggleSync,
  onIframeLoad,
  onOptionChange,
  onChangeCountry,
  onShowNotification,
  onUpdateSyncOption,
  onReload,
}) => {
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [syncOptionsOpen, setSyncOptionsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showExpandedControls, setShowExpandedControls] = useState(false);

  // Remove isLargeFrame condition to ensure controls are always hidden by default
  
  // Show expanded controls only when hovering or active, with better timing
  useEffect(() => {
    let timer: number | null = null;
    
    if (isHovered && !isDragging && !isResizing) {
      timer = window.setTimeout(() => setShowExpandedControls(true), 150);
    } else {
      // Add a small delay before hiding to prevent flickering on mouse movements
      timer = window.setTimeout(() => setShowExpandedControls(false), 100);
    }
    
    return () => {
      if (timer !== null) clearTimeout(timer);
    };
  }, [isHovered, isDragging, isResizing, isActive]);

  // Handle animation states
  const handleAnimationComplete = () => {};
  const handleAnimationStart = () => {};

  // Handlers for sync options menu
  const handleOpenSyncOptions = () => setSyncOptionsOpen(true);
  const handleCloseSyncOptions = () => setSyncOptionsOpen(false);

  // Get country name for display
  const countryName = countryLanguageCodes[frame.countryLanguageCode]?.pretty || 'Frame';

  // Compute frame dynamic classes based on state
  const frameStateClass = useMemo(() => {
    if (isDragging) return 'frame-dragging';
    if (isResizing) return 'frame-resizing';
    if (isDraggedOver) return 'frame-drag-over';
    if (isActive) return 'frame-active';
    return '';
  }, [isDragging, isResizing, isDraggedOver, isActive]);

  // Memoize complex styles to prevent recalculations
  const cardStyle = useMemo(() => ({
    height: layout.height || 400,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: (isResizing || isDragging)
      ? 'none'
      : theme.transitions.create(['box-shadow', 'transform'], {
        duration: 200,
      }),
    transform: isDraggedOver ? 'scale(1.01)' : 'scale(1)',
    position: 'relative',
    boxShadow: isActive
      ? theme.shadows[12]
      : isHovered
        ? theme.shadows[6]
        : theme.shadows[3],
    border: `1px solid ${isActive
      ? theme.palette.primary.main
      : isDraggedOver
        ? alpha(theme.palette.primary.main, 0.5)
        : theme.palette.divider}`,
    '&:hover': {
      boxShadow: theme.shadows[8]
    },
    // Add a subtle background pattern for better visual distinction
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
      pointerEvents: 'none',
      backgroundImage: `radial-gradient(${theme.palette.primary.light} 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
      zIndex: 0,
    },
    backgroundColor: theme.palette.background.paper,
  }), [layout.height, isResizing, isDragging, isActive, isHovered, isDraggedOver, theme]);

  // Header styles with more intuitive grab handle design
  const headerStyle = useMemo(() => ({
    p: 1,
    bgcolor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.7)
      : alpha(theme.palette.background.paper, 0.85),
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '48px',
    position: 'relative',
    zIndex: 10,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.default, 0.8)
        : alpha(theme.palette.background.paper, 0.95),
    },
  }), [theme]);

  // Header drag handle visual improvements
  const dragHandleStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    cursor: 'move',
    borderRadius: '4px',
    py: 0.5,
    pl: 0.5,
    pr: 1,
    transition: 'background-color 0.2s ease',
    '.MuiSvgIcon-root': {
      transition: 'transform 0.2s ease',
    },
    '&:hover .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    }
  }), []);

  // Frame size indicator/badge
  const sizeIndicator = useMemo(() => (
    <Chip
      size="small"
      variant="outlined"
      label={`${Math.round(layout.width) || 400}×${Math.round(layout.height) || 400}`}
      sx={{
        height: '22px',
        fontSize: '0.7rem',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontWeight: 'medium',
        bgcolor: alpha(theme.palette.background.default, 0.7),
        backdropFilter: 'blur(4px)',
        borderColor: theme.palette.divider,
        color: theme.palette.text.secondary,
        ml: 1,
        '& .MuiChip-label': {
          px: 0.75,
        }
      }}
    />
  ), [layout.width, layout.height, theme]);

  // Determine which buttons to show based on available width
  const getVisibleControls = useMemo(() => {
    const width = layout.width || 400;
    const controls = [];
    
    if (width >= 220) controls.push('reload');
    if (width >= 280) controls.push('sync');
    if (width >= 350) controls.push('copy');
    if (width >= 420) controls.push('syncOptions');
    
    return controls;
  }, [layout.width]);

  const shouldShowExpandedControls = useMemo(() => {
    return showExpandedControls || isActive;
  }, [showExpandedControls, isActive]);

  return (
    <Card
      elevation={0}
      sx={cardStyle}
      className={`frame ${frameStateClass}`}
      onMouseEnter={() => !isDragging && !isResizing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with improved grab handle and controls */}
      <Box sx={headerStyle}>
        <Box
          className="frame-drag-handle"
          sx={dragHandleStyle}
          onMouseDown={(e) => onMove(e, frame.id)}
        >
          <Tooltip title="Drag to move frame">
            <OpenWith
              fontSize="small"
              sx={{
                mr: 1,
                color: theme.palette.primary.main,
                opacity: 0.7,
              }}
            />
          </Tooltip>

          <FrameTitle
            selectedOptions={frame.selectedOptions}
            countryLanguageCode={frame.countryLanguageCode}
            maxWidth={layout.width ? Math.max(60, layout.width - 260) : 120}
          />

          {layout.width > 280 && sizeIndicator}
        </Box>

        {/* Responsive control buttons */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            ml: 'auto',
            '& .MuiButtonBase-root': {
              color: theme.palette.text.secondary,
            },
            minWidth: '72px', // Reserve space to prevent layout shifts
            justifyContent: 'flex-end',
          }}
        >
          <AnimatePresence initial={false} onExitComplete={handleAnimationComplete}>
            {shouldShowExpandedControls && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: 1, 
                  width: 'auto',
                  transition: { 
                    duration: 0.2, 
                    ease: 'easeOut' 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  width: 0,
                  transition: { 
                    duration: 0.15, 
                    ease: 'easeIn' 
                  }
                }}
                onAnimationStart={handleAnimationStart}
                onAnimationComplete={handleAnimationComplete}
                style={{
                  display: 'flex',
                  overflow: 'hidden',
                }}
              >
                <ButtonGroup
                  variant="text"
                  size="small"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderColor: isActive ? theme.palette.primary.main : theme.palette.divider,
                    boxShadow: theme.shadows[2],
                    borderRadius: '4px',
                    mr: 0.5,
                    '& .MuiButtonGroup-grouped': {
                      minWidth: 'auto',
                      px: 0.5,
                    }
                  }}
                >
                  {getVisibleControls.includes('reload') && (
                    <Tooltip title="Reload frame" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => onReload(frame.id)}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {getVisibleControls.includes('copy') && (
                    <Tooltip title="Copy URL" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => onCopyUrl(frame.generatedUrl)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {getVisibleControls.includes('sync') && (
                    <Tooltip title={frame.syncEnabled ? "Disable config sync" : "Enable config sync"} placement="top">
                      <IconButton
                        size="small"
                        onClick={() => onToggleSync(frame.id)}
                        color={(frame.syncEnabled || globalSyncEnabled) ? "primary" : "default"}
                        disabled={globalSyncEnabled}
                      >
                        {frame.syncEnabled ? <Sync fontSize="small" /> : <SyncDisabled fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}

                  {getVisibleControls.includes('syncOptions') && (
                    <Tooltip title="Sync configuration options" placement="top">
                      <IconButton
                        size="small"
                        onClick={handleOpenSyncOptions}
                        color={(frame.syncEnabled || globalSyncEnabled) ? "primary" : "default"}
                        disabled={globalSyncEnabled}
                      >
                        <SettingsInputComponent fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ButtonGroup>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always show settings button */}
          <Tooltip title="Configure" placement="top">
            <IconButton
              size="small"
              onClick={(e) => onMenuOpen(e, frame.id)}
              sx={{
                bgcolor: alpha(theme.palette.background.default, 0.5),
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                }
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Always show remove button */}
          <Tooltip title="Remove frame" placement="top">
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(frame.id)}
              sx={{
                bgcolor: alpha(theme.palette.error.light, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.light, 0.2),
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Frame content with enhanced loading indicator */}
      <Box sx={{
        flex: 1,
        position: 'relative',
        minHeight: '360px',
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#fafafa',
      }}>
        {/* Loading indicator */}
        <AnimatePresence>
          {frame.iframeLoading && (
            <LoadingIndicator message={`Loading ${countryName}...`} />
          )}
        </AnimatePresence>

        <iframe
          ref={iframeRef}
          src={frame.generatedUrl}
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
          }}
          onLoad={() => onIframeLoad(frame.id)}
          title={`Frame ${frame.id}`}
        />

        {/* Floating configuration menu */}
        <FloatingConfigMenu
          frame={frame}
          onChangeCountry={onChangeCountry}
          onOptionChange={onOptionChange}
          onShowNotification={onShowNotification}
        />
      </Box>

      {/* Resize handles */}
      <ResizeHandles frameId={frame.id} onResize={onResize} />

      {/* Sync options menu */}
      <SyncOptionsMenu
        open={syncOptionsOpen}
        onClose={handleCloseSyncOptions}
        frame={frame}
        onUpdateSyncOption={onUpdateSyncOption}
      />
    </Card>
  );
});

Frame.displayName = 'Frame';
