import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import ComponentManager from "./test-management/components/ComponentManager";
import ScenarioManager from "./test-management/scenarios/ScenarioManager";
import TestStepManager from "./test-management/test-steps/TestStepManager";
import useTestCaseManagement from "../hooks/useTestCaseManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-management-tabpanel-${index}`}
      aria-labelledby={`test-management-tab-${index}`}
      {...other}
      style={{ height: "100%" }}
    >
      {value === index && <Box sx={{ p: 3, height: "100%" }}>{children}</Box>}
    </div>
  );
}

const TestCaseManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const {
    components,
    loading,
    error,
    selectedComponentId,
    selectedScenarioId,
    setSelectedComponentId,
    setSelectedScenarioId,
    refreshComponents,
  } = useTestCaseManagement();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        pt: 2,
        pb: 4,
        px: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test Case Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage test components, scenarios, and test cases
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="test case management tabs"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Components" />
            <Tab label="Scenarios" disabled={!selectedComponentId} />
            <Tab label="Test Cases" disabled={!selectedScenarioId} />
          </Tabs>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <ComponentManager
                components={components}
                onSelectComponent={(id) => {
                  setSelectedComponentId(id);
                  setTabValue(1); // Switch to Scenarios tab
                }}
                onComponentsChange={refreshComponents}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {selectedComponentId && (
                <ScenarioManager
                  componentId={selectedComponentId}
                  onSelectScenario={(id) => {
                    setSelectedScenarioId(id);
                    setTabValue(2); // Switch to Test Cases tab
                  }}
                />
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {selectedComponentId && selectedScenarioId && (
                <TestStepManager
                  componentId={selectedComponentId}
                  scenarioId={selectedScenarioId}
                />
              )}
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default TestCaseManagement;
