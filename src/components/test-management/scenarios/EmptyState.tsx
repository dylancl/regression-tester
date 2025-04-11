import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";

interface EmptyStateProps {
  onAddClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No scenarios found
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Add your first scenario to get started
      </Typography>
      <Button variant="outlined" startIcon={<Add />} onClick={onAddClick}>
        Add Scenario
      </Button>
    </Box>
  );
};

export default EmptyState;
