import React from "react";
import { Box, Typography, useTheme, Tooltip } from "@mui/material";
import { TestProgressData } from "../../hooks/useTestInstructions";

interface ProgressTrackerProps {
  progressData: TestProgressData;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progressData }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(66, 66, 66, 0.2)"
            : "rgba(248, 248, 248, 0.8)",
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
        <Typography variant="subtitle2">Test Progress</Typography>
        <Typography variant="body2" fontWeight="medium">
          {progressData.completion}% Complete
        </Typography>
      </Box>

      {/* Multi-color progress bar */}
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
          <Tooltip title={`${progressData.passed} Passed`}>
            <Box
              sx={{
                height: "100%",
                width: `${(progressData.passed / progressData.total) * 100}%`,
                bgcolor: theme.palette.success.main,
              }}
            />
          </Tooltip>
        )}
        {progressData.failed > 0 && (
          <Tooltip title={`${progressData.failed} Failed`}>
            <Box
              sx={{
                height: "100%",
                width: `${(progressData.failed / progressData.total) * 100}%`,
                bgcolor: theme.palette.error.main,
              }}
            />
          </Tooltip>
        )}
        {progressData.blocked > 0 && (
          <Tooltip title={`${progressData.blocked} Blocked`}>
            <Box
              sx={{
                height: "100%",
                width: `${(progressData.blocked / progressData.total) * 100}%`,
                bgcolor: theme.palette.warning.main,
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Status legend */}
      <Box sx={{ display: "flex", mt: 1, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 10,
              height: 10,
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
              width: 10,
              height: 10,
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
              width: 10,
              height: 10,
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
  );
};

export default ProgressTracker;
