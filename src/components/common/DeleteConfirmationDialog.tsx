import React, { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  SxProps,
  Theme,
} from "@mui/material";

interface DeleteConfirmationDialogProps {
  /**
   * Controls if the dialog is open or closed
   */
  open: boolean;
  /**
   * Title of the dialog
   * @default "Confirm Deletion"
   */
  title?: string;
  /**
   * Custom message content to display in the dialog
   * If provided, it will replace the default message completely
   */
  messageContent?: ReactNode;
  /**
   * Name of the item being deleted
   */
  itemName?: string;
  /**
   * Type of item being deleted (e.g., "component", "scenario", "test step")
   * @default "item"
   */
  itemType?: string;
  /**
   * Additional warning text to show (e.g., about related items being deleted)
   */
  additionalWarning?: string;
  /**
   * Whether the delete action is in progress
   * @default false
   */
  loading?: boolean;
  /**
   * Custom styles for the dialog content
   */
  contentSx?: SxProps<Theme>;
  /**
   * Callback when the user closes the dialog
   */
  onClose: () => void;
  /**
   * Callback when the user confirms deletion
   */
  onConfirm: () => void;
  /**
   * Text for the confirm button
   * @default "Delete"
   */
  confirmButtonText?: string;
  /**
   * Text for the cancel button
   * @default "Cancel"
   */
  cancelButtonText?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  title = "Confirm Deletion",
  messageContent,
  itemName,
  itemType = "item",
  additionalWarning,
  loading = false,
  contentSx,
  onClose,
  onConfirm,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={contentSx}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>

        {messageContent ? (
          messageContent
        ) : (
          <>
            <Typography>
              Are you sure you want to delete{" "}
              {itemName ? `the ${itemType} "${itemName}"` : `this ${itemType}`}?
              {additionalWarning && ` ${additionalWarning}`}
            </Typography>
            {itemName && itemType === "test step" && (
              <Typography
                variant="body2"
                sx={{ mt: 1, mb: 1, fontStyle: "italic" }}
              >
                "{itemName}"
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelButtonText}</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
