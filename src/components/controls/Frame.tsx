import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  IconButton, 
  Tooltip, 
  Divider, 
  Stack,
  useTheme,
} from '@mui/material';
import { 
  Settings, 
  ContentCopy, 
  MoreVert, 
  Close, 
  OpenWith
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { FrameConfig } from '../../hooks/useMultiboxTester';
import { FrameLayout } from '../../hooks/useFrameLayout';
import { countryLanguageCodes } from '../../utils';
import { ResizeHandles } from './ResizeHandles';
import CountrySelector from './CountrySelector';
import ControlPanel from './ControlPanel';

interface FrameProps {
  frame: FrameConfig;
  layout: FrameLayout;
  isActive: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isDraggedOver: boolean;
  isConfigExpanded: boolean;
  onMove: (e: React.MouseEvent, frameId: string) => void;
  onResize: (e: React.MouseEvent, frameId: string, direction: string) => void;
  onRemove: (frameId: string) => void;
  onCopyUrl: (url: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, frameId: string) => void;
  onToggleConfig: (frameId: string) => void;
  onIframeLoad: (frameId: string) => void;
  onOptionChange: (frameId: string, name: string, value: string) => void;
  onChangeCountry: (frameId: string, code: string) => void;
  onShowNotification: (message: string) => void;
  frameRef: React.RefObject<HTMLDivElement>;
}

export const Frame: React.FC<FrameProps> = ({ 
  frame, 
  layout,
  isDragging,
  isResizing,
  isConfigExpanded,
  onMove,
  onResize,
  onRemove,
  onCopyUrl,
  onMenuOpen,
  onToggleConfig,
  onIframeLoad,
  onOptionChange,
  onChangeCountry,
  onShowNotification,
}) => {
  const theme = useTheme();

  return (
    <Card 
      elevation={3} 
      sx={{ 
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
      }}
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
            <Tooltip title="Toggle configuration">
              <IconButton 
                size="small" 
                onClick={() => onToggleConfig(frame.id)}
                color={isConfigExpanded ? "primary" : "default"}
              >
                <Settings fontSize="small" />
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
        sx={{ 
          p: 1.5,
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(66, 66, 66, 0.2)' 
            : 'rgba(248, 248, 248, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          cursor: 'move'
        }}
      />
      
      {/* Configuration panel - conditionally rendered */}
      {isConfigExpanded && (
        <CardContent sx={{ pb: 1, pt: 1.5, overflow: 'auto', flexShrink: 0 }}>
          <CountrySelector
            countryLanguageCode={frame.countryLanguageCode}
            goToNextCountry={() => {
              const countryKeys = Object.keys(countryLanguageCodes);
              const currentIndex = countryKeys.findIndex(k => k === frame.countryLanguageCode);
              if (currentIndex < countryKeys.length - 1) {
                onChangeCountry(frame.id, countryKeys[currentIndex + 1]);
              } else {
                onShowNotification("No more countries available");
              }
            }}
            goToPreviousCountry={() => {
              const countryKeys = Object.keys(countryLanguageCodes);
              const currentIndex = countryKeys.findIndex(k => k === frame.countryLanguageCode);
              if (currentIndex > 0) {
                onChangeCountry(frame.id, countryKeys[currentIndex - 1]);
              } else {
                onShowNotification("First country - can't go back");
              }
            }}
            changeCountry={(code) => onChangeCountry(frame.id, code)}
          />
          
          <Divider sx={{ my: 1.5 }} />
          
          <ControlPanel
            selectedOptions={frame.selectedOptions}
            handleOptionChange={(name, value) => onOptionChange(frame.id, name, value)}
            countryLanguageCode={frame.countryLanguageCode}
          />
        </CardContent>
      )}
      
      {/* Iframe container */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        minHeight: isConfigExpanded ? '200px' : '360px', // Taller when config is hidden
        mt: isConfigExpanded ? 1 : 0,
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
      </Box>
      
      {/* Resize handles */}
      <ResizeHandles frameId={frame.id} onResize={onResize} />
    </Card>
  );
};