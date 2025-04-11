import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";
import {
  Edit,
  Delete,
  ComputerOutlined,
  PhoneAndroidOutlined,
  ArrowForward,
} from "@mui/icons-material";
import { ComponentDocument } from "../../../firebase/firestore";
import { useTheme } from "@mui/material/styles";

interface ComponentCardProps {
  component: ComponentDocument;
  onEdit: (component: ComponentDocument) => void;
  onDelete: (component: ComponentDocument) => void;
  onSelect: (id: string) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Card
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
        marginTop: 0.5, // Otherwise the top border of the card is not visible on hover
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" component="div">
              {component.component}
            </Typography>
            {component.device === "mobile" ? (
              <Tooltip title="Mobile Component">
                <PhoneAndroidOutlined color="secondary" sx={{ ml: 1 }} />
              </Tooltip>
            ) : (
              <Tooltip title="Desktop Component">
                <ComputerOutlined sx={{ ml: 1 }} />
              </Tooltip>
            )}
          </Box>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            ID: {component.componentId}
          </Typography>
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {component.title}
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
            {component.description}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip
            label={component.brand}
            size="small"
            color={component.brand === "lexus" ? "secondary" : "primary"}
          />
          <Chip label={component.context} size="small" color="default" />
        </Box>

        {component.tags && component.tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {component.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(component)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(component)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => onSelect(component.id)}
          endIcon={<ArrowForward />}
        >
          View Scenarios
        </Button>
      </CardActions>
    </Card>
  );
};

export default ComponentCard;
