import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import { TestProgressData } from "../../hooks/useTestInstructions";

interface TestProgressSummaryProps {
  progressData: TestProgressData;
  onExportResults: () => void;
  hasScenarios: boolean;
}

const TestProgressSummary: React.FC<TestProgressSummaryProps> = ({
  progressData,
  onExportResults,
  hasScenarios,
}) => {
  const theme = useTheme();

  return (
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
              width: `${(progressData.blocked / progressData.total) * 100}%`,
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
      {hasScenarios && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<FileDownload />}
          onClick={onExportResults}
          sx={{ mt: 2 }}
        >
          Export Results to CSV
        </Button>
      )}
    </Box>
  );
};

export default TestProgressSummary;
