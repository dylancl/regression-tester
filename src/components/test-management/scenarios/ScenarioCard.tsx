import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, ArrowForward } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ScenarioDocument } from "../../../firebase/firestore";

interface ScenarioCardProps {
  scenario: ScenarioDocument;
  onEdit: (scenario: ScenarioDocument) => void;
  onDelete: (scenario: ScenarioDocument) => void;
  onSelect: (id: string) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[300]
        }`,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom component="div" noWrap>
          {scenario.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          sx={{ display: "block" }}
        >
          ID: {scenario.scenarioId}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {scenario.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(scenario)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(scenario)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="View Test Steps">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onSelect(scenario.id)}
          >
            <ArrowForward fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ScenarioCard;
