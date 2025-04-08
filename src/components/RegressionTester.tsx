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
  Menu,
  Chip,
} from "@mui/material";
import {
  ChevronLeft,
  ContentCopy,
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Settings,
  OpenInNew,
  AspectRatio,
  PhoneAndroid,
  ScreenRotationAlt,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useRegressionTester } from "../hooks/useRegressionTester";
import { countryLanguageCodes } from "../utils";
import ControlPanel from "./controls/ControlPanel";
import CountrySelector from "./controls/CountrySelector";
import LoadingIndicator from "./controls/LoadingIndicator";
import FrameTitle from "./controls/FrameTitle";
import TestInstructions, {
  TestProgressData,
} from "./controls/TestInstructions";
import ProgressTracker from "./controls/ProgressTracker";
import { useThemeContext } from "../contexts/ThemeContext";
import { useState, useCallback } from "react";
import { DeviceSizeMenu } from "./controls/DeviceSizeMenu";

// A simplified version of the ResizeHandles component for the single view
const SingleViewResizeHandles = ({
  onResize,
}: {
  onResize: (e: React.MouseEvent, direction: string) => void;
}) => {
  const theme = useTheme();

  // Style constants for resize handles
  const resizeHandleStyles = {
    position: "absolute",
    width: 20,
    height: 20,
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.2s ease",
  };

  // Handle grabber style
  const handleGrabberStyle = {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "currentColor",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow:
      "0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.2)",
    "&:hover": {
      transform: "scale(1.5)",
      boxShadow:
        "0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)",
    },
  };

  // Use a more prominent color for handles
  const handleColor =
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.7)"
      : "rgba(0, 0, 0, 0.5)";

  // Common styles for all handles
  const commonStyles = {
    color: handleColor,
    "&::before": {
      content: '""',
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      zIndex: -1,
    },
    "&:hover": {
      color: theme.palette.primary.main,
      "&::before": {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      },
    },
  };

  return (
    <>
      {/* We only need the main resize handles for simplicity */}
      {/* Right edge */}
      <Box
        sx={{
          ...resizeHandleStyles,
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          cursor: "ew-resize",
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, "e")}
      >
        <Box sx={handleGrabberStyle} />
      </Box>

      {/* Bottom edge */}
      <Box
        sx={{
          ...resizeHandleStyles,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "ns-resize",
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, "s")}
      >
        <Box sx={handleGrabberStyle} />
      </Box>

      {/* Bottom-right corner */}
      <Box
        sx={{
          ...resizeHandleStyles,
          bottom: 0,
          right: 0,
          cursor: "nwse-resize",
          ...commonStyles,
        }}
        onMouseDown={(e) => onResize(e, "se")}
      >
        <Box sx={handleGrabberStyle} />
      </Box>
    </>
  );
};

const RegressionTester = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [testProgress, setTestProgress] = useState<TestProgressData>({
    total: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    notTested: 0,
    completion: 0,
  });

  const {
    selectedOptions,
    countryLanguageCode,
    generatedUrl,
    notification,
    iframeLoading,
    sidebarOpen,
    frameDimensions,
    isResizing,
    handleOptionChange,
    goToNextCountry,
    goToPreviousCountry,
    changeCountry,
    copyUrlToClipboard,
    handleIframeLoad,
    toggleSidebar,
    toggleResponsiveMode,
    handleResize,
    changeDeviceSize,
    rotateDimensions,
  } = useRegressionTester();

  const [urlHovered, setUrlHovered] = useState(false);

  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  // Handler for device size menu
  const handleSizeMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setSizeMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleSizeMenuClose = useCallback(() => {
    setSizeMenuAnchorEl(null);
  }, []);

  // Memoize the progress update handler to prevent infinite re-renders
  const handleProgressUpdate = useCallback((progressData: TestProgressData) => {
    setTestProgress(progressData);
  }, []);

  // Calculate the drawer width based on screen size
  const configDrawerWidth = isMobile ? "100%" : 340;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        overflow: "hidden", // Prevent scrolling
      }}
    >
      {/* Sidebar drawer for controls */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? configDrawerWidth : 0,
          flexShrink: 0,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          "& .MuiDrawer-paper": {
            width: configDrawerWidth,
            boxSizing: "border-box",
            position: isMobile ? "fixed" : "relative",
            borderRight: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(66, 66, 66, 0.2)"
                : "rgba(248, 248, 248, 0.8)",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Settings color="primary" fontSize="small" />
            <Typography variant="subtitle1" color="primary" fontWeight="medium">
              Configuration
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip
              title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
            >
              <IconButton size="small" onClick={toggleTheme} sx={{ mr: 0.5 }}>
                {mode === "light" ? (
                  <DarkMode fontSize="small" />
                ) : (
                  <LightMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={toggleSidebar}>
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            overflowY: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* URL display section */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: "background.paper",
              borderRadius: 2,
              transition: theme.transitions.create([
                "background-color",
                "box-shadow",
              ]),
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" color="primary">
                Generated URL
              </Typography>
              <Tooltip title="Copy URL">
                <IconButton
                  onClick={copyUrlToClipboard}
                  color="primary"
                  size="small"
                  sx={{
                    transition: theme.transitions.create("transform"),
                    "&:hover": { transform: "scale(1.1)" },
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
                position: "relative",
                borderRadius: 1,
                overflow: "hidden", // Prevent content from causing container to resize
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Box
                sx={{
                  height: urlHovered ? "auto" : "40px", // Fixed height when not hovered
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : theme.palette.grey[100],
                  p: 1.5,
                  borderRadius: 1,
                  transition: theme.transitions.create(
                    ["background-color", "height"],
                    {
                      duration: "0.3s",
                      easing: theme.transitions.easing.easeInOut,
                    }
                  ),
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : theme.palette.grey[200],
                  },
                }}
              >
                {/* Always render both views, but hide one with opacity */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: urlHovered ? 0 : 1,
                    height: urlHovered ? 0 : "24px",
                    overflow: "hidden",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "90%",
                    }}
                  >
                    {generatedUrl}
                  </Typography>
                  <OpenInNew
                    fontSize="small"
                    color="action"
                    sx={{ opacity: 0.6, ml: 1 }}
                  />
                </Box>

                {/* Expanded view - always in DOM but conditionally shown */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: urlHovered ? 1 : 0,
                    height: urlHovered ? "auto" : 0,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeInOut",
                  }}
                  style={{
                    overflow: "hidden",
                    transformOrigin: "top",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      display: "block",
                      width: "100%",
                      wordBreak: "break-all",
                      pt: urlHovered ? 0.5 : 0,
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
                backgroundColor: "background.paper",
                borderRadius: 2,
                transition: theme.transitions.create([
                  "background-color",
                  "box-shadow",
                ]),
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
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
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          position: "relative",
          bgcolor: "background.default",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && {
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        {/* Toolbar when sidebar is closed */}
        {!sidebarOpen && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "48px",
              px: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(66, 66, 66, 0.2)"
                  : "rgba(248, 248, 248, 0.8)",
            }}
          >
            <IconButton onClick={toggleSidebar} size="small" sx={{ mr: 1 }}>
              <MenuIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              {countryLanguageCodes[countryLanguageCode]?.pretty ||
                "Unknown Country"}
            </Typography>
          </Box>
        )}

        {/* IFrame Container */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            width: "100%",
            height: sidebarOpen ? "100%" : "calc(100% - 48px)", // Account for the top toolbar when sidebar is closed
            display: "flex",
            flexDirection: "column",
            transition: theme.transitions.create(
              ["width", "height", "margin"],
              {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }
            ),
          }}
        >
          {/* Responsive Mode Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "40px",
              px: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(66, 66, 66, 0.2)"
                  : "rgba(248, 248, 248, 0.8)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {frameDimensions.isResponsiveMode ? (
                <>
                  <PhoneAndroid color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="primary">
                    Responsive Mode
                  </Typography>
                  <Chip
                    label={`${Math.round(frameDimensions.width)}×${Math.round(
                      frameDimensions.height
                    )}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: "22px",
                      ml: 1,
                      fontSize: "0.7rem",
                      fontFamily: "monospace",
                    }}
                  />
                  {frameDimensions.deviceName && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {frameDimensions.deviceName}
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <AspectRatio fontSize="small" />
                  <Typography variant="subtitle2">Full Size</Typography>
                </>
              )}
            </Stack>
            <Stack direction="row" spacing={0.5}>
              {frameDimensions.isResponsiveMode && (
                <>
                  <Tooltip title="Change device size">
                    <IconButton size="small" onClick={handleSizeMenuOpen}>
                      <PhoneAndroid fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Rotate dimensions">
                    <IconButton size="small" onClick={rotateDimensions}>
                      <ScreenRotationAlt fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip
                title={
                  frameDimensions.isResponsiveMode
                    ? "Exit responsive mode"
                    : "Enter responsive mode"
                }
              >
                <IconButton
                  size="small"
                  color={
                    frameDimensions.isResponsiveMode ? "primary" : "default"
                  }
                  onClick={toggleResponsiveMode}
                >
                  <AspectRatio fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Responsive Frame Container */}
          <Box
            sx={{
              flex: 1,
              position: "relative",
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              p: frameDimensions.isResponsiveMode ? 4 : 0,
              backgroundColor: frameDimensions.isResponsiveMode
                ? theme.palette.mode === "dark"
                  ? "#121212"
                  : "#f5f5f5"
                : "transparent",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: frameDimensions.isResponsiveMode
                  ? frameDimensions.width
                  : "100%",
                height: frameDimensions.isResponsiveMode
                  ? frameDimensions.height
                  : "100%",
                boxShadow: frameDimensions.isResponsiveMode
                  ? theme.shadows[4]
                  : "none",
                overflow: "hidden",
                transition: isResizing
                  ? "none"
                  : theme.transitions.create(
                      ["width", "height", "box-shadow"],
                      {
                        duration: 200,
                      }
                    ),
                border: frameDimensions.isResponsiveMode
                  ? `1px solid ${theme.palette.divider}`
                  : "none",
              }}
            >
              {/* Loading indicator */}
              <AnimatePresence>
                {iframeLoading && (
                  <LoadingIndicator
                    message={`Loading ${
                      countryLanguageCodes[countryLanguageCode]?.pretty ||
                      "Preview"
                    }...`}
                  />
                )}
              </AnimatePresence>

              {/* The iframe with the component preview */}
              {generatedUrl ? (
                <iframe
                  src={generatedUrl}
                  style={{
                    border: "none",
                    width: "100%",
                    height: "100%",
                    display: "block",
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1E1E1E" : "#FFFFFF",
                  }}
                  onLoad={handleIframeLoad}
                  title="Component Preview"
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Typography variant="body2">
                    Please select a component and country to view the preview.
                  </Typography>
                </Box>
              )}

              {/* Resize handles for responsive mode */}
              {frameDimensions.isResponsiveMode && (
                <SingleViewResizeHandles onResize={handleResize} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Test Instructions sidebar */}
      <TestInstructions
        selectedOptions={selectedOptions}
        onProgressUpdate={handleProgressUpdate}
        handleOptionChange={handleOptionChange}
      />

      {/* Notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

      {/* Device Size Menu */}
      <DeviceSizeMenu
        anchorEl={sizeMenuAnchorEl}
        currentWidth={frameDimensions.width}
        onClose={handleSizeMenuClose}
        onSelect={changeDeviceSize}
      />
    </Box>
  );
};

export default RegressionTester;
