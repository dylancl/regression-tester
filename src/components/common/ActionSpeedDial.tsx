import { memo } from "react";
import { SpeedDial, SpeedDialAction, useTheme } from "@mui/material";
import {
  Add,
  SyncAlt,
  GridOn,
  GridOff,
  Search,
  TuneOutlined,
  VerticalAlignCenter,
  OpenWith,
  Keyboard,
  ViewCompact,
} from "@mui/icons-material";

interface ActionSpeedDialProps {
  /**
   * Whether the SpeedDial is open
   */
  open: boolean;

  /**
   * Function to call when the SpeedDial should be opened
   */
  onOpen: () => void;

  /**
   * Function to call when the SpeedDial should be closed
   */
  onClose: () => void;

  /**
   * Whether global sync is enabled
   */
  globalSyncEnabled: boolean;

  /**
   * Whether grid is shown
   */
  showGrid: boolean;

  /**
   * Whether snap to grid is enabled
   */
  snapToGrid: boolean;

  /**
   * Whether zoom controls are shown
   */
  showZoomControls: boolean;

  /**
   * Whether panning is enabled
   */
  isPanningEnabled: boolean;

  /**
   * Function to add a new frame
   */
  onAddFrame: () => void;

  /**
   * Function to toggle global sync
   */
  onToggleGlobalSync: () => void;

  /**
   * Function to toggle grid
   */
  onToggleGrid: () => void;

  /**
   * Function to toggle snap to grid
   */
  onToggleSnapToGrid: () => void;

  /**
   * Function to toggle zoom controls
   */
  onToggleZoomControls: () => void;

  /**
   * Function to toggle panning mode
   */
  onTogglePanningMode: () => void;

  /**
   * Function to sync all frame sizes
   */
  onSyncFrameSizes: () => void;

  /**
   * Function to show keyboard shortcuts
   */
  onShowKeyboardShortcuts: () => void;
}

/**
 * A component for the SpeedDial with various actions in the MultiboxTester
 */
const ActionSpeedDial = memo<ActionSpeedDialProps>(
  ({
    open,
    onOpen,
    onClose,
    globalSyncEnabled,
    showGrid,
    snapToGrid,
    showZoomControls,
    isPanningEnabled,
    onAddFrame,
    onToggleGlobalSync,
    onToggleGrid,
    onToggleSnapToGrid,
    onToggleZoomControls,
    onTogglePanningMode,
    onSyncFrameSizes,
    onShowKeyboardShortcuts,
  }) => {
    const theme = useTheme();

    // Common styles for speed dial actions
    const getActionStyle = (isActive: boolean) => ({
      bgcolor: isActive
        ? theme.palette.mode === "dark"
          ? "#2c5282"
          : "#e3f2fd"
        : theme.palette.mode === "dark"
        ? "#333333"
        : "#ffffff",
      color: isActive ? theme.palette.primary.main : "inherit",
      "&:hover": {
        bgcolor: isActive
          ? theme.palette.mode === "dark"
            ? "#3b6eb4"
            : "#bbdefb"
          : theme.palette.mode === "dark"
          ? "#444444"
          : "#f5f5f5",
        transform: "scale(1.05)",
      },
      boxShadow: theme.shadows[2],
    });

    // Basic action style for non-toggle actions
    const basicActionStyle = {
      bgcolor: theme.palette.mode === "dark" ? "#333333" : "#ffffff",
      "&:hover": {
        bgcolor: theme.palette.mode === "dark" ? "#444444" : "#f5f5f5",
        transform: "scale(1.05)",
      },
      boxShadow: theme.shadows[2],
    };

    return (
      <SpeedDial
        ariaLabel="Action controls"
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1501,
          "& .MuiFab-primary": {
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
            transition: "all 0.3s ease",
          },
          "& .MuiSpeedDial-actions": {
            gap: 0.5,
          },
        }}
        icon={<TuneOutlined />}
        direction="up"
        openIcon={<TuneOutlined />}
        FabProps={{
          sx: {
            boxShadow: theme.shadows[4],
            "&:hover": {
              boxShadow: theme.shadows[8],
              transform: "scale(1.05)",
            },
          },
        }}
      >
        {/* Add Frame */}
        <SpeedDialAction
          key="add-frame"
          icon={<Add />}
          tooltipTitle="Add new frame"
          tooltipPlacement="left"
          onClick={onAddFrame}
          sx={basicActionStyle}
        />

        {/* Toggle Global Sync */}
        <SpeedDialAction
          key="toggle-sync"
          icon={<SyncAlt />}
          tooltipTitle={
            globalSyncEnabled ? "Disable global sync" : "Enable global sync"
          }
          tooltipPlacement="left"
          onClick={onToggleGlobalSync}
          sx={getActionStyle(globalSyncEnabled)}
        />

        {/* Toggle Grid */}
        <SpeedDialAction
          key="toggle-grid"
          icon={showGrid ? <GridOn /> : <GridOff />}
          tooltipTitle={showGrid ? "Hide grid" : "Show grid"}
          tooltipPlacement="left"
          onClick={onToggleGrid}
          sx={getActionStyle(showGrid)}
        />

        {/* Toggle Snap to Grid */}
        <SpeedDialAction
          key="toggle-snap"
          icon={<VerticalAlignCenter />}
          tooltipTitle={
            snapToGrid ? "Disable snap to grid" : "Enable snap to grid"
          }
          tooltipPlacement="left"
          onClick={onToggleSnapToGrid}
          sx={getActionStyle(snapToGrid)}
        />

        {/* Toggle Zoom Controls */}
        <SpeedDialAction
          key="toggle-zoom"
          icon={<Search />}
          tooltipTitle="Zoom controls"
          tooltipPlacement="left"
          onClick={onToggleZoomControls}
          sx={getActionStyle(showZoomControls)}
        />

        {/* Sync Frame Sizes */}
        <SpeedDialAction
          key="sync-frame-sizes"
          icon={<ViewCompact />}
          tooltipTitle="Sync all frame sizes"
          tooltipPlacement="left"
          onClick={onSyncFrameSizes}
          sx={basicActionStyle}
        />

        {/* Toggle Panning Mode */}
        <SpeedDialAction
          key="toggle-panning"
          icon={<OpenWith />}
          tooltipTitle={
            isPanningEnabled ? "Disable panning mode" : "Enable panning mode"
          }
          tooltipPlacement="left"
          onClick={onTogglePanningMode}
          sx={getActionStyle(isPanningEnabled)}
        />

        {/* Keyboard Shortcuts */}
        <SpeedDialAction
          key="toggle-keyboard-shortcuts"
          icon={<Keyboard />}
          tooltipTitle="Keyboard shortcuts"
          tooltipPlacement="left"
          onClick={onShowKeyboardShortcuts}
          sx={basicActionStyle}
        />
      </SpeedDial>
    );
  }
);

// Set display name for debugging
ActionSpeedDial.displayName = "ActionSpeedDial";

export default ActionSpeedDial;
