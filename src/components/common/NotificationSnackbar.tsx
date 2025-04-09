import React from "react";
import { Snackbar, Alert, useTheme } from "@mui/material";

interface NotificationSnackbarProps {
  /**
   * The message to display in the notification
   */
  message: string | null;

  /**
   * Whether the notification is open/visible
   */
  open: boolean;

  /**
   * Function to call when notification should be closed
   */
  onClose?: () => void;

  /**
   * Auto-hide duration in milliseconds
   */
  autoHideDuration?: number;

  /**
   * The severity of the alert
   */
  severity?: "success" | "info" | "warning" | "error";

  /**
   * Position for the snackbar
   */
  position?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

/**
 * A reusable notification component that displays messages in a snackbar
 */
const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  message,
  open,
  onClose,
  autoHideDuration = 3000,
  severity = "info",
  position = { vertical: "bottom", horizontal: "center" },
}) => {
  const theme = useTheme();

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={position}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        sx={{
          backgroundColor: theme.palette.primary.main,
          boxShadow: theme.shadows[3],
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
