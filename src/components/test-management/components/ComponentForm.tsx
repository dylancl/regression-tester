import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from "@mui/material";
import { ComponentDocument } from "../../../firebase/firestore";
import { componentMap } from "../../../utils";

interface ComponentFormProps {
  open: boolean;
  isEditing: boolean;
  currentComponent: Partial<ComponentDocument> | null;
  formErrors: Record<string, string>;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: SelectChangeEvent<string>, _: React.ReactNode) => void;
  onTagsChange: (e: SelectChangeEvent<string[]>) => void;
  onDeviceChange: (checked: boolean) => void;
  onSave: () => void;
}

const ComponentForm: React.FC<ComponentFormProps> = ({
  open,
  isEditing,
  currentComponent,
  formErrors,
  onClose,
  onChange,
  onSelectChange,
  onTagsChange,
  onDeviceChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditing ? "Edit Component" : "Add New Component"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="componentId"
            label="Component ID"
            fullWidth
            value={currentComponent?.componentId || ""}
            onChange={onChange}
            disabled={isEditing}
            helperText="Unique identifier for this component"
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="component-label">Component Name</InputLabel>
              <Select
                labelId="component-label"
                name="component"
                value={currentComponent?.component || "car-filter"}
                onChange={onSelectChange}
                label="Component Name"
                error={!!formErrors.component}
                required
              >
                {Object.entries(componentMap).map(
                  ([key, { title, description }]) => (
                    <MenuItem
                      key={key}
                      value={key}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      {title}
                      <Box sx={{ fontSize: "0.8em", color: "text.secondary" }}>
                        {description}
                      </Box>
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="brand-label">Brand</InputLabel>
              <Select
                labelId="brand-label"
                name="brand"
                value={currentComponent?.brand || "toyota"}
                onChange={onSelectChange}
                label="Brand"
              >
                <MenuItem value="toyota">Toyota</MenuItem>
                <MenuItem value="lexus">Lexus</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="context-label">Context</InputLabel>
              <Select
                labelId="context-label"
                name="context"
                value={currentComponent?.context || "used"}
                onChange={onSelectChange}
                label="Context"
              >
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="new">New</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            name="title"
            label="Title"
            fullWidth
            value={currentComponent?.title || ""}
            onChange={onChange}
            error={!!formErrors.title}
            helperText={
              formErrors.title || "A user-friendly title for this component"
            }
            required
          />

          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={currentComponent?.description || ""}
            onChange={onChange}
            error={!!formErrors.description}
            helperText={
              formErrors.description ||
              "Detailed description of the component's purpose and functionality"
            }
            required
          />

          <FormControl fullWidth>
            <InputLabel id="tags-label">Tags</InputLabel>
            <Select
              labelId="tags-label"
              multiple
              value={currentComponent?.tags || []}
              onChange={onTagsChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {[
                "filters",
                "search",
                "details",
                "specs",
                "photos",
                "pricing",
                "forms",
              ].map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={currentComponent?.device === "mobile"}
                onChange={(e) => onDeviceChange(e.target.checked)}
              />
            }
            label="Mobile-specific component"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          {isEditing ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentForm;
