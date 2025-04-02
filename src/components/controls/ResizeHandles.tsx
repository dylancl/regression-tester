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

// Enhanced handle grabber style with outline and better visibility 
const handleGrabberStyle = {
  width: 10, // Slightly larger
  height: 10, // Slightly larger
  borderRadius: '50%',
  backgroundColor: 'currentColor',
  transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
  // Add a subtle outline to improve visibility against all backgrounds
  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.2)',
  // Enhance hover effect
  '&:hover': {
    transform: 'scale(1.5)',
    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)',
  },
};

interface ResizeHandlesProps {
  frameId: string;
  onResize: (e: React.MouseEvent, frameId: string, direction: string) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ frameId, onResize }) => {
  const theme = useTheme();
  // Use a more prominent color for handles to improve visibility
  const handleColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.7)' 
    : 'rgba(0, 0, 0, 0.5)';
  
  // Common styles for all handles
  const commonStyles = {
    color: handleColor,
    // Add a subtle background to make the clickable area more apparent
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      zIndex: -1,
    },
    '&:hover': {
      color: theme.palette.primary.main,
      '&::before': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      }
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