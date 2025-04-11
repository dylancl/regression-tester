import { useState } from "react";
import {
  ComponentDocument,
  createComponent,
  updateComponent,
} from "../firebase/firestore";
import { SelectChangeEvent } from "@mui/material";

interface UseComponentFormReturn {
  currentComponent: Partial<ComponentDocument> | null;
  isEditing: boolean;
  formErrors: Record<string, string>;
  dialogOpen: boolean;
  handleOpenDialog: (component?: ComponentDocument) => void;
  handleCloseDialog: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (
    e: SelectChangeEvent<string>,
    _: React.ReactNode
  ) => void;
  handleTagsChange: (e: SelectChangeEvent<string[]>) => void;
  handleDeviceChange: (checked: boolean) => void;
  handleSave: () => Promise<void>;
  validateForm: () => boolean;
}

/**
 * Custom hook for managing component form state and operations
 */
export const useComponentForm = (
  onSuccess: () => void
): UseComponentFormReturn => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentComponent, setCurrentComponent] =
    useState<Partial<ComponentDocument> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenDialog = (component?: ComponentDocument) => {
    if (component) {
      setCurrentComponent(component);
      setIsEditing(true);
    } else {
      setCurrentComponent({
        componentId: `comp-${Date.now()}`,
        component: "",
        brand: "toyota",
        context: "used",
        title: "",
        description: "",
        tags: [],
        device: "desktop",
      });
      setIsEditing(false);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentComponent(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setCurrentComponent((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (
    e: SelectChangeEvent<string>,
    _: React.ReactNode
  ) => {
    const name = e.target.name as string;
    setCurrentComponent((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  const handleTagsChange = (e: SelectChangeEvent<string[]>) => {
    setCurrentComponent((prev) => ({
      ...prev,
      tags: e.target.value as string[],
    }));
  };

  const handleDeviceChange = (checked: boolean) => {
    setCurrentComponent((prev) => ({
      ...prev,
      device: checked ? "mobile" : "desktop",
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentComponent?.component) {
      errors.component = "Component name is required";
    }

    if (!currentComponent?.title) {
      errors.title = "Title is required";
    }

    if (!currentComponent?.description) {
      errors.description = "Description is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentComponent || !validateForm()) return;

    try {
      if (isEditing && currentComponent.id) {
        const { id, createdAt, updatedAt, ...updateData } = currentComponent;
        await updateComponent(id, updateData);
      } else {
        const { id, createdAt, updatedAt, ...createData } = currentComponent;
        await createComponent(
          createData as Omit<
            ComponentDocument,
            "id" | "createdAt" | "updatedAt"
          >
        );
      }

      handleCloseDialog();
      onSuccess();
    } catch (error) {
      console.error("Error saving component:", error);
    }
  };

  return {
    currentComponent,
    isEditing,
    formErrors,
    dialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleChange,
    handleSelectChange,
    handleTagsChange,
    handleDeviceChange,
    handleSave,
    validateForm,
  };
};
