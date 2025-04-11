import React from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ScenarioDocument } from "../../../firebase/firestore";
import { useScenarioManager } from "../../../hooks/useScenarioManager";
import ScenarioCard from "./ScenarioCard";
import ScenarioForm from "./ScenarioForm";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";
import EmptyState from "./EmptyState";

interface ScenarioManagerProps {
  componentId: string;
  onSelectScenario: (id: string) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  componentId,
  onSelectScenario,
}) => {
  const {
    scenarios,
    loading,
    error,
    currentScenario,
    formErrors,
    dialogOpen,
    isEditing,
    deleteDialogOpen,
    openDialog,
    closeDialog,
    handleChange,
    saveScenario,
    confirmDelete,
    closeDeleteDialog,
    executeDelete,
  } = useScenarioManager(componentId);

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
          Test Scenarios
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openDialog()}
        >
          Add Scenario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && scenarios.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
          <CircularProgress />
        </Box>
      ) : scenarios.length === 0 ? (
        <EmptyState onAddClick={() => openDialog()} />
      ) : (
        <Grid container spacing={2}>
          {scenarios.map((scenario: ScenarioDocument) => (
            <Grid key={scenario.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ScenarioCard
                scenario={scenario}
                onEdit={openDialog}
                onDelete={confirmDelete}
                onSelect={onSelectScenario}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Scenario Form Dialog */}
      <ScenarioForm
        open={dialogOpen}
        isEditing={isEditing}
        loading={loading}
        scenario={currentScenario}
        formErrors={formErrors}
        onClose={closeDialog}
        onSave={saveScenario}
        onChange={handleChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        loading={loading}
        itemName={currentScenario?.title || ""}
        itemType="scenario"
        additionalWarning="This will also delete all test steps associated with this scenario."
        onClose={closeDeleteDialog}
        onConfirm={executeDelete}
      />
    </Box>
  );
};

export default ScenarioManager;
