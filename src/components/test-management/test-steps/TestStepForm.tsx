import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Button,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { TestStepDocument } from "../../../firebase/firestore";
import { FormErrors } from "../../../hooks/useTestStepForm";

interface TestStepFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  currentStep: Partial<TestStepDocument> | null;
  isEditing: boolean;
  loading: boolean;
  formErrors: FormErrors;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => void;
  onDeviceChange: (isMobile: boolean) => void;
}

const TestStepForm: React.FC<TestStepFormProps> = ({
  open,
  onClose,
  onSave,
  currentStep,
  isEditing,
  loading,
  formErrors,
  onChange,
  onDeviceChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditing ? "Edit Test Step" : "Add New Test Step"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="stepId"
            label="Step ID"
            fullWidth
            value={currentStep?.stepId || ""}
            onChange={onChange}
            disabled={isEditing}
            error={!!formErrors.stepId}
            helperText={
              formErrors.stepId || "Unique identifier for this test step"
            }
            required
          />

          <TextField
            name="instruction"
            label="Instruction"
            fullWidth
            multiline
            rows={3}
            value={currentStep?.instruction || ""}
            onChange={onChange}
            error={!!formErrors.instruction}
            helperText={
              formErrors.instruction || "What the tester should do in this step"
            }
            required
          />

          <TextField
            name="expectedResult"
            label="Expected Result"
            fullWidth
            multiline
            rows={3}
            value={currentStep?.expectedResult || ""}
            onChange={onChange}
            error={!!formErrors.expectedResult}
            helperText={
              formErrors.expectedResult ||
              "What should happen after following the instruction"
            }
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={currentStep?.device === "mobile"}
                onChange={(e) => onDeviceChange(e.target.checked)}
                name="device"
              />
            }
            label="Mobile-specific test step"
          />

          <TextField
            name="order"
            label="Display Order"
            type="number"
            fullWidth
            value={currentStep?.order || 0}
            onChange={onChange}
            helperText="Test steps are displayed in this order (lower numbers first)"
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

export default TestStepForm;
