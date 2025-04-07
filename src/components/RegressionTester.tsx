import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Tooltip,
  Divider,
  Stack,
} from '@mui/material';
import {
  ChevronLeft,
  ContentCopy,
  Menu,
  DarkMode,
  LightMode,
  Settings,
  OpenInNew
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegressionTester } from '../hooks/useRegressionTester';
import { countryLanguageCodes } from '../utils';
import ControlPanel from './controls/ControlPanel';
import CountrySelector from './controls/CountrySelector';
import LoadingIndicator from './controls/LoadingIndicator';
import FrameTitle from './controls/FrameTitle';
import TestInstructions, { TestProgressData } from './controls/TestInstructions';
import ProgressTracker from './controls/ProgressTracker';
import { useThemeContext } from '../contexts/ThemeContext';
import { useState, useCallback } from 'react';

const RegressionTester = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [testProgress, setTestProgress] = useState<TestProgressData>({
    total: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    notTested: 0,
    completion: 0
  });

  const {
    selectedOptions,
    countryLanguageCode,
    generatedUrl,
    notification,
    iframeLoading,
    sidebarOpen,
    handleOptionChange,
    goToNextCountry,
    goToPreviousCountry,
    changeCountry,
    copyUrlToClipboard,
    handleIframeLoad,
    toggleSidebar,
  } = useRegressionTester();

  const [urlHovered, setUrlHovered] = useState(false);

  // Memoize the progress update handler to prevent infinite re-renders
  const handleProgressUpdate = useCallback((progressData: TestProgressData) => {
    setTestProgress(progressData);
  }, []);

  // Calculate the drawer width based on screen size
  const drawerWidth = isMobile ? '100%' : 340;

  return (
    <Box sx={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden' // Prevent scrolling
    }}>
      {/* Sidebar drawer for controls */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: isMobile ? 'fixed' : 'relative',
            borderRight: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(66, 66, 66, 0.2)'
              : 'rgba(248, 248, 248, 0.8)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Settings color="primary" fontSize="small" />
            <Typography variant="subtitle1" color="primary" fontWeight="medium">
              Configuration
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton size="small" onClick={toggleTheme} sx={{ mr: 0.5 }}>
                {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={toggleSidebar}>
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{
          p: 2,
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* URL display section */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              transition: theme.transitions.create(['background-color', 'box-shadow']),
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Generated URL
              </Typography>
              <Tooltip title="Copy URL">
                <IconButton
                  onClick={copyUrlToClipboard}
                  color="primary"
                  size="small"
                  sx={{
                    transition: theme.transitions.create('transform'),
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Box
              onMouseEnter={() => setUrlHovered(true)}
              onMouseLeave={() => setUrlHovered(false)}
              sx={{
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden', // Prevent content from causing container to resize
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              <Box
                sx={{
                  height: urlHovered ? 'auto' : '40px', // Fixed height when not hovered
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : theme.palette.grey[100],
                  p: 1.5,
                  borderRadius: 1,
                  transition: theme.transitions.create(['background-color', 'height'], {
                    duration: '0.3s',
                    easing: theme.transitions.easing.easeInOut,
                  }),
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : theme.palette.grey[200]
                  }
                }}
              >
                {/* Always render both views, but hide one with opacity */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: urlHovered ? 0 : 1,
                    height: urlHovered ? 0 : '24px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '90%'
                    }}
                  >
                    {generatedUrl}
                  </Typography>
                  <OpenInNew fontSize="small" color="action" sx={{ opacity: 0.6, ml: 1 }} />
                </Box>

                {/* Expanded view - always in DOM but conditionally shown */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: urlHovered ? 1 : 0,
                    height: urlHovered ? 'auto' : 0
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeInOut"
                  }}
                  style={{
                    overflow: 'hidden',
                    transformOrigin: 'top'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      display: 'block',
                      width: '100%',
                      wordBreak: 'break-all',
                      pt: urlHovered ? 0.5 : 0
                    }}
                  >
                    {generatedUrl}
                  </Typography>
                </motion.div>
              </Box>
            </Box>
          </Paper>
          
          {/* Current frame info section */}
          {generatedUrl && (
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                transition: theme.transitions.create(['background-color', 'box-shadow']),
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Current Preview
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ py: 0.5 }}>
                <FrameTitle
                  selectedOptions={selectedOptions}
                  countryLanguageCode={countryLanguageCode}
                  maxWidth={280}
                  wrapText={true}
                />
              </Box>
            </Paper>
          )}

          {/* Country Selector first for better user flow */}
          <CountrySelector
            countryLanguageCode={countryLanguageCode}
            goToNextCountry={goToNextCountry}
            goToPreviousCountry={goToPreviousCountry}
            changeCountry={changeCountry}
          />

          {/* Control Panel for settings */}
          <ControlPanel
            selectedOptions={selectedOptions}
            handleOptionChange={handleOptionChange}
            countryLanguageCode={countryLanguageCode}
          />
        </Box>

        {/* Progress Tracker at bottom of sidebar */}
        {testProgress.total > 0 && (
          <ProgressTracker progressData={testProgress} />
        )}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && {
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        {/* Toolbar when sidebar is closed */}
        {!sidebarOpen && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            height: '48px',
            px: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(66, 66, 66, 0.2)'
              : 'rgba(248, 248, 248, 0.8)',
          }}>
            <IconButton onClick={toggleSidebar} size="small" sx={{ mr: 1 }}>
              <Menu fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              {countryLanguageCodes[countryLanguageCode]?.pretty || 'Unknown Country'}
            </Typography>
          </Box>
        )}

        {/* IFrame Container */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: sidebarOpen ? '100%' : 'calc(100% - 48px)', // Account for the top toolbar when sidebar is closed
            transition: theme.transitions.create(['width', 'height', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          {/* Loading indicator */}
          <AnimatePresence>
            {iframeLoading && (
              <LoadingIndicator 
                message={`Loading ${countryLanguageCodes[countryLanguageCode]?.pretty || 'Preview'}...`}
              />
            )}
          </AnimatePresence>

          {/* The iframe with the component preview */}
          {generatedUrl ? (
            <iframe
              src={generatedUrl}
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                display: 'block',
                backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF'
              }}
              onLoad={handleIframeLoad}
              title="Component Preview"
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.palette.text.secondary,
              }}
            >
              <Typography variant="body2">
                Please select a component and country to view the preview.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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
      
      {/* Test Instructions Component with Floating Action Button */}
      <TestInstructions 
        selectedOptions={selectedOptions}
        onProgressUpdate={handleProgressUpdate}
      />
    </Box>
  );
};

export default RegressionTester;