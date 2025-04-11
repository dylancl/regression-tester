import { useState, useEffect } from "react";
import {
  TestStepDocument,
  getTestStepsForScenario,
  createTestStep,
  updateTestStep,
  deleteTestStep,
} from "../firebase/firestore";

export interface UseTestStepsProps {
  componentId: string;
  scenarioId: string;
}

export const useTestSteps = ({
  componentId,
  scenarioId,
}: UseTestStepsProps) => {
  const [testSteps, setTestSteps] = useState<TestStepDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Fetch test steps when component mounts or IDs change
  useEffect(() => {
    fetchTestSteps();
  }, [componentId, scenarioId]);

  const fetchTestSteps = async () => {
    if (!componentId || !scenarioId) return;

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

  const addTestStep = async (
    stepData: Omit<TestStepDocument, "id" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    setError(null);
    try {
      await createTestStep(componentId, scenarioId, stepData);
      await fetchTestSteps();
      return true;
    } catch (err) {
      console.error("Error creating test step:", err);
      setError("Failed to create test step. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editTestStep = async (
    stepId: string,
    stepData: Partial<TestStepDocument>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updateTestStep(componentId, scenarioId, stepId, stepData);
      await fetchTestSteps();
      return true;
    } catch (err) {
      console.error("Error updating test step:", err);
      setError("Failed to update test step. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeTestStep = async (stepId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTestStep(componentId, scenarioId, stepId);
      await fetchTestSteps();
      return true;
    } catch (err) {
      console.error("Error deleting test step:", err);
      setError("Failed to delete test step. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reorderSteps = async (reorderedSteps: TestStepDocument[]) => {
    setReordering(true);
    setError(null);
    try {
      // Update order property for all steps (gives them evenly spaced numbers)
      const updatedPromises = reorderedSteps.map((step, index) => {
        const newOrder = (index + 1) * 10;
        return updateTestStep(componentId, scenarioId, step.id, {
          order: newOrder,
        });
      });

      await Promise.all(updatedPromises);
      await fetchTestSteps();
      return true;
    } catch (err) {
      console.error("Error updating test step order:", err);
      setError("Failed to update step order. Please try again.");
      return false;
    } finally {
      setReordering(false);
    }
  };

  const getNextStepDefaults = () => {
    // Calculate next step ID and order
    const nextStepNumber = testSteps.length + 1;
    const nextOrder =
      testSteps.length > 0
        ? Math.max(...testSteps.map((s) => s.order)) + 10
        : 0;

    return {
      stepId: `step-${nextStepNumber}`,
      instruction: "",
      expectedResult: "",
      order: nextOrder,
      device: "desktop",
    };
  };

  return {
    testSteps,
    loading,
    error,
    reordering,
    fetchTestSteps,
    addTestStep,
    editTestStep,
    removeTestStep,
    reorderSteps,
    getNextStepDefaults,
  };
};

export default useTestSteps;
