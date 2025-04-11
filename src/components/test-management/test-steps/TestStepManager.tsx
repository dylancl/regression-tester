import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import useTestSteps from "../../../hooks/useTestSteps";
import useTestStepForm from "../../../hooks/useTestStepForm";
import useDragAndDrop from "../../../hooks/useDragAndDrop";
import SortableTestStepItem from "./SortableTestStepItem";
import TestStepForm from "./TestStepForm";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import EmptyState from "./EmptyState";
import { TestStepDocument } from "../../../firebase/firestore";

interface TestStepManagerProps {
  componentId: string;
  scenarioId: string;
}

const TestStepManager: React.FC<TestStepManagerProps> = ({
  componentId,
  scenarioId,
}) => {
  const {
    testSteps,
    loading,
    error,
    reordering,
    addTestStep,
    editTestStep,
    removeTestStep,
    reorderSteps,
    getNextStepDefaults,
  } = useTestSteps({ componentId, scenarioId });

  const {
    currentStep,
    isEditing,
    formErrors,
    dialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormChange,
    validateForm,
    setDeviceType,
  } = useTestStepForm();

  const { sensors, handleDragEnd } = useDragAndDrop({
    items: testSteps,
    onReorder: reorderSteps,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenAddDialog = () => {
    openCreateDialog(getNextStepDefaults());
  };

  const handleDeleteClick = (step: TestStepDocument) => {
    openEditDialog(step); // This just sets the currentStep, we're not actually editing
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentStep || !validateForm()) return;

    if (isEditing && currentStep.id) {
      const { id, createdAt, updatedAt, ...updateData } = currentStep;
      // Only update if we have all required fields
      const success = await editTestStep(
        id,
        updateData as Omit<TestStepDocument, "id" | "createdAt" | "updatedAt">
      );
      if (success) closeDialog();
    } else {
      // Ensure all required fields are present and defined
      if (
        !currentStep.stepId ||
        !currentStep.instruction ||
        !currentStep.expectedResult
      ) {
        return; // This should be caught by validateForm, but this is an extra safety check
      }

      const requiredData = {
        stepId: currentStep.stepId,
        instruction: currentStep.instruction,
        expectedResult: currentStep.expectedResult,
        order: currentStep.order || 0,
        device: currentStep.device || "desktop",
      };

      const success = await addTestStep(requiredData);
      if (success) closeDialog();
    }
  };

  const handleDelete = async () => {
    if (!currentStep?.id) return;
    const success = await removeTestStep(currentStep.id);
    if (success) setDeleteDialogOpen(false);
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
          onClick={handleOpenAddDialog}
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
        <EmptyState onAddClick={handleOpenAddDialog} />
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
                  onEdit={openEditDialog}
                  onDelete={handleDeleteClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {/* Test Step Form Dialog */}
      <TestStepForm
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        currentStep={currentStep}
        isEditing={isEditing}
        loading={loading}
        formErrors={formErrors}
        onChange={handleFormChange}
        onDeviceChange={setDeviceType}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDelete}
        testStep={currentStep}
        loading={loading}
      />
    </Box>
  );
};

export default TestStepManager;
