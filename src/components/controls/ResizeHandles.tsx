import { Box, useTheme } from '@mui/material';
import React from 'react';

// Style constants for resize handles
const resizeHandleStyles = {
  position: 'absolute',
  width: 20,
  height: 20,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.2s ease',
};

// Style for handle grabber indicators
const handleGrabberStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: 'currentColor',
  transition: 'transform 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    transform: 'scale(1.5)',
  },
};

interface ResizeHandlesProps {
  frameId: string;
  onResize: (e: React.MouseEvent, frameId: string, direction: string) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ frameId, onResize }) => {
  const theme = useTheme();
  const handleColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.5)' 
    : 'rgba(0, 0, 0, 0.3)';
  
  // Common styles for all handles
  const commonStyles = {
    color: handleColor,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  };

  return (
    <>
      {/* Top-left corner */}
      <Box
        sx={{
          ...resizeHandleStyles,
          top: 0,
          left: 0,
          cursor: 'nwse-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'nw')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Top-right corner */}
      <Box
        sx={{
          ...resizeHandleStyles,
          top: 0,
          right: 0,
          cursor: 'nesw-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'ne')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Bottom-left corner */}
      <Box
        sx={{
          ...resizeHandleStyles,
          bottom: 0,
          left: 0,
          cursor: 'nesw-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'sw')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Bottom-right corner */}
      <Box
        sx={{
          ...resizeHandleStyles,
          bottom: 0,
          right: 0,
          cursor: 'nwse-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'se')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Right edge */}
      <Box
        sx={{
          ...resizeHandleStyles,
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          cursor: 'ew-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'e')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Left edge */}
      <Box
        sx={{
          ...resizeHandleStyles,
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          cursor: 'ew-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'w')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Top edge */}
      <Box
        sx={{
          ...resizeHandleStyles,
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'ns-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 'n')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
      
      {/* Bottom edge */}
      <Box
        sx={{
          ...resizeHandleStyles,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'ns-resize',
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, frameId, 's')}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
    </>
  );
};