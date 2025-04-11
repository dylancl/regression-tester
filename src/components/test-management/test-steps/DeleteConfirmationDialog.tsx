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
import { TestStepDocument } from "../../../firebase/firestore";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  testStep: Partial<TestStepDocument> | null;
  loading: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onDelete,
  testStep,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>
        <Typography>Are you sure you want to delete this test step?</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 1, fontStyle: "italic" }}>
          "{testStep?.instruction}"
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onDelete}
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
