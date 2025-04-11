import React, { memo } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  Button,
  ButtonGroup,
  useTheme,
} from "@mui/material";
import { ExpandMore, Clear, CheckCircleOutline } from "@mui/icons-material";
import {
  TestScenario,
  TestStep,
  TestStepStatus,
} from "../../data/testScenarios";
import TestStepItem from "./TestStepItem";

interface ScenarioProgressProps {
  completion: number;
  passed: number;
  failed: number;
  blocked: number;
  steps: TestStep[];
}

const ScenarioProgress: React.FC<ScenarioProgressProps> = ({
  completion,
  passed,
  failed,
  blocked,
  steps,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
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
              width: `${(passed / steps.length) * 100}%`,
              bgcolor: theme.palette.success.main,
            }}
          />
        )}
        {failed > 0 && (
          <Box
            sx={{
              height: "100%",
              width: `${(failed / steps.length) * 100}%`,
              bgcolor: theme.palette.error.main,
            }}
          />
        )}
        {blocked > 0 && (
          <Box
            sx={{
              height: "100%",
              width: `${(blocked / steps.length) * 100}%`,
              bgcolor: theme.palette.warning.main,
            }}
          />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {completion}% complete
      </Typography>
    </Box>
  );
};

interface ScenarioAccordionProps {
  scenario: TestScenario;
  expanded: boolean;
  stepStatuses: Record<string, TestStepStatus>;
  showExpectedResults: Record<string, boolean>;
  onResetScenario: (scenarioId: string, steps: TestStep[]) => void;
  onToggleAccordion: (scenarioId: string) => void;
  onToggleExpected: (stepId: string) => void;
  onSetStatus: (
    scenarioId: string,
    stepId: string,
    status: TestStepStatus
  ) => void;
  onMarkAllSteps?: (
    scenarioId: string,
    steps: TestStep[],
    status: TestStepStatus
  ) => void;
  getStatusColor: (status: TestStepStatus) => string;
  scenarioProgress: {
    completion: number;
    passed: number;
    failed: number;
    blocked: number;
  };
}

const ScenarioAccordion: React.FC<ScenarioAccordionProps> = ({
  scenario,
  expanded,
  stepStatuses,
  showExpectedResults,
  onResetScenario,
  onToggleAccordion,
  onToggleExpected,
  onSetStatus,
  onMarkAllSteps,
  getStatusColor,
  scenarioProgress,
}) => {
  const theme = useTheme();

  return (
    <Accordion
      expanded={expanded}
      onChange={() => onToggleAccordion(scenario.id)}
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
          backgroundColor: expanded
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

            <ScenarioProgress
              completion={scenarioProgress.completion}
              passed={scenarioProgress.passed}
              failed={scenarioProgress.failed}
              blocked={scenarioProgress.blocked}
              steps={scenario.steps}
            />
          </Box>
        </Box>
      </AccordionSummary>

      {expanded && (
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
          }}
        >
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onResetScenario(scenario.id, scenario.steps);
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

          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllSteps?.(scenario.id, scenario.steps, "pass");
              }}
              color="success"
              startIcon={<CheckCircleOutline fontSize="small" />}
              sx={{
                fontSize: "0.75rem",
                textTransform: "none",
                px: 1.5,
                py: 0.5,
                minHeight: 0,
              }}
            >
              Mark all passed
            </Button>
          </ButtonGroup>
        </Box>
      )}

      <AccordionDetails sx={{ p: 0 }}>
        <List disablePadding>
          {scenario.steps.map((step, index) => {
            const stepKey = `${scenario.id}-${step.id}`;
            const status = stepStatuses[stepKey];
            const showExpected = showExpectedResults[step.id] || false;

            return (
              <TestStepItem
                key={step.id}
                scenario={scenario}
                step={step}
                index={index}
                status={status}
                showExpected={showExpected}
                onToggleExpected={onToggleExpected}
                onSetStatus={onSetStatus}
                getStatusColor={getStatusColor}
              />
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ScenarioAccordion, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.expanded === nextProps.expanded &&
    prevProps.scenarioProgress.completion ===
      nextProps.scenarioProgress.completion &&
    prevProps.scenarioProgress.passed === nextProps.scenarioProgress.passed &&
    prevProps.scenarioProgress.failed === nextProps.scenarioProgress.failed &&
    prevProps.scenarioProgress.blocked === nextProps.scenarioProgress.blocked
  );
});
