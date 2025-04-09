import React, { memo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import LoadingIndicator from "../controls/LoadingIndicator";

interface ResponsiveFrameContainerProps {
  /**
   * The URL to display in the iframe
   */
  url: string;

  /**
   * Whether the frame is in responsive mode
   */
  isResponsiveMode: boolean;

  /**
   * Whether the iframe is currently loading
   */
  isLoading: boolean;

  /**
   * Current width of the frame
   */
  width: number;

  /**
   * Current height of the frame
   */
  height: number;

  /**
   * Whether user is currently resizing
   */
  isResizing: boolean;

  /**
   * Function to handle resize events
   */
  onResize: (e: React.MouseEvent<Element>, direction: string) => void;

  /**
   * Function to handle iframe load events
   */
  onIframeLoad: () => void;

  /**
   * Loading message to display
   */
  loadingMessage?: string;

  /**
   * Content to display when no URL is provided
   */
  placeholderContent?: React.ReactNode;

  /**
   * Additional components to render inside the frame container
   */
  children?: React.ReactNode;
}

/**
 * Component that handles the responsive iframe container with resize capabilities
 */
const ResponsiveFrameContainer = memo<ResponsiveFrameContainerProps>(
  ({
    url,
    isResponsiveMode,
    isLoading,
    width,
    height,
    isResizing,
    onResize,
    onIframeLoad,
    loadingMessage = "Loading preview...",
    placeholderContent,
    children,
  }) => {
    const theme = useTheme();

    return (
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: isResponsiveMode ? 4 : 0,
          backgroundColor: isResponsiveMode
            ? theme.palette.mode === "dark"
              ? "#121212"
              : "#f5f5f5"
            : "transparent",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: isResponsiveMode ? width : "100%",
            height: isResponsiveMode ? height : "100%",
            boxShadow: isResponsiveMode ? theme.shadows[4] : "none",
            overflow: "hidden",
            transition: isResizing
              ? "none"
              : theme.transitions.create(["width", "height", "box-shadow"], {
                  duration: 200,
                }),
            border: isResponsiveMode
              ? `1px solid ${theme.palette.divider}`
              : "none",
          }}
        >
          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && <LoadingIndicator message={loadingMessage} />}
          </AnimatePresence>

          {/* The iframe with the component preview */}
          {url ? (
            <iframe
              src={url}
              style={{
                border: "none",
                width: "100%",
                height: "100%",
                display: "block",
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1E1E1E" : "#FFFFFF",
              }}
              onLoad={onIframeLoad}
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
              {placeholderContent || (
                <Typography variant="body2">
                  Please select options to view the preview.
                </Typography>
              )}
            </Box>
          )}

          {/* Resize handles */}
          {isResponsiveMode && <ResizeHandles onResize={onResize} />}

          {/* Additional content */}
          {children}
        </Box>
      </Box>
    );
  }
);

interface ResizeHandlesProps {
  onResize: (e: React.MouseEvent<Element>, direction: string) => void;
}

/**
 * Component for resize handles in responsive mode
 */
const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onResize }) => {
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

// Set display name for debugging
ResponsiveFrameContainer.displayName = "ResponsiveFrameContainer";

export default ResponsiveFrameContainer;
