import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Add, Edit, Delete, DragIndicator } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TestStepDocument,
  getTestStepsForScenario,
  createTestStep,
  updateTestStep,
  deleteTestStep,
} from "../../firebase/firestore";
import { useTheme } from "@mui/material/styles";

// Sortable test step item
interface SortableTestStepItemProps {
  step: TestStepDocument;
  onEdit: (step: TestStepDocument) => void;
  onDelete: (step: TestStepDocument) => void;
}

const SortableTestStepItem: React.FC<SortableTestStepItemProps> = ({
  step,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.paper,
        borderRadius: 1,
        mb: 1,
        p: 2,
        boxShadow: 1,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
        "&:focus": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: "2px",
        },
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[300]
        }`,
      }}
    >
      <Box
        sx={{ mr: 1, display: "flex", alignItems: "center", cursor: "grab" }}
        {...attributes}
        {...listeners}
      >
        <DragIndicator color="action" />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {step.instruction}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Expected Result:</strong> {step.expectedResult}
        </Typography>
        {step.device === "mobile" && (
          <Typography
            variant="caption"
            color="secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Mobile specific
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5 }}
        >
          ID: {step.stepId}
        </Typography>
      </Box>

      <Box sx={{ ml: 1, display: "flex", alignItems: "flex-start" }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(step)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(step)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Main test step manager component
interface TestStepManagerProps {
  componentId: string;
  scenarioId: string;
}

const TestStepManager: React.FC<TestStepManagerProps> = ({
  componentId,
  scenarioId,
}) => {
  const theme = useTheme();
  const [testSteps, setTestSteps] = useState<TestStepDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] =
    useState<Partial<TestStepDocument> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch test steps when component mounts or scenarioId changes
  useEffect(() => {
    const fetchTestSteps = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedSteps = await getTestStepsForScenario(
          componentId,
          scenarioId
        );
        setTestSteps(fetchedSteps);
      } catch (err) {
        console.error("Error fetching test steps:", err);
        setError("Failed to load test steps. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (componentId && scenarioId) {
      fetchTestSteps();
    }
  }, [componentId, scenarioId]);

  const handleOpenDialog = (step?: TestStepDocument) => {
    if (step) {
      setCurrentStep(step);
      setIsEditing(true);
    } else {
      // Calculate next step ID and order
      const nextStepNumber = testSteps.length + 1;
      const nextOrder =
        testSteps.length > 0
          ? Math.max(...testSteps.map((s) => s.order)) + 10
          : 0;

      setCurrentStep({
        stepId: `step-${nextStepNumber}`,
        instruction: "",
        expectedResult: "",
        order: nextOrder,
        device: "desktop",
      });
      setIsEditing(false);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentStep(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setCurrentStep((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentStep?.stepId) {
      errors.stepId = "Step ID is required";
    }

    if (!currentStep?.instruction) {
      errors.instruction = "Instruction is required";
    }

    if (!currentStep?.expectedResult) {
      errors.expectedResult = "Expected result is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentStep || !validateForm()) return;

    try {
      setLoading(true);

      if (isEditing && currentStep.id) {
        const { id, createdAt, updatedAt, ...updateData } = currentStep;
        await updateTestStep(componentId, scenarioId, id, updateData);
      } else {
        const { id, createdAt, updatedAt, ...createData } = currentStep;
        await createTestStep(
          componentId,
          scenarioId,
          createData as Omit<TestStepDocument, "id" | "createdAt" | "updatedAt">
        );
      }

      // Refresh test steps list
      const updatedSteps = await getTestStepsForScenario(
        componentId,
        scenarioId
      );
      setTestSteps(updatedSteps);

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving test step:", error);
      setError("Failed to save test step. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = (step: TestStepDocument) => {
    setCurrentStep(step);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentStep?.id) return;

    try {
      setLoading(true);
      await deleteTestStep(componentId, scenarioId, currentStep.id);

      // Refresh test steps list
      const updatedSteps = await getTestStepsForScenario(
        componentId,
        scenarioId
      );
      setTestSteps(updatedSteps);

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting test step:", error);
      setError("Failed to delete test step. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTestSteps((items) => {
        // Find the old and new index
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Move the item
        return arrayMove(items, oldIndex, newIndex);
      });

      setReordering(true);

      try {
        // Update the order in the database
        const updatedSteps = [...testSteps];
        const oldIndex = updatedSteps.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = updatedSteps.findIndex((item) => item.id === over.id);

        // Calculate new order values - redistribute orders
        const reorderedSteps = arrayMove(updatedSteps, oldIndex, newIndex);

        // Update order property for all steps (gives them evenly spaced numbers)
        const updatedPromises = reorderedSteps.map((step, index) => {
          const newOrder = (index + 1) * 10;
          return updateTestStep(componentId, scenarioId, step.id, {
            order: newOrder,
          });
        });

        await Promise.all(updatedPromises);

        // Refresh test steps list to get updated order
        const refreshedSteps = await getTestStepsForScenario(
          componentId,
          scenarioId
        );
        setTestSteps(refreshedSteps);
      } catch (error) {
        console.error("Error updating test step order:", error);
        setError("Failed to update step order. Please try again.");
      } finally {
        setReordering(false);
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="h2">
          Test Steps
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Test Step
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && testSteps.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
          <CircularProgress />
        </Box>
      ) : testSteps.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No test steps found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add your first test step to get started
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Test Step
          </Button>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflow: "auto", px: 1, py: 0.5 }}>
          {reordering && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Updating order...
              </Typography>
            </Box>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={testSteps.map((step) => step.id)}
              strategy={verticalListSortingStrategy}
            >
              {testSteps.map((step) => (
                <SortableTestStepItem
                  key={step.id}
                  step={step}
                  onEdit={handleOpenDialog}
                  onDelete={handleConfirmDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {/* Test Step Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
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
              onChange={handleChange}
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
              onChange={handleChange}
              error={!!formErrors.instruction}
              helperText={
                formErrors.instruction ||
                "What the tester should do in this step"
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
              onChange={handleChange}
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
                  onChange={(e) =>
                    setCurrentStep((prev) => ({
                      ...prev,
                      device: e.target.checked ? "mobile" : "desktop",
                    }))
                  }
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
              onChange={handleChange}
              helperText="Test steps are displayed in this order (lower numbers first)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete this test step?
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, mb: 1, fontStyle: "italic" }}
          >
            "{currentStep?.instruction}"
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestStepManager;
