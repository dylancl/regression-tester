import React, { memo, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  Typography, 
  IconButton, 
  Tooltip, 
  Stack,
  useTheme,
} from '@mui/material';
import { 
  ContentCopy, 
  MoreVert, 
  Close, 
  OpenWith,
  Sync,
  SyncDisabled
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { FrameConfig } from '../../hooks/useMultiboxTester';
import { FrameLayout } from '../../hooks/useFrameLayout';
import { countryLanguageCodes } from '../../utils';
import { ResizeHandles } from './ResizeHandles';
import FloatingConfigMenu from './FloatingConfigMenu';

interface FrameProps {
  onRemove: (frameId: string) => void;
  onCopyUrl: (url: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, frameId: string) => void;
  onToggleSync: (frameId: string) => void;
  onIframeLoad: (frameId: string) => void;
  onOptionChange: (frameId: string, name: string, value: string) => void;
  onChangeCountry: (frameId: string, code: string) => void;
  onShowNotification: (message: string) => void;
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
}) => {
  const theme = useTheme();

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
    p: 1.5,
    bgcolor: theme.palette.mode === 'dark' 
      ? 'rgba(66, 66, 66, 0.2)' 
      : 'rgba(248, 248, 248, 0.8)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'move'
  }), [theme]);

  return (
    <Card 
      elevation={3} 
      sx={cardStyle}
    >
      <CardHeader
        title={
          <Box 
            sx={{ display: 'flex', alignItems: 'center' }}
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
            <Typography variant="subtitle1">
              {countryLanguageCodes[frame.countryLanguageCode]?.pretty || 'Frame'} 
              ({frame.selectedOptions.component})
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title={frame.syncEnabled ? "Disable config sync" : "Enable config sync"}>
              <IconButton 
                size="small" 
                onClick={() => onToggleSync(frame.id)}
                color={(frame.syncEnabled || globalSyncEnabled) ? "primary" : "default"}
                disabled={globalSyncEnabled}
              >
                {frame.syncEnabled ? <Sync fontSize="small" /> : <SyncDisabled fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy URL">
              <IconButton 
                size="small" 
                onClick={() => onCopyUrl(frame.generatedUrl)}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Frame options">
              <IconButton
                size="small"
                onClick={(e) => onMenuOpen(e, frame.id)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove frame">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => onRemove(frame.id)}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={headerStyle}
      />
      
      {/* Iframe container - Now takes up the full available space */}
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
        
        {/* The iframe with the component preview */}
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
    </Card>
  );
});

Frame.displayName = 'Frame';
