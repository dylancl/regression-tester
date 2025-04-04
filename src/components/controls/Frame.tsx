import React, { memo, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  Divider,
  ButtonGroup,
} from '@mui/material';
import {
  ContentCopy,
  MoreVert,
  Close,
  OpenWith,
  Sync,
  SyncDisabled,
  SettingsInputComponent,
  Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { FrameConfig } from '../../hooks/useMultiboxTester';
import { FrameLayout } from '../../hooks/useFrameLayout';
import { countryLanguageCodes } from '../../utils';
import { ResizeHandles } from './ResizeHandles';
import FloatingConfigMenu from './FloatingConfigMenu';
import SyncOptionsMenu from './SyncOptionsMenu';

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
  onReload: (frameId: string) => void; // New prop for reload functionality
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
  isDragging,
  isResizing,
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
  const [syncOptionsOpen, setSyncOptionsOpen] = useState(false);

  // Handlers for sync options menu
  const handleOpenSyncOptions = () => setSyncOptionsOpen(true);
  const handleCloseSyncOptions = () => setSyncOptionsOpen(false);

  // Memoize complex styles to prevent recalculations
  const cardStyle = useMemo(() => ({
    height: layout.height || 400,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    overflow: 'hidden',
    transition: (isResizing || isDragging)
      ? 'none'
      : theme.transitions.create(['box-shadow']),
    '&:hover': {
      boxShadow: theme.shadows[6]
    },
    position: 'relative',
  }), [layout.height, isResizing, isDragging, theme]);

  const headerStyle = useMemo(() => ({
    p: 0.75,  // More consistent padding all around
    bgcolor: theme.palette.mode === 'dark'
      ? 'rgba(66, 66, 66, 0.2)'
      : 'rgba(248, 248, 248, 0.8)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'move',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '48px',  // Ensure consistent height
    '& .MuiCardHeader-content': {
      overflow: 'hidden',
    },
    '& .MuiCardHeader-action': {
      margin: 0,  // Remove default margin that causes vertical alignment issues
    }
  }), [theme]);

  // Helper to determine which buttons to show based on available width
  const getVisibleControls = (width: number) => {
    // Always show remove button
    if (width < 200) return ['remove'];
    if (width < 280) return ['remove', 'reload'];
    if (width < 350) return ['remove', 'reload', 'sync'];
    if (width < 420) return ['remove', 'reload', 'sync', 'copy'];
    return ['remove', 'reload', 'sync', 'copy', 'syncOptions', 'menu'];
  };

  const visibleControls = getVisibleControls(layout.width || 400);

  return (
    <Card
      elevation={3}
      sx={cardStyle}
    >
      <CardHeader
        title={
          <Box
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%'
            }}
            className="frame-drag-handle"
            onMouseDown={(e) => onMove(e, frame.id)}
          >
            <OpenWith
              fontSize="small"
              sx={{
                mr: 1,
                cursor: 'move',
                color: theme.palette.text.secondary
              }}
            />
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ 
                maxWidth: '120px', // Smaller to leave space for controls
                '@media (min-width: 600px)': {
                  maxWidth: '180px',
                },
                // Adjust the max width dynamically based on frame width
                ...(layout.width && {
                  maxWidth: Math.max(60, layout.width - 260),
                }),
              }}
            >
              {countryLanguageCodes[frame.countryLanguageCode]?.pretty || 'Frame'}
              ({frame.selectedOptions.component})
            </Typography>
          </Box>
        }
        action={
          <Stack 
            direction="row" 
            spacing={0.5} 
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ 
              flexWrap: 'nowrap', 
              alignItems: 'center',
              ml: 1,
              overflow: 'visible', // Allow tooltip to show outside container
            }}
          >
            {/* Frame size indicator - only show if wider than 280px */}
            {layout.width > 280 && (
              <Tooltip title="Current frame dimensions" placement="top">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    px: 0.75,
                    py: 0.25, // Reduced to match overall header height
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary,
                    border: `1px solid ${theme.palette.divider}`,
                    minWidth: '72px',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" fontFamily="monospace" fontWeight="medium">
                    {Math.round(layout.width) || 400}x{Math.round(layout.height) || 400}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            
            {/* Responsive button controls */}
            <ButtonGroup 
              variant="text" 
              size="small" 
              sx={{ 
                '& .MuiButtonGroup-grouped': {
                  minWidth: 'auto',
                  px: 0.5, // Tighter horizontal padding
                }
              }}
            >
              {visibleControls.includes('reload') && (
                <Tooltip title="Reload frame" placement="top">
                  <IconButton 
                    size="small"
                    onClick={() => onReload(frame.id)}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {visibleControls.includes('copy') && (
                <Tooltip title="Copy URL" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => onCopyUrl(frame.generatedUrl)}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {visibleControls.includes('sync') && (
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
              
              {visibleControls.includes('syncOptions') && (
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
              
              {visibleControls.includes('menu') && (
                <Tooltip title="Frame options" placement="top">
                  <IconButton
                    size="small"
                    onClick={(e) => onMenuOpen(e, frame.id)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Always show remove button */}
              <Tooltip title="Remove frame" placement="top">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemove(frame.id)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Stack>
        }
        sx={headerStyle}
      />
      
      <Box sx={{
        flex: 1,
        position: 'relative',
        minHeight: '360px',
        overflow: 'hidden'
      }}>
        {/* Loading indicator */}
        {frame.iframeLoading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.7)'
              : 'rgba(255, 255, 255, 0.7)',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CircularProgress color="primary" />
            </motion.div>
          </Box>
        )}

        <iframe
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
