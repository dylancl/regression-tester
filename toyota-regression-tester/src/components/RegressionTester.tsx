import { 
  Box, 
  Paper, 
  Typography, 
  Snackbar, 
  Alert,
  CircularProgress,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Tooltip,
  Divider,
  Stack,
  Fade
} from '@mui/material';
import { 
  ChevronLeft, 
  ContentCopy, 
  Menu, 
  DarkMode, 
  LightMode,
  Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRegressionTester } from '../hooks/useRegressionTester';
import { countryLanguageCodes } from '../utils';
import ControlPanel from './controls/ControlPanel';
import CountrySelector from './controls/CountrySelector';
import { useThemeContext } from '../contexts/ThemeContext';

const RegressionTester = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    selectedOptions,
    countryLanguageCode,
    currentCountryIndex,
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
              Regression Controls
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
          height: 'calc(100% - 60px)',
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
            <Fade in={true}>
              <Box 
                sx={{ 
                  maxHeight: '80px', 
                  overflowY: 'auto',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : theme.palette.grey[100],
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : theme.palette.grey[200]
                  }
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    width: '100%',
                    wordBreak: 'break-all'
                  }}
                >
                  {generatedUrl}
                </Typography>
              </Box>
            </Fade>
          </Paper>
          
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
          {iframeLoading && (
            <Box
              sx={{
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
              }}
            >
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
    </Box>
  );
};

export default RegressionTester;