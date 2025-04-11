import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState, useCallback } from "react";
import { useRegressionTester } from "../hooks/useRegressionTester";
import { countryLanguageCodes } from "../utils";
import TestInstructions, {
  TestProgressData,
} from "./test-instructions/TestInstructions";
import { useThemeContext } from "../contexts/ThemeContext";
import NotificationSnackbar from "./common/NotificationSnackbar";
import ConfigDrawer from "./common/ConfigDrawer";
import UrlDisplay from "./common/UrlDisplay";
import FrameToolbar from "./common/FrameToolbar";
import ResponsiveFrameContainer from "./common/ResponsiveFrameContainer";
import FrameTitle from "./controls/FrameTitle";
import { DeviceSizeMenu } from "./controls/DeviceSizeMenu";

const RegressionTester = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const [testProgress, setTestProgress] = useState<TestProgressData>({
    total: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    notTested: 0,
    completion: 0,
  });
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

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

  // Memoize the progress update handler to prevent infinite re-renders
  const handleProgressUpdate = useCallback((progressData: TestProgressData) => {
    setTestProgress(progressData);
  }, []);

  const handleSizeMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setSizeMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleSizeMenuClose = useCallback(() => {
    setSizeMenuAnchorEl(null);
  }, []);

  const urlDisplayComponent = generatedUrl ? (
    <UrlDisplay url={generatedUrl} onCopy={copyUrlToClipboard} />
  ) : null;

  const frameInfoComponent = generatedUrl ? (
    <Box
      sx={{
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
        Current Preview
      </Typography>
      <Box sx={{ py: 0.5 }}>
        <FrameTitle
          selectedOptions={selectedOptions}
          countryLanguageCode={countryLanguageCode}
          maxWidth={280}
          wrapText={true}
        />
      </Box>
    </Box>
  ) : null;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        overflow: "hidden", // Prevent scrolling
      }}
    >
      <ConfigDrawer
        open={sidebarOpen}
        onClose={toggleSidebar}
        themeMode={mode}
        onToggleTheme={toggleTheme}
        selectedOptions={selectedOptions}
        countryLanguageCode={countryLanguageCode}
        onNextCountry={goToNextCountry}
        onPrevCountry={goToPreviousCountry}
        onChangeCountry={changeCountry}
        onOptionChange={handleOptionChange}
        progressData={testProgress}
        urlDisplayComponent={urlDisplayComponent}
        frameInfoComponent={frameInfoComponent}
      />
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
          <FrameToolbar
            isResponsiveMode={frameDimensions.isResponsiveMode}
            width={frameDimensions.width}
            height={frameDimensions.height}
            deviceName={frameDimensions.deviceName}
            onToggleResponsiveMode={toggleResponsiveMode}
            onRotate={rotateDimensions}
            onOpenSizeMenu={handleSizeMenuOpen}
          />
          <ResponsiveFrameContainer
            url={generatedUrl}
            isResponsiveMode={frameDimensions.isResponsiveMode}
            isLoading={iframeLoading}
            width={frameDimensions.width}
            height={frameDimensions.height}
            isResizing={isResizing}
            onResize={handleResize}
            onIframeLoad={handleIframeLoad}
            loadingMessage={`Loading ${
              countryLanguageCodes[countryLanguageCode]?.pretty || "Preview"
            }...`}
            placeholderContent={
              <Typography variant="body2">
                Please select a component and country to view the preview.
              </Typography>
            }
          />
        </Box>
      </Box>

      <TestInstructions
        selectedOptions={selectedOptions}
        onProgressUpdate={handleProgressUpdate}
        handleOptionChange={handleOptionChange}
      />

      <NotificationSnackbar
        message={notification}
        open={!!notification}
        autoHideDuration={3000}
      />

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
