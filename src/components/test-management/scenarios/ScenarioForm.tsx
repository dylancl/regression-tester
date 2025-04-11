import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { ScenarioDocument } from "../../../firebase/firestore";

interface FormErrors {
  [key: string]: string;
}

interface ScenarioFormProps {
  open: boolean;
  isEditing: boolean;
  loading: boolean;
  scenario: Partial<ScenarioDocument> | null;
  formErrors: FormErrors;
  onClose: () => void;
  onSave: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => void;
}

const ScenarioForm: React.FC<ScenarioFormProps> = ({
  open,
  isEditing,
  loading,
  scenario,
  formErrors,
  onClose,
  onSave,
  onChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditing ? "Edit Scenario" : "Add New Scenario"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="scenarioId"
            label="Scenario ID"
            fullWidth
            value={scenario?.scenarioId || ""}
            onChange={onChange}
            disabled={isEditing}
            error={!!formErrors.scenarioId}
            helperText={
              formErrors.scenarioId || "Unique identifier for this scenario"
            }
            required
          />

          <TextField
            name="title"
            label="Title"
            fullWidth
            value={scenario?.title || ""}
            onChange={onChange}
            error={!!formErrors.title}
            helperText={
              formErrors.title || "A descriptive title for this scenario"
            }
            required
          />

          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={scenario?.description || ""}
            onChange={onChange}
            error={!!formErrors.description}
            helperText={
              formErrors.description ||
              "Detailed description of what this scenario tests"
            }
            required
          />

          <TextField
            name="order"
            label="Display Order"
            type="number"
            fullWidth
            value={scenario?.order || 0}
            onChange={onChange}
            helperText="Scenarios are displayed in this order (lower numbers first)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={loading}>
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScenarioForm;
