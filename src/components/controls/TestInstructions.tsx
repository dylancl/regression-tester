import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fab,
  Alert,
  ButtonGroup,
  Badge,
  Drawer,
  Paper,
  Snackbar,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  ExpandMore,
  RadioButtonUnchecked,
  Assignment,
  KeyboardArrowRight,
  KeyboardArrowDown,
  Help,
  FactCheck,
  Edit,
  OpenInNew,
  Check,
  Clear,
  Block,
  ChevronRight,
  FileDownload,
  PhoneIphone,
  Computer,
} from "@mui/icons-material";
import { SelectedOptions } from "../../types";
import {
  TestScenario,
  TestStep,
  getTestScenarios,
  TestStepStatus,
} from "../../data/testScenarios";

// Define the interface for test progress data that will be shared with the sidebar
export interface TestProgressData {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notTested: number;
  completion: number;
}

interface TestInstructionsProps {
  selectedOptions: SelectedOptions;
  onProgressUpdate?: (progressData: TestProgressData) => void;
  handleOptionChange?: (name: string, value: string) => void; // Add option change handler
}

// Simple Table component for the guide dialog
const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => {
  const theme = useTheme();
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          display: "table",
          width: "100%",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          borderCollapse: "collapse",
        }}
      >
        <Box
          sx={{
            display: "table-header-group",
            bgcolor: theme.palette.action.hover,
          }}
        >
          <Box sx={{ display: "table-row" }}>
            {headers.map((header, i) => (
              <Box
                key={i}
                sx={{
                  display: "table-cell",
                  p: 1,
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                {header}
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: "table-row-group" }}>
          {rows.map((row, i) => (
            <Box key={i} sx={{ display: "table-row" }}>
              {row.map((cell, j) => (
                <Box
                  key={j}
                  sx={{
                    display: "table-cell",
                    p: 1,
                    fontSize: "0.75rem",
                    borderTop:
                      i > 0 ? `1px solid ${theme.palette.divider}` : "none",
                  }}
                >
                  {cell}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const TestInstructions: React.FC<TestInstructionsProps> = ({
  selectedOptions,
  onProgressUpdate,
  handleOptionChange, // Add the handler parameter
}) => {
  const theme = useTheme();
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
  const [showGuide, setShowGuide] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Google Sheets URLs
  const sheetsEditUrl = `https://docs.google.com/spreadsheets/d/aaa/edit`;
  const componentsSheetUrl = `${sheetsEditUrl}#gid=0`;
  const stepsSheetUrl = `${sheetsEditUrl}#gid=1`;

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
  }, [selectedOptions, sidebarOpen]);

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
      setTimeout(() => setNotification(null), 2000);
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
  }, []);

  // Handle sidebar open/close
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Get status color
  const getStatusColor = useCallback(
    (status: TestStepStatus) => {
      switch (status) {
        case "pass":
          return theme.palette.success.main;
        case "fail":
          return theme.palette.error.main;
        case "blocked":
          return theme.palette.warning.main;
        default:
          return theme.palette.text.disabled;
      }
    },
    [theme.palette]
  );

  const progressData = useMemo(
    () => calculateTestProgress(scenarios, stepStatuses),
    [scenarios, stepStatuses, calculateTestProgress]
  );

  // Use a separate effect with a stable dependency to report progress updates
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progressData);
    }
  }, [progressData, onProgressUpdate]);

  // Export test results to CSV
  const exportTestResults = useCallback(() => {
    // Current timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `test-results-${selectedOptions.component || "unknown"}-${
      selectedOptions.brand || "unknown"
    }-${selectedOptions.uscContext || "unknown"}-${timestamp}.csv`;

    // CSV header
    let csvContent =
      "Component,Brand,Context,Scenario,StepID,Instruction,Expected Result,Status,Notes\n";

    // Add each test step as a row in the CSV
    scenarios.forEach((scenario) => {
      scenario.steps.forEach((step) => {
        const stepKey = `${scenario.id}-${step.id}`;
        const status = stepStatuses[stepKey] || "not-tested";

        // Escape any commas in the text to prevent CSV misalignment
        const escapeCsvField = (field: string) =>
          `"${field.replace(/"/g, '""')}"`;

        const row = [
          escapeCsvField(selectedOptions.component || "unknown"),
          escapeCsvField(selectedOptions.brand || "unknown"),
          escapeCsvField(selectedOptions.uscContext || "unknown"),
          escapeCsvField(scenario.title),
          escapeCsvField(step.id),
          escapeCsvField(step.instruction),
          escapeCsvField(step.expectedResult),
          escapeCsvField(status),
          '""', // Empty notes field that can be filled manually later
        ].join(",");

        csvContent += row + "\n";
      });
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

  // Render spreadsheet guide dialog
  const renderGuideDialog = useCallback(
    () => (
      <Dialog
        open={showGuide}
        onClose={() => setShowGuide(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>How to Use the Test Scenarios Spreadsheet</DialogTitle>

        <DialogContent>
          <Typography variant="body1" paragraph>
            The test scenarios are managed in Google Sheets using a simple
            two-sheet structure:
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1. Components Sheet
            </Typography>

            <Table
              headers={[
                "ComponentID",
                "Component",
                "Brand",
                "Context",
                "Title",
                "Description",
                "Tags",
              ]}
              rows={[
                [
                  "comp-1",
                  "carFilter",
                  "toyota",
                  "used",
                  "Car Filter Tests",
                  "Tests for the car filter component",
                  "filters,search",
                ],
                [
                  "comp-2",
                  "carDetails",
                  "toyota",
                  "new",
                  "Car Details Tests",
                  "Tests for the car details page",
                  "details,specs",
                ],
              ]}
            />

            <Typography variant="body2" sx={{ mt: 1 }}>
              The Components sheet defines which components you're testing and
              their basic info:
            </Typography>
            <ul>
              <li>
                <strong>ComponentID</strong>: A unique identifier for the
                component (referenced in the Steps sheet)
              </li>
              <li>
                <strong>Component, Brand, Context</strong>: These match the
                selections in the regression tester
              </li>
              <li>
                <strong>Title, Description</strong>: Basic info about what
                you're testing
              </li>
              <li>
                <strong>Tags</strong>: Optional keywords for categorization
              </li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              2. Steps Sheet
            </Typography>

            <Table
              headers={[
                "ComponentID",
                "ScenarioID",
                "StepID",
                "Instruction",
                "ExpectedResult",
                "Status",
              ]}
              rows={[
                [
                  "comp-1",
                  "filtering",
                  "step-1",
                  "Click the filter button",
                  "Filter panel should open",
                  "",
                ],
                [
                  "comp-1",
                  "filtering",
                  "step-2",
                  "Select 'Toyota' from the make dropdown",
                  "Only Toyota cars should be shown",
                  "",
                ],
                [
                  "comp-1",
                  "sorting",
                  "step-1",
                  "Click the 'Sort by' dropdown",
                  "Sorting options should appear",
                  "",
                ],
              ]}
            />

            <Typography variant="body2" sx={{ mt: 1 }}>
              The Steps sheet contains all the test steps:
            </Typography>
            <ul>
              <li>
                <strong>ComponentID</strong>: References the ID from the
                Components sheet
              </li>
              <li>
                <strong>ScenarioID</strong>: Groups related steps together
                (e.g., "filtering" or "sorting")
              </li>
              <li>
                <strong>StepID</strong>: A unique identifier for each step
                within a scenario
              </li>
              <li>
                <strong>Instruction</strong>: What the tester should do
              </li>
              <li>
                <strong>ExpectedResult</strong>: What should happen after
                following the instruction
              </li>
              <li>
                <strong>Status</strong>: Optional field for tracking test status
                (e.g., "pass", "fail", "blocked")
              </li>
            </ul>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => window.open(componentsSheetUrl, "_blank")}
            startIcon={<OpenInNew />}
          >
            Open Components Sheet
          </Button>
          <Button
            onClick={() => window.open(stepsSheetUrl, "_blank")}
            startIcon={<OpenInNew />}
          >
            Open Steps Sheet
          </Button>
          <Button onClick={() => setShowGuide(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    ),
    [showGuide, componentsSheetUrl, stepsSheetUrl]
  );

  // Render test step
  const renderTestStep = useCallback(
    (scenario: TestScenario, step: TestStep, index: number) => {
      const stepKey = `${scenario.id}-${step.id}`;
      const status = stepStatuses[stepKey];
      const showExpected = showExpectedResults[step.id] || false;

      return (
        <ListItem
          key={step.id}
          sx={{
            display: "block",
            py: 1.5,
            px: 2,
            borderBottom:
              index < scenario.steps.length - 1
                ? `1px solid ${theme.palette.divider}`
                : "none",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.01)",
            },
            borderLeft: status ? `3px solid ${getStatusColor(status)}` : "none",
            ml: status ? 0 : "3px", // Maintain alignment when no border
            transition: "all 0.2s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
              {status ? (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: getStatusColor(status),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                    boxShadow: theme.shadows[1],
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {status === "pass" ? (
                    <Check sx={{ fontSize: 16 }} />
                  ) : status === "fail" ? (
                    <Clear sx={{ fontSize: 16 }} />
                  ) : (
                    <Block sx={{ fontSize: 16 }} />
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.palette.text.disabled,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <RadioButtonUnchecked sx={{ fontSize: 16 }} />
                </Box>
              )}
            </ListItemIcon>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 0.5,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    flex: 1,
                    fontWeight: status ? "normal" : "medium",
                    color:
                      status === "blocked"
                        ? theme.palette.text.disabled
                        : "inherit",
                    textDecoration:
                      status === "blocked" ? "line-through" : "none",
                    cursor: "default",
                    transition: "color 0.2s ease",
                    lineHeight: 1.5,
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      mr: 1,
                      color: theme.palette.text.secondary,
                      fontSize: "0.8rem",
                      opacity: 0.7,
                    }}
                  >
                    {index + 1}.
                  </Box>
                  {step.instruction}
                </Typography>

                <Tooltip
                  title={
                    showExpected
                      ? "Hide expected result"
                      : "Show expected result"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() => toggleExpectedResult(step.id)}
                    sx={{
                      ml: 1,
                      mt: -0.5,
                      color: showExpected
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      transition: "all 0.2s ease",
                      backgroundColor: showExpected
                        ? theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.12)"
                            : "rgba(0, 0, 0, 0.08)",
                      },
                    }}
                  >
                    {showExpected ? (
                      <KeyboardArrowDown fontSize="small" />
                    ) : (
                      <KeyboardArrowRight fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              <Collapse in={showExpected}>
                <Box
                  sx={{
                    ml: 0,
                    mt: 1,
                    mb: 1,
                    p: 1.5,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.04)"
                        : "rgba(0, 0, 0, 0.02)",
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    position: "relative",
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor:
                        status === "fail"
                          ? theme.palette.error.main
                          : status === "pass"
                          ? theme.palette.success.main
                          : theme.palette.info.main,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    },
                    boxShadow: theme.shadows[1],
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      mb: 0.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span>Expected Result:</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      color:
                        status === "fail"
                          ? theme.palette.error.main
                          : status === "pass"
                          ? theme.palette.success.main
                          : "inherit",
                      fontStyle: "italic",
                      pl: 0.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.expectedResult}
                  </Typography>
                </Box>
              </Collapse>

              <Box
                sx={{ display: "flex", mt: 1.5, justifyContent: "flex-start" }}
              >
                <ButtonGroup
                  size="small"
                  variant="outlined"
                  sx={{
                    boxShadow: theme.shadows[1],
                    ".MuiButton-root": {
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  <Tooltip title="Mark as Passed">
                    <Button
                      color="success"
                      onClick={() =>
                        setStepStatus(scenario.id, step.id, "pass")
                      }
                      variant={status === "pass" ? "contained" : "outlined"}
                      sx={{
                        minWidth: "40px",
                        px: 1,
                        "&.MuiButton-contained": {
                          boxShadow: theme.shadows[2],
                        },
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: theme.shadows[3],
                        },
                      }}
                    >
                      <Check fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Mark as Failed">
                    <Button
                      color="error"
                      onClick={() =>
                        setStepStatus(scenario.id, step.id, "fail")
                      }
                      variant={status === "fail" ? "contained" : "outlined"}
                      sx={{
                        minWidth: "40px",
                        px: 1,
                        "&.MuiButton-contained": {
                          boxShadow: theme.shadows[2],
                        },
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: theme.shadows[3],
                        },
                      }}
                    >
                      <Clear fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Mark as Blocked">
                    <Button
                      color="warning"
                      onClick={() =>
                        setStepStatus(scenario.id, step.id, "blocked")
                      }
                      variant={status === "blocked" ? "contained" : "outlined"}
                      sx={{
                        minWidth: "40px",
                        px: 1,
                        "&.MuiButton-contained": {
                          boxShadow: theme.shadows[2],
                        },
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: theme.shadows[3],
                        },
                      }}
                    >
                      <Block fontSize="small" />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Box>
            </Box>
          </Box>
        </ListItem>
      );
    },
    [
      stepStatuses,
      showExpectedResults,
      theme,
      getStatusColor,
      toggleExpectedResult,
      setStepStatus,
    ]
  );

  const renderSidebarContent = useCallback(
    () => (
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Assignment color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Test Instructions
            </Typography>
          </Box>

          <Box>
            <Tooltip title="View Spreadsheet Guide">
              <IconButton
                onClick={() => setShowGuide(true)}
                edge="end"
                aria-label="guide"
                size="small"
                sx={{ mr: 1 }}
                color="info"
              >
                <Help fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit in Google Sheets">
              <IconButton
                onClick={() => window.open(sheetsEditUrl, "_blank")}
                edge="end"
                aria-label="edit"
                size="small"
                sx={{ mr: 1 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={toggleSidebar}
              edge="end"
              aria-label="close"
              size="small"
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Component Info */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            {selectedOptions.component} - {selectedOptions.brand}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedOptions.uscContext === "used" ? "Used Cars" : "Stock Cars"}
          </Typography>

          {/* Device Type Toggle */}
          {handleOptionChange && (
            <Box
              sx={{
                mt: 2,
                mb: 1,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.03)",
                borderRadius: 2,
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                >
                  Device Type
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  {selectedOptions.device === "mobile"
                    ? "Mobile test scenarios"
                    : "Desktop test scenarios"}
                </Typography>
              </Box>

              <ToggleButtonGroup
                value={selectedOptions.device || "desktop"}
                exclusive
                onChange={(_e, newDevice) => {
                  if (newDevice !== null && handleOptionChange) {
                    handleOptionChange("device", newDevice);
                    setNotification(`Test scenarios for ${newDevice} view`);
                  }
                }}
                size="small"
                aria-label="device type"
                fullWidth
                sx={{
                  ".MuiToggleButtonGroup-grouped": {
                    borderRadius: "8px !important",
                    border: `1px solid ${theme.palette.divider} !important`,
                    m: 0.5,
                    py: 0.75,
                    flex: 1,
                    "&.Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(25, 118, 210, 0.3)"
                          : "rgba(25, 118, 210, 0.12)",
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 0 8px rgba(25, 118, 210, 0.4)"
                          : "0 0 8px rgba(25, 118, 210, 0.2)",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(25, 118, 210, 0.35)"
                            : "rgba(25, 118, 210, 0.15)",
                      },
                    },
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                      transition: "all 0.2s ease",
                    },
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <ToggleButton value="desktop" aria-label="desktop view">
                  <Computer fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Desktop</Typography>
                </ToggleButton>
                <ToggleButton value="mobile" aria-label="mobile view">
                  <PhoneIphone fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Mobile</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>

        {/* Overall completion */}
        <Box
          sx={{
            padding: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {progressData.completion}% Complete
            </Typography>
          </Box>

          {/* Progress bar */}
          <Box
            sx={{
              height: 8,
              width: "100%",
              bgcolor: theme.palette.grey[200],
              borderRadius: 1,
              overflow: "hidden",
              display: "flex",
            }}
          >
            {progressData.passed > 0 && (
              <Box
                sx={{
                  height: "100%",
                  width: `${(progressData.passed / progressData.total) * 100}%`,
                  bgcolor: theme.palette.success.main,
                }}
              />
            )}
            {progressData.failed > 0 && (
              <Box
                sx={{
                  height: "100%",
                  width: `${(progressData.failed / progressData.total) * 100}%`,
                  bgcolor: theme.palette.error.main,
                }}
              />
            )}
            {progressData.blocked > 0 && (
              <Box
                sx={{
                  height: "100%",
                  width: `${
                    (progressData.blocked / progressData.total) * 100
                  }%`,
                  bgcolor: theme.palette.warning.main,
                }}
              />
            )}
          </Box>

          {/* Status legend */}
          <Box sx={{ display: "flex", mt: 1, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.success.main,
                  mr: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {progressData.passed} Passed
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.error.main,
                  mr: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {progressData.failed} Failed
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.warning.main,
                  mr: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {progressData.blocked} Blocked
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.grey[300],
                  mr: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {progressData.notTested} Not Tested
              </Typography>
            </Box>
          </Box>

          {/* Export button */}
          {scenarios.length > 0 && (
            <Button
              variant="outlined"
              fullWidth
              size="small"
              startIcon={<FileDownload />}
              onClick={exportTestResults}
              sx={{ mt: 2 }}
            >
              Export Results to CSV
            </Button>
          )}
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            height: "calc(100% - 240px)",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 4,
              }}
            >
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading test instructions...
              </Typography>
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 4,
              }}
            >
              <Alert
                severity="error"
                sx={{ mb: 2, width: "100%", maxWidth: 500 }}
              >
                {error}
              </Alert>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: "center" }}
              >
                This could be because the spreadsheet doesn't exist or you don't
                have access to it. Try checking the spreadsheet ID or creating a
                new test scenarios spreadsheet.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowGuide(true)}
                  startIcon={<Help />}
                >
                  View Guide
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => fetchScenarios()}
                >
                  Retry
                </Button>
              </Box>
            </Box>
          ) : scenarios.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 4,
                textAlign: "center",
              }}
            >
              <Assignment
                color="disabled"
                sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}
              />
              <Typography variant="h6" gutterBottom>
                No test scenarios found
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 500 }}
              >
                There are no test scenarios for{" "}
                <strong>
                  {selectedOptions.component} - {selectedOptions.brand} -{" "}
                  {selectedOptions.uscContext}
                </strong>
                . You can add test scenarios in the Google Sheet using our
                two-sheet format.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Help />}
                  onClick={() => setShowGuide(true)}
                >
                  View Guide
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => window.open(sheetsEditUrl, "_blank")}
                >
                  Edit Test Scenarios
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ pb: 4 }}>
              {/* Test scenarios */}
              {scenarios.map((scenario) => {
                const { completion, passed, failed, blocked } =
                  getScenarioProgress(scenario.id, scenario.steps);
                const isExpanded = expandedScenario === scenario.id;

                return (
                  <Accordion
                    key={scenario.id}
                    expanded={isExpanded}
                    onChange={() => handleAccordionChange(scenario.id)}
                    disableGutters
                    elevation={0}
                    sx={{
                      "&:before": { display: "none" },
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        px: 3,
                        minHeight: "56px !important",
                        backgroundColor: isExpanded
                          ? theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.04)"
                          : "transparent",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {scenario.title}
                          </Typography>

                          {/* Scenario progress indicators */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                height: 4,
                                width: 60,
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.1)",
                                borderRadius: 1,
                                mr: 1,
                                overflow: "hidden",
                                display: "flex",
                              }}
                            >
                              {passed > 0 && (
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${
                                      (passed / scenario.steps.length) * 100
                                    }%`,
                                    bgcolor: theme.palette.success.main,
                                  }}
                                />
                              )}
                              {failed > 0 && (
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${
                                      (failed / scenario.steps.length) * 100
                                    }%`,
                                    bgcolor: theme.palette.error.main,
                                  }}
                                />
                              )}
                              {blocked > 0 && (
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${
                                      (blocked / scenario.steps.length) * 100
                                    }%`,
                                    bgcolor: theme.palette.warning.main,
                                  }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {completion}% complete
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    {isExpanded && (
                      <Box
                        sx={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.04)"
                              : "rgba(0, 0, 0, 0.02)",
                          display: "flex",
                          justifyContent: "flex-start",
                          px: 3,
                          py: 1.5,
                        }}
                      >
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetScenario(scenario.id, scenario.steps);
                          }}
                          variant="outlined"
                          color="inherit"
                          startIcon={<Clear fontSize="small" />}
                          sx={{
                            fontSize: "0.75rem",
                            borderRadius: 1,
                            textTransform: "none",
                            px: 1.5,
                            py: 0.5,
                            minHeight: 0,
                            minWidth: 0,
                            "&:hover": {
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.08)",
                            },
                          }}
                        >
                          Reset all steps
                        </Button>
                      </Box>
                    )}

                    <AccordionDetails sx={{ p: 0 }}>
                      <List disablePadding>
                        {scenario.steps.map((step, index) =>
                          renderTestStep(scenario, step, index)
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </Box>
      </>
    ),
    [
      theme,
      expandedScenario,
      loading,
      error,
      scenarios,
      selectedOptions,
      progressData,
      sheetsEditUrl,
      fetchScenarios,
      getScenarioProgress,
      handleAccordionChange,
      renderTestStep,
      resetScenario,
      toggleSidebar,
      exportTestResults,
    ]
  );

  return (
    <>
      <Drawer
        anchor="right"
        variant={isMobile ? "temporary" : "persistent"}
        open={sidebarOpen}
        onClose={toggleSidebar}
        sx={{
          width: sidebarOpen ? { xs: "100%", sm: 420 } : 0,
          flexShrink: 0,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 420 },
            maxWidth: "100%",
            height: "100%",
            boxSizing: "border-box",
            position: isMobile ? "fixed" : "relative",
            borderLeft: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
        PaperProps={{
          elevation: 3,
        }}
      >
        {renderSidebarContent()}

        {renderGuideDialog()}

        <Snackbar
          open={!!notification}
          autoHideDuration={2000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ zIndex: 1500 }}
        >
          <Paper
            elevation={2}
            sx={{
              px: 2,
              py: 1,
              bgcolor: theme.palette.background.paper,
              borderLeft: "4px solid",
              borderColor: "primary.main",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">{notification}</Typography>
          </Paper>
        </Snackbar>
      </Drawer>

      {!sidebarOpen && (
        <Tooltip title="Show Test Instructions">
          <Fab
            color="primary"
            aria-label="test instructions"
            onClick={toggleSidebar}
            size="medium"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Badge
              badgeContent={progressData.completion + "%"}
              color={progressData.failed > 0 ? "error" : "success"}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  minWidth: "32px",
                  height: "20px",
                  padding: "0 4px",
                },
              }}
            >
              <FactCheck />
            </Badge>
          </Fab>
        </Tooltip>
      )}
    </>
  );
};

export default TestInstructions;
