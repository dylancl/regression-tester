import { useState, useEffect, useCallback } from "react";
import { ComponentDocument, getAllComponents } from "../firebase/firestore";

interface UseTestCaseManagementReturn {
  components: ComponentDocument[];
  loading: boolean;
  error: string | null;
  selectedComponentId: string | null;
  selectedScenarioId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  setSelectedScenarioId: (id: string | null) => void;
  refreshComponents: () => Promise<void>;
}

/**
 * Custom hook for managing test case management state
 */
export default function useTestCaseManagement(): UseTestCaseManagementReturn {
  const [components, setComponents] = useState<ComponentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null
  );

  // Reset scenario selection when component changes
  useEffect(() => {
    setSelectedScenarioId(null);
  }, [selectedComponentId]);

  // Fetch all components on initial load
  const refreshComponents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedComponents = await getAllComponents();
      setComponents(fetchedComponents);
    } catch (err) {
      console.error("Failed to fetch components:", err);
      setError("Failed to load components. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load components on initial render
  useEffect(() => {
    refreshComponents();
  }, [refreshComponents]);

  return {
    components,
    loading,
    error,
    selectedComponentId,
    selectedScenarioId,
    setSelectedComponentId,
    setSelectedScenarioId,
    refreshComponents,
  };
}
