import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, DragIndicator } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TestStepDocument } from "../../../firebase/firestore";
import { useTheme } from "@mui/material/styles";

interface SortableTestStepItemProps {
  step: TestStepDocument;
  onEdit: (step: TestStepDocument) => void;
  onDelete: (step: TestStepDocument) => void;
}

const SortableTestStepItem: React.FC<SortableTestStepItemProps> = ({
  step,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.paper,
        borderRadius: 1,
        mb: 1,
        p: 2,
        boxShadow: 1,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
        "&:focus": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: "2px",
        },
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[300]
        }`,
      }}
    >
      <Box
        sx={{ mr: 1, display: "flex", alignItems: "center", cursor: "grab" }}
        {...attributes}
        {...listeners}
      >
        <DragIndicator color="action" />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {step.instruction}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Expected Result:</strong> {step.expectedResult}
        </Typography>
        {step.device === "mobile" && (
          <Typography
            variant="caption"
            color="secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Mobile specific
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5 }}
        >
          ID: {step.stepId}
        </Typography>
      </Box>

      <Box sx={{ ml: 1, display: "flex", alignItems: "flex-start" }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(step)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(step)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SortableTestStepItem;
