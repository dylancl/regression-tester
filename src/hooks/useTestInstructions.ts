import { useState, useEffect, useCallback, useMemo } from "react";
import { SelectedOptions } from "../types";
import {
  TestScenario,
  TestStep,
  getTestScenarios,
  TestStepStatus,
} from "../data/testScenarios";
import Papa from "papaparse";

// Define the interface for test progress data
export interface TestProgressData {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notTested: number;
  completion: number;
}

export interface UseTestInstructionsProps {
  selectedOptions: SelectedOptions;
  onProgressUpdate?: (progressData: TestProgressData) => void;
}

export const useTestInstructions = ({
  selectedOptions,
  onProgressUpdate,
}: UseTestInstructionsProps) => {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, TestStepStatus>
  >({});
  const [showExpectedResults, setShowExpectedResults] = useState<
    Record<string, boolean>
  >({});
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Clear notification after timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch test scenarios when component mounts or selected options change
  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedScenarios = await getTestScenarios(selectedOptions);
      console.log("Fetched scenarios:", fetchedScenarios);
      setScenarios(fetchedScenarios);
    } catch (err) {
      console.error("Failed to fetch test scenarios:", err);
      setError("Failed to load test instructions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [selectedOptions]);

  useEffect(() => {
    if (!sidebarOpen) return;
    fetchScenarios();
  }, [fetchScenarios, sidebarOpen]);

  const calculateTestProgress = useCallback(
    (
      scenarios: TestScenario[],
      statuses: Record<string, TestStepStatus>
    ): TestProgressData => {
      let total = 0;
      let passed = 0;
      let failed = 0;
      let blocked = 0;

      scenarios.forEach((scenario) => {
        scenario.steps.forEach((step) => {
          total++;
          const stepKey = `${scenario.id}-${step.id}`;
          const status = statuses[stepKey];

          if (status === "pass") passed++;
          else if (status === "fail") failed++;
          else if (status === "blocked") blocked++;
        });
      });

      const notTested = total - passed - failed - blocked;
      const completion =
        total === 0
          ? 0
          : Math.round(((passed + failed + blocked) / total) * 100);

      return {
        total,
        passed,
        failed,
        blocked,
        notTested,
        completion,
      };
    },
    []
  );

  const getScenarioProgress = useCallback(
    (
      scenarioId: string,
      steps: TestStep[]
    ): {
      completion: number;
      passed: number;
      failed: number;
      blocked: number;
    } => {
      if (steps.length === 0)
        return { completion: 0, passed: 0, failed: 0, blocked: 0 };

      let tested = 0;
      let passed = 0;
      let failed = 0;
      let blocked = 0;

      steps.forEach((step) => {
        const stepKey = `${scenarioId}-${step.id}`;
        const status = stepStatuses[stepKey];

        if (status) {
          tested++;
          if (status === "pass") passed++;
          else if (status === "fail") failed++;
          else if (status === "blocked") blocked++;
        }
      });

      const completion = Math.round((tested / steps.length) * 100);

      return {
        completion,
        passed,
        failed,
        blocked,
      };
    },
    [stepStatuses]
  );

  // Set step status (pass/fail/blocked)
  const setStepStatus = useCallback(
    (scenarioId: string, stepId: string, status: TestStepStatus) => {
      const stepKey = `${scenarioId}-${stepId}`;

      setStepStatuses((prev) => {
        // If clicking the same status again, clear the status
        if (prev[stepKey] === status) {
          const newStatuses = { ...prev };
          delete newStatuses[stepKey];
          return newStatuses;
        }

        // Otherwise set the new status
        return {
          ...prev,
          [stepKey]: status,
        };
      });

      // Show notification
      setNotification(
        `Step ${
          status === "pass"
            ? "passed"
            : status === "fail"
            ? "failed"
            : "blocked"
        }`
      );
    },
    []
  );

  // Mark all steps in a scenario with the same status (batch operation)
  const markAllSteps = useCallback(
    (scenarioId: string, steps: TestStep[], status: TestStepStatus) => {
      setStepStatuses((prev) => {
        // Create new statuses object
        const newStatuses = { ...prev };

        // Update all steps in the scenario
        steps.forEach((step) => {
          const stepKey = `${scenarioId}-${step.id}`;
          // Only update if status is different (to avoid unnecessary updates)
          if (prev[stepKey] !== status) {
            newStatuses[stepKey] = status;
          }
        });

        return newStatuses;
      });

      // Show notification
      setNotification(
        `All steps marked as ${
          status === "pass"
            ? "passed"
            : status === "fail"
            ? "failed"
            : "blocked"
        }`
      );
    },
    []
  );

  const toggleExpectedResult = useCallback((stepId: string) => {
    setShowExpectedResults((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  }, []);

  const handleAccordionChange = useCallback((scenarioId: string) => {
    setExpandedScenario((prev) => (prev === scenarioId ? null : scenarioId));
  }, []);

  const resetScenario = useCallback((scenarioId: string, steps: TestStep[]) => {
    setStepStatuses((prev) => {
      const newStepStatuses = { ...prev };
      steps.forEach((step) => {
        const key = `${scenarioId}-${step.id}`;
        delete newStepStatuses[key];
      });
      return newStepStatuses;
    });

    // Add notification for better UX
    setNotification("Reset all steps in this scenario");
  }, []);

  // Handle sidebar open/close
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Export test results to CSV
  const exportTestResults = useCallback(() => {
    // Current timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `test-results-${selectedOptions.component || "unknown"}-${
      selectedOptions.brand || "unknown"
    }-${selectedOptions.uscContext || "unknown"}-${timestamp}.csv`;

    // Prepare data for CSV export
    const csvData = [];

    // Add header row
    csvData.push([
      "Component",
      "Brand",
      "Context",
      "Scenario",
      "StepID",
      "Instruction",
      "Expected Result",
      "Status",
      "Notes",
    ]);

    // Add each test step as a row in the CSV
    scenarios.forEach((scenario) => {
      scenario.steps.forEach((step) => {
        const stepKey = `${scenario.id}-${step.id}`;
        const status = stepStatuses[stepKey] || "not-tested";

        csvData.push([
          selectedOptions.component || "unknown",
          selectedOptions.brand || "unknown",
          selectedOptions.uscContext || "unknown",
          scenario.title,
          step.id,
          step.instruction,
          step.expectedResult,
          status,
          "", // Empty notes field that can be filled manually later
        ]);
      });
    });

    // Use PapaParser to convert to CSV
    const csvContent = Papa.unparse(csvData, {
      quotes: true, // Use quotes around all fields
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ",",
      header: false, // We're manually adding the header row
      newline: "\n",
    });

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a download link and trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification(`Exported results to ${fileName}`);
  }, [scenarios, stepStatuses, selectedOptions]);

  const progressData = useMemo(
    () => calculateTestProgress(scenarios, stepStatuses),
    [scenarios, stepStatuses, calculateTestProgress]
  );

  // Report progress updates
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progressData);
    }
  }, [progressData, onProgressUpdate]);

  return {
    expandedScenario,
    stepStatuses,
    showExpectedResults,
    scenarios,
    loading,
    sidebarOpen,
    error,
    notification,
    progressData,
    toggleSidebar,
    toggleExpectedResult,
    handleAccordionChange,
    setStepStatus,
    markAllSteps,
    resetScenario,
    exportTestResults,
    getScenarioProgress,
    fetchScenarios,
    setNotification,
  };
};
