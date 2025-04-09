import React from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  AspectRatio,
  PhoneAndroid,
  ScreenRotationAlt,
} from "@mui/icons-material";

interface FrameToolbarProps {
  /**
   * Whether the frame is in responsive mode
   */
  isResponsiveMode: boolean;

  /**
   * Current width of the frame
   */
  width: number;

  /**
   * Current height of the frame
   */
  height: number;

  /**
   * Optional device name
   */
  deviceName?: string;

  /**
   * Function to toggle responsive mode
   */
  onToggleResponsiveMode: () => void;

  /**
   * Function to rotate dimensions
   */
  onRotate?: () => void;

  /**
   * Function to open the device size menu
   */
  onOpenSizeMenu?: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * A toolbar component for frame preview controls
 */
const FrameToolbar: React.FC<FrameToolbarProps> = ({
  isResponsiveMode,
  width,
  height,
  deviceName,
  onToggleResponsiveMode,
  onRotate,
  onOpenSizeMenu,
}) => {
  const theme = useTheme();

  return (
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
        {isResponsiveMode ? (
          <>
            <PhoneAndroid color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary">
              Responsive Mode
            </Typography>
            <Chip
              label={`${Math.round(width)}×${Math.round(height)}`}
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
            {deviceName && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                {deviceName}
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
        {isResponsiveMode && onOpenSizeMenu && (
          <Tooltip title="Change device size">
            <IconButton size="small" onClick={onOpenSizeMenu}>
              <PhoneAndroid fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {isResponsiveMode && onRotate && (
          <Tooltip title="Rotate dimensions">
            <IconButton size="small" onClick={onRotate}>
              <ScreenRotationAlt fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip
          title={
            isResponsiveMode ? "Exit responsive mode" : "Enter responsive mode"
          }
        >
          <IconButton
            size="small"
            color={isResponsiveMode ? "primary" : "default"}
            onClick={onToggleResponsiveMode}
          >
            <AspectRatio fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default FrameToolbar;
