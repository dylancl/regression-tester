import React from 'react';
import { Paper, Typography, CircularProgress, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  /**
   * Text to display below the loading indicator
   */
  message?: string;
  
  /**
   * Animation duration in seconds
   */
  animationDuration?: number;
  
  /**
   * Size of the CircularProgress component
   */
  size?: number;
  
  /**
   * Whether to use a blurred background
   */
  useBlur?: boolean;
}

/**
 * A reusable loading indicator with animation and blurred background
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  animationDuration = 0.3,
  size = 40,
  useBlur = true,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animationDuration }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        backgroundColor: alpha(
          theme.palette.background.paper,
          theme.palette.mode === 'dark' ? 0.8 : 0.7
        ),
        backdropFilter: useBlur ? 'blur(4px)' : 'none',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          borderRadius: '12px',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <CircularProgress
          size={size}
          thickness={4}
          color="primary"
          sx={{ mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Paper>
    </motion.div>
  );
};

export default LoadingIndicator;