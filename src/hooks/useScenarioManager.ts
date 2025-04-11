import { useState, useEffect } from "react";
import {
  ScenarioDocument,
  getScenariosForComponent,
  createScenario,
  updateScenario,
  deleteScenario,
} from "../firebase/firestore";

interface FormErrors {
  [key: string]: string;
}

interface UseScenarioManagerReturn {
  scenarios: ScenarioDocument[];
  loading: boolean;
  error: string | null;
  currentScenario: Partial<ScenarioDocument> | null;
  formErrors: FormErrors;
  dialogOpen: boolean;
  isEditing: boolean;
  deleteDialogOpen: boolean;
  openDialog: (scenario?: ScenarioDocument) => void;
  closeDialog: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => void;
  saveScenario: () => Promise<void>;
  confirmDelete: (scenario: ScenarioDocument) => void;
  closeDeleteDialog: () => void;
  executeDelete: () => Promise<void>;
  refreshScenarios: () => Promise<void>;
}

export const useScenarioManager = (
  componentId: string
): UseScenarioManagerReturn => {
  const [scenarios, setScenarios] = useState<ScenarioDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScenario, setCurrentScenario] =
    useState<Partial<ScenarioDocument> | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const refreshScenarios = async () => {
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

  // Fetch scenarios when component mounts or componentId changes
  useEffect(() => {
    if (componentId) {
      refreshScenarios();
    }
  }, [componentId]);

  const openDialog = (scenario?: ScenarioDocument) => {
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

  const closeDialog = () => {
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
    const errors: FormErrors = {};

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

  const saveScenario = async () => {
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

      await refreshScenarios();
      closeDialog();
    } catch (error) {
      console.error("Error saving scenario:", error);
      setError("Failed to save scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (scenario: ScenarioDocument) => {
    setCurrentScenario(scenario);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const executeDelete = async () => {
    if (!currentScenario?.id) return;

    try {
      setLoading(true);
      await deleteScenario(componentId, currentScenario.id);
      await refreshScenarios();
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting scenario:", error);
      setError("Failed to delete scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
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
    refreshScenarios,
  };
};
