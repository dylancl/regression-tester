import { useState } from "react";
import { TestStepDocument } from "../firebase/firestore";

export interface FormErrors {
  stepId?: string;
  instruction?: string;
  expectedResult?: string;
}

interface UseTestStepForm {
  currentStep: Partial<TestStepDocument> | null;
  setCurrentStep: React.Dispatch<
    React.SetStateAction<Partial<TestStepDocument> | null>
  >;
  isEditing: boolean;
  formErrors: FormErrors;
  dialogOpen: boolean;
  openCreateDialog: (defaultValues: Partial<TestStepDocument>) => void;
  openEditDialog: (step: TestStepDocument) => void;
  closeDialog: () => void;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => void;
  validateForm: () => boolean;
  setDeviceType: (isMobile: boolean) => void;
}

export const useTestStepForm = (): UseTestStepForm => {
  const [currentStep, setCurrentStep] =
    useState<Partial<TestStepDocument> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const openCreateDialog = (defaultValues: Partial<TestStepDocument>) => {
    setCurrentStep(defaultValues);
    setIsEditing(false);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (step: TestStepDocument) => {
    setCurrentStep(step);
    setIsEditing(true);
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCurrentStep(null);
  };

  const handleFormChange = (
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
    const errors: FormErrors = {};

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

  const setDeviceType = (isMobile: boolean) => {
    setCurrentStep((prev) => ({
      ...prev,
      device: isMobile ? "mobile" : "desktop",
    }));
  };

  return {
    currentStep,
    setCurrentStep,
    isEditing,
    formErrors,
    dialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormChange,
    validateForm,
    setDeviceType,
  };
};

export default useTestStepForm;
