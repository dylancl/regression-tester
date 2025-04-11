import React, { useEffect, useState } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Print, ArrowBack } from "@mui/icons-material";
import PrintableTestReport from "./PrintableTestReport";
import { SelectedOptions } from "../../types";
import { TestStepStatus, TestScenario } from "../../data/testScenarios";
import { TestProgressData } from "../../hooks/useTestInstructions";

const PrintableReportPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    component: "",
    brand: "",
    uscContext: "",
    testType: "",
    testStatus: "",
    testDate: "",
  });
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, TestStepStatus>
  >({});
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [progressData, setProgressData] = useState<TestProgressData>({
    total: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    notTested: 0,
    completion: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process data passed from TestInstructions via location.state
  useEffect(() => {
    setLoading(true);

    console.log("Location state:", location.state);

    try {
      if (location.state?.selectedOptions) {
        setSelectedOptions(location.state.selectedOptions);
      } else {
        setError("No selected options provided");
      }

      if (location.state?.stepStatuses) {
        setStepStatuses(location.state.stepStatuses);
      }

      if (location.state?.scenarios) {
        setScenarios(location.state.scenarios);
      } else {
        setError("No test scenarios provided");
      }

      if (location.state?.progressData) {
        setProgressData(location.state.progressData);
      }
    } catch (err) {
      console.error("Error processing report data:", err);
      setError("Failed to process report data");
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  // Function to trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Function to go back
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "@media print": {
            display: "none", // Hide controls when printing
          },
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h6">Test Report</Typography>
        <Button
          startIcon={<Print />}
          onClick={handlePrint}
          variant="contained"
          color="primary"
        >
          Print / Export PDF
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading test data...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      ) : scenarios.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>
            No test scenarios found for the selected options.
          </Typography>
          <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      ) : (
        <PrintableTestReport
          selectedOptions={selectedOptions}
          scenarios={scenarios}
          stepStatuses={stepStatuses}
          progressData={progressData}
        />
      )}
    </Container>
  );
};

export default PrintableReportPage;
