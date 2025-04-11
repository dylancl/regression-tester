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
  Tooltip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, ArrowForward } from "@mui/icons-material";
import {
  ScenarioDocument,
  getScenariosForComponent,
  createScenario,
  updateScenario,
  deleteScenario,
} from "../../firebase/firestore";
import { useTheme } from "@mui/material/styles";

interface ScenarioManagerProps {
  componentId: string;
  onSelectScenario: (id: string) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  componentId,
  onSelectScenario,
}) => {
  const theme = useTheme();
  const [scenarios, setScenarios] = useState<ScenarioDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScenario, setCurrentScenario] =
    useState<Partial<ScenarioDocument> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch scenarios when component mounts or componentId changes
  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedScenarios = await getScenariosForComponent(componentId);
        setScenarios(fetchedScenarios);
      } catch (err) {
        console.error("Error fetching scenarios:", err);
        setError("Failed to load scenarios. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (componentId) {
      fetchScenarios();
    }
  }, [componentId]);

  const handleOpenDialog = (scenario?: ScenarioDocument) => {
    if (scenario) {
      setCurrentScenario(scenario);
      setIsEditing(true);
    } else {
      // Calculate next highest order number
      const nextOrder =
        scenarios.length > 0
          ? Math.max(...scenarios.map((s) => s.order)) + 1
          : 0;

      setCurrentScenario({
        scenarioId: `scenario-${Date.now()}`,
        title: "",
        description: "",
        order: nextOrder,
      });
      setIsEditing(false);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentScenario(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setCurrentScenario((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentScenario?.scenarioId) {
      errors.scenarioId = "Scenario ID is required";
    }

    if (!currentScenario?.title) {
      errors.title = "Title is required";
    }

    if (!currentScenario?.description) {
      errors.description = "Description is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentScenario || !validateForm()) return;

    try {
      setLoading(true);

      if (isEditing && currentScenario.id) {
        const { id, createdAt, updatedAt, ...updateData } = currentScenario;
        await updateScenario(componentId, id, updateData);
      } else {
        const { id, createdAt, updatedAt, ...createData } = currentScenario;
        await createScenario(
          componentId,
          createData as Omit<ScenarioDocument, "id" | "createdAt" | "updatedAt">
        );
      }

      // Refresh scenarios list
      const updatedScenarios = await getScenariosForComponent(componentId);
      setScenarios(updatedScenarios);

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving scenario:", error);
      setError("Failed to save scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = (scenario: ScenarioDocument) => {
    setCurrentScenario(scenario);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentScenario?.id) return;

    try {
      setLoading(true);
      await deleteScenario(componentId, currentScenario.id);

      // Refresh scenarios list
      const updatedScenarios = await getScenariosForComponent(componentId);
      setScenarios(updatedScenarios);

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting scenario:", error);
      setError("Failed to delete scenario. Please try again.");
    } finally {
      setLoading(false);
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
          Test Scenarios
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
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
            No scenarios found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add your first scenario to get started
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Scenario
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {scenarios.map((scenario) => (
            <Grid key={scenario.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={1}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[800]
                      : theme.palette.grey[300]
                  }`,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom component="div" noWrap>
                    {scenario.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: "block" }}
                  >
                    ID: {scenario.scenarioId}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3,
                    }}
                  >
                    {scenario.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(scenario)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleConfirmDelete(scenario)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Tooltip title="View Test Steps">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onSelectScenario(scenario.id)}
                    >
                      <ArrowForward fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Scenario Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditing ? "Edit Scenario" : "Add New Scenario"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="scenarioId"
              label="Scenario ID"
              fullWidth
              value={currentScenario?.scenarioId || ""}
              onChange={handleChange}
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
              value={currentScenario?.title || ""}
              onChange={handleChange}
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
              value={currentScenario?.description || ""}
              onChange={handleChange}
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
              value={currentScenario?.order || 0}
              onChange={handleChange}
              helperText="Scenarios are displayed in this order (lower numbers first)"
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
            Are you sure you want to delete the scenario "
            {currentScenario?.title}"? This will also delete all test steps
            associated with this scenario.
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

export default ScenarioManager;
