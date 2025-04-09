import React, { memo, useRef, useMemo } from "react";
import { Box, Fade, Typography, useTheme } from "@mui/material";
import { OpenWith } from "@mui/icons-material";

interface FrameGridContainerProps {
  /**
   * Whether to show grid background
   */
  showGrid: boolean;

  /**
   * Current zoom level as a percentage (100 = 100%)
   */
  zoomLevel: number;

  /**
   * Whether panning mode is enabled
   */
  isPanningEnabled: boolean;

  /**
   * Currently active panning state
   */
  isPanning: boolean;

  /**
   * Function to start panning
   */
  onStartPanning: (e: React.MouseEvent) => void;

  /**
   * Additional container style to apply
   */
  containerStyle?: React.CSSProperties;

  /**
   * Reference to the parent container
   */
  parentRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * Reference to the container itself
   */
  containerRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * Children elements to render inside the container
   */
  children: React.ReactNode;
}

/**
 * A container component for the frames grid with grid background and panning functionality
 */
const FrameGridContainer = memo<FrameGridContainerProps>(
  ({
    showGrid,
    zoomLevel,
    isPanningEnabled,
    onStartPanning,
    containerStyle,
    containerRef,
    children,
  }) => {
    const theme = useTheme();

    // Create a local ref if none provided
    const localContainerRef = useRef<HTMLDivElement>(null);
    const effectiveContainerRef = containerRef || localContainerRef;

    // Calculate grid pattern size adjusted by zoom level
    const gridSize = 20;
    const adjustedGridSize = useMemo(
      () => gridSize * (100 / zoomLevel),
      [gridSize, zoomLevel]
    );

    // Memoize grid background style to avoid recalculation on each render
    const gridBackgroundStyle = useMemo(
      () => ({
        backgroundSize: showGrid
          ? `${adjustedGridSize}px ${adjustedGridSize}px`
          : "initial",
        backgroundImage: showGrid
          ? `linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
       linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)`
          : "none",
        "&::after": showGrid
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              background: `radial-gradient(
        circle at center,
        transparent 30%,
        ${theme.palette.background.default} 100%
      )`,
              zIndex: 0,
            }
          : {},
      }),
      [
        showGrid,
        adjustedGridSize,
        theme.palette.divider,
        theme.palette.background.default,
      ]
    );

    // Memoize container style to prevent recalculation on each render
    const framesContainerStyle = useMemo(
      () => ({
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        position: "relative",
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: "top left",
        transition: "transform 0.2s ease",
        padding: zoomLevel < 100 ? `${(100 - zoomLevel) / 2}px` : 0,
        minWidth: `${10000 / zoomLevel}%`,
        height: zoomLevel < 100 ? `${(10000 / zoomLevel) * 0.01}%` : "auto",
        ...gridBackgroundStyle,
        ...containerStyle,
      }),
      [zoomLevel, gridBackgroundStyle, containerStyle]
    );

    return (
      <>
        {/* Panning indicator */}
        {isPanningEnabled && (
          <Fade in={true}>
            <Box
              sx={{
                position: "fixed",
                bottom: 80,
                left: 16,
                zIndex: 1000,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0,0,0,0.7)"
                    : "rgba(255,255,255,0.7)",
                backdropFilter: "blur(4px)",
                borderRadius: 2,
                padding: 1,
                display: "flex",
                alignItems: "center",
                boxShadow: theme.shadows[3],
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <OpenWith sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="body2">
                Press <b>Space + Drag</b> to pan
              </Typography>
            </Box>
          </Fade>
        )}

        {/* The frames container with zoom and grid */}
        <Box
          ref={effectiveContainerRef}
          className="frames-container"
          sx={framesContainerStyle}
          onMouseDown={(e) => {
            // Don't start panning if clicking on a UI element
            if (
              isPanningEnabled &&
              (e.target === e.currentTarget ||
                (e.target as HTMLElement).closest(".frames-container"))
            ) {
              onStartPanning(e);
            }
          }}
        >
          {children}
        </Box>
      </>
    );
  }
);

// Set display name for debugging
FrameGridContainer.displayName = "FrameGridContainer";

export default FrameGridContainer;
