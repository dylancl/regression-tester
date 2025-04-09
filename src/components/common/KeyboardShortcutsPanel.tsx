import React from "react";
import { Box, Paper, Typography, useTheme, Fade } from "@mui/material";
import { Keyboard } from "@mui/icons-material";

interface KeyboardShortcutsPanelProps {
  /**
   * Whether the panel is visible
   */
  visible: boolean;

  /**
   * Function to close the panel
   */
  onClose: () => void;
}

/**
 * Component that displays keyboard shortcuts in the MultiboxTester
 */
const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Fade in={visible}>
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "auto",
          minWidth: 300,
          maxWidth: 400,
          p: 3,
          zIndex: 1600,
          backdropFilter: "blur(5px)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(30, 30, 30, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, display: "flex", alignItems: "center" }}
        >
          <Keyboard sx={{ mr: 1 }} /> Keyboard Shortcuts
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            Space + Drag
          </Typography>
          <Typography variant="body2">Pan around the canvas</Typography>

          <Typography variant="body2" fontWeight="bold">
            Ctrl + Scroll
          </Typography>
          <Typography variant="body2">Zoom in/out</Typography>

          <Typography variant="body2" fontWeight="bold">
            Esc
          </Typography>
          <Typography variant="body2">Close this panel</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={onClose}
          >
            Close
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default KeyboardShortcutsPanel;
