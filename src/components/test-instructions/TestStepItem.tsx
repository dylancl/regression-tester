import React, { memo } from "react";
import {
  Box,
  Typography,
  ListItem,
  ListItemIcon,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  ButtonGroup,
  useTheme,
} from "@mui/material";
import {
  RadioButtonUnchecked,
  KeyboardArrowRight,
  KeyboardArrowDown,
  Check,
  Clear,
  Block,
} from "@mui/icons-material";
import {
  TestScenario,
  TestStep,
  TestStepStatus,
} from "../../data/testScenarios";

interface TestStepItemProps {
  scenario: TestScenario;
  step: TestStep;
  index: number;
  showExpected: boolean;
  status: TestStepStatus;
  onToggleExpected: (stepId: string) => void;
  onSetStatus: (
    scenarioId: string,
    stepId: string,
    status: TestStepStatus
  ) => void;
  getStatusColor: (status: TestStepStatus) => string;
}

const TestStepItem: React.FC<TestStepItemProps> = ({
  scenario,
  step,
  index,
  showExpected,
  status,
  onToggleExpected,
  onSetStatus,
  getStatusColor,
}) => {
  const theme = useTheme();

  return (
    <ListItem
      key={step.id}
      sx={{
        display: "block",
        py: 1.5,
        px: 2,
        borderBottom: "1px solid ${theme.palette.divider}",
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
                textDecoration: status === "blocked" ? "line-through" : "none",
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
                showExpected ? "Hide expected result" : "Show expected result"
              }
            >
              <IconButton
                size="small"
                onClick={() => onToggleExpected(step.id)}
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

          <Box sx={{ display: "flex", mt: 1.5, justifyContent: "flex-start" }}>
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
                  onClick={() => onSetStatus(scenario.id, step.id, "pass")}
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
                  onClick={() => onSetStatus(scenario.id, step.id, "fail")}
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
                  onClick={() => onSetStatus(scenario.id, step.id, "blocked")}
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
};

// Memoize the component to prevent unnecessary re-renders
export default memo(TestStepItem, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.status === nextProps.status &&
    prevProps.showExpected === nextProps.showExpected &&
    prevProps.index === nextProps.index
  );
});
