import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { TestScenario, TestStepStatus } from "../../data/testScenarios";
import { SelectedOptions } from "../../types";
import { TestProgressData } from "../../hooks/useTestInstructions";

interface PrintableTestReportProps {
  selectedOptions: SelectedOptions;
  scenarios: TestScenario[];
  stepStatuses: Record<string, TestStepStatus>;
  progressData: TestProgressData;
}

const PrintableTestReport: React.FC<PrintableTestReportProps> = ({
  selectedOptions,
  scenarios,
  stepStatuses,
  progressData,
}) => {
  const theme = useTheme();
  const currentDate = new Date().toLocaleDateString();

  // Function to get the status display text
  const getStatusText = (status: TestStepStatus | undefined): string => {
    if (!status) return "Not Tested";
    switch (status) {
      case "pass":
        return "Passed";
      case "fail":
        return "Failed";
      case "blocked":
        return "Blocked";
      default:
        return "Not Tested";
    }
  };

  // Function to get the color for status
  const getStatusColor = (status: TestStepStatus | undefined): string => {
    if (!status) return theme.palette.text.disabled;
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
  };

  // Handle case where selectedOptions might be null
  if (!selectedOptions) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography color="error">Missing test configuration data</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        height: { xs: "auto", md: "calc(100vh - 80px)" },
        overflow: "auto",
        "@media print": {
          height: "initial",
          overflow: "visible",
          display: "block",
          width: "100%",
          maxWidth: "100%",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          "@media print": {
            boxShadow: "none",
            border: "none",
          },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Test Report
            </Typography>
            <Typography variant="subtitle1">
              {selectedOptions.component} - {selectedOptions.brand}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`${selectedOptions.uscContext} - ${selectedOptions.environment}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Device Type:{" "}
              {selectedOptions.device === "mobile" ? "Mobile" : "Desktop"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              Generated on: {currentDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completion: {progressData.completion}%
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 1,
                justifyContent: "flex-end",
              }}
            >
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
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Test Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Test Progress Summary
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                height: 12,
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
                    width: `${
                      (progressData.passed / progressData.total) * 100
                    }%`,
                    bgcolor: theme.palette.success.main,
                  }}
                />
              )}
              {progressData.failed > 0 && (
                <Box
                  sx={{
                    height: "100%",
                    width: `${
                      (progressData.failed / progressData.total) * 100
                    }%`,
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
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Total test steps: {progressData.total}
            </Typography>
            <Typography variant="body1">
              Completion rate: {progressData.completion}%
            </Typography>
          </Box>

          <Table size="small" sx={{ mb: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell align="center">Count</TableCell>
                <TableCell align="center">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: theme.palette.success.main,
                        mr: 1,
                      }}
                    />
                    Passed
                  </Box>
                </TableCell>
                <TableCell align="center">{progressData.passed}</TableCell>
                <TableCell align="center">
                  {progressData.total > 0
                    ? `${Math.round(
                        (progressData.passed / progressData.total) * 100
                      )}%`
                    : "0%"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: theme.palette.error.main,
                        mr: 1,
                      }}
                    />
                    Failed
                  </Box>
                </TableCell>
                <TableCell align="center">{progressData.failed}</TableCell>
                <TableCell align="center">
                  {progressData.total > 0
                    ? `${Math.round(
                        (progressData.failed / progressData.total) * 100
                      )}%`
                    : "0%"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: theme.palette.warning.main,
                        mr: 1,
                      }}
                    />
                    Blocked
                  </Box>
                </TableCell>
                <TableCell align="center">{progressData.blocked}</TableCell>
                <TableCell align="center">
                  {progressData.total > 0
                    ? `${Math.round(
                        (progressData.blocked / progressData.total) * 100
                      )}%`
                    : "0%"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: theme.palette.grey[300],
                        mr: 1,
                      }}
                    />
                    Not Tested
                  </Box>
                </TableCell>
                <TableCell align="center">{progressData.notTested}</TableCell>
                <TableCell align="center">
                  {progressData.total > 0
                    ? `${Math.round(
                        (progressData.notTested / progressData.total) * 100
                      )}%`
                    : "0%"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Test Scenarios */}
        <Box sx={{ mb: 4 }} data-testid="test-scenarios">
          <Typography variant="h6" gutterBottom>
            Test Scenarios Details
          </Typography>

          {scenarios.map((scenario) => (
            <Box
              key={scenario.id}
              sx={{ mb: 4 }}
              data-scenario={scenario.id}
              className="scenario-container"
            >
              <Typography
                variant="subtitle1"
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  borderRadius: 1,
                  fontWeight: "medium",
                }}
              >
                {scenario.title}
              </Typography>

              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">Step</TableCell>
                    <TableCell width="35%">Instruction</TableCell>
                    <TableCell width="35%">Expected Result</TableCell>
                    <TableCell width="15%">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scenario.steps.map((step, index) => {
                    const stepKey = `${scenario.id}-${step.id}`;
                    const status = stepStatuses[stepKey];
                    return (
                      <TableRow key={step.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell
                          sx={{
                            color:
                              status === "blocked"
                                ? theme.palette.text.disabled
                                : "inherit",
                            textDecoration:
                              status === "blocked" ? "line-through" : "none",
                          }}
                        >
                          {step.instruction}
                        </TableCell>
                        <TableCell>{step.expectedResult}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: getStatusColor(status),
                            }}
                          >
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: getStatusColor(status),
                                mr: 1,
                              }}
                            />
                            {getStatusText(status)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 6 }}>
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Generated with Regression Tester
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentDate}
            </Typography>
          </Box>
        </Box>

        {/* Print-specific styling */}
        <style>
          {`
          @page {
            size: auto;
            margin: 10mm;
          }

          @media print {
            html, body {
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              width: 100% !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              position: relative;
              display: block;
              background-color: ${theme.palette.background.paper} !important;
            }

            #app-bar {
              display: none !important;
          }
            
            /* Container should be full width */
            .MuiContainer-root {
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
              overflow: visible !important;
              position: relative;
              display: block;
              float: none;
            }
            
            /* Critical: Force each scenario to be considered separately for pagination */
            
            /* Each major section should be considered for page breaks */
            .MuiBox-root {
              page-break-inside: auto;
              break-inside: auto;
              position: relative;
              overflow: visible !important;
            }


          }
          `}
        </style>
      </Paper>
    </Container>
  );
};

export default PrintableTestReport;
