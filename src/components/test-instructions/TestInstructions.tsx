import React, { useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Fab,
  Badge,
  Drawer,
  Paper,
  Snackbar,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Assignment,
  ChevronRight,
  FactCheck,
  PhoneIphone,
  Computer,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { SelectedOptions } from "../../types";
import { TestStepStatus } from "../../data/testScenarios";
import { useTestInstructions } from "../../hooks/useTestInstructions";
import ScenarioAccordion from "./ScenarioAccordion";
import TestProgressSummary from "./TestProgressSummary";
import { EmptyState, LoadingState, ErrorState } from "./TestStates";

interface TestInstructionsProps {
  selectedOptions: SelectedOptions;
  onProgressUpdate?: (progressData: any) => void;
  handleOptionChange?: (name: string, value: string) => void;
}

const TestInstructions: React.FC<TestInstructionsProps> = ({
  selectedOptions,
  onProgressUpdate,
  handleOptionChange,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
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
    markAllSteps, // Add the optimized batch operation
    resetScenario,
    exportTestResults,
    getScenarioProgress,
    fetchScenarios,
    setNotification,
  } = useTestInstructions({ selectedOptions, onProgressUpdate });

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

  // Navigate to test case management
  const navigateToTestCaseManagement = useCallback(() => {
    navigate("/test-case-management");
  }, [navigate]);

  // Render sidebar content
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
        <TestProgressSummary
          progressData={progressData}
          onExportResults={exportTestResults}
          hasScenarios={scenarios.length > 0}
        />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            height: "calc(100% - 240px)",
          }}
        >
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              error={error}
              onRetry={fetchScenarios}
              onManageTestCases={navigateToTestCaseManagement}
            />
          ) : scenarios.length === 0 ? (
            <EmptyState
              selectedOptions={selectedOptions}
              onManageTestCases={navigateToTestCaseManagement}
            />
          ) : (
            <Box sx={{ pb: 4 }}>
              {/* Test scenarios */}
              {scenarios.map((scenario) => {
                const scenarioProgress = getScenarioProgress(
                  scenario.id,
                  scenario.steps
                );
                const isExpanded = expandedScenario === scenario.id;

                return (
                  <ScenarioAccordion
                    key={scenario.id}
                    scenario={scenario}
                    expanded={isExpanded}
                    stepStatuses={stepStatuses}
                    showExpectedResults={showExpectedResults}
                    onResetScenario={resetScenario}
                    onToggleAccordion={handleAccordionChange}
                    onToggleExpected={toggleExpectedResult}
                    onSetStatus={setStepStatus}
                    onMarkAllSteps={markAllSteps} // Add the batch operation capability
                    getStatusColor={getStatusColor}
                    scenarioProgress={scenarioProgress}
                  />
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
      stepStatuses,
      showExpectedResults,
      handleAccordionChange,
      resetScenario,
      toggleSidebar,
      exportTestResults,
      getScenarioProgress,
      toggleExpectedResult,
      setStepStatus,
      getStatusColor,
      fetchScenarios,
      navigateToTestCaseManagement,
      handleOptionChange,
      setNotification,
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
