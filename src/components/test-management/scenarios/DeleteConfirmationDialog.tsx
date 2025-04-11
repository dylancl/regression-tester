import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ScenarioDocument } from "../../../firebase/firestore";

interface DeleteConfirmationDialogProps {
  open: boolean;
  loading: boolean;
  scenario: Partial<ScenarioDocument> | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  loading,
  scenario,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>
        <Typography>
          Are you sure you want to delete the scenario "{scenario?.title}"? This
          will also delete all test steps associated with this scenario.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
