import React from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Assignment, Edit } from "@mui/icons-material";
import { SelectedOptions } from "../../types";

interface EmptyStateProps {
  selectedOptions: SelectedOptions;
  onManageTestCases: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  selectedOptions,
  onManageTestCases,
}) => (
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
    <Assignment color="disabled" sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
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
      . Use the Test Case Management page to add scenarios and test steps.
    </Typography>
    <Button
      variant="contained"
      size="small"
      startIcon={<Edit />}
      onClick={onManageTestCases}
    >
      Manage Test Cases
    </Button>
  </Box>
);

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading test instructions...",
}) => (
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
      {message}
    </Typography>
  </Box>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onManageTestCases: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onManageTestCases,
}) => (
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
    <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 500 }}>
      {error}
    </Alert>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 2, textAlign: "center" }}
    >
      There was a problem loading the test instructions. You may need to create
      test scenarios using the Test Case Management page.
    </Typography>
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={onManageTestCases}
        startIcon={<Edit />}
      >
        Manage Test Cases
      </Button>
      <Button variant="contained" size="small" onClick={onRetry}>
        Retry
      </Button>
    </Box>
  </Box>
);

export default {
  EmptyState,
  LoadingState,
  ErrorState,
};
