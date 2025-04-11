import React, { useState } from "react";
import { Box, Button, Typography, Grid, CircularProgress } from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  ComponentDocument,
  deleteComponent,
} from "../../../firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// Import new components and hooks
import ComponentCard from "./ComponentCard";
import ComponentForm from "./ComponentForm";
import SearchAndFilterBar from "./SearchAndFilterBar";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { useComponentFilters } from "../../../hooks/useComponentFilters";
import { useComponentForm } from "../../../hooks/useComponentForm";

// Define the props interface
interface ComponentManagerProps {
  components: ComponentDocument[];
  onSelectComponent: (id: string) => void;
  onComponentsChange?: () => void; // New prop for refreshing components
}

const ComponentManager: React.FC<ComponentManagerProps> = ({
  components,
  onSelectComponent,
  onComponentsChange,
}) => {
  const {
    searchTerm,
    filterBrand,
    filterContext,
    setSearchTerm,
    setFilterBrand,
    setFilterContext,
    filteredComponents,
    clearFilters,
  } = useComponentFilters(components);

  // Component form management
  const {
    currentComponent,
    isEditing,
    formErrors,
    dialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleChange,
    handleSelectChange,
    handleTagsChange,
    handleDeviceChange,
    handleSave,
  } = useComponentForm(() => {
    onComponentsChange?.(); // Refresh components after save
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleConfirmDelete = (component: ComponentDocument) => {
    handleOpenDialog(component);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentComponent?.id) return;

    try {
      await deleteComponent(currentComponent.id);
      setDeleteDialogOpen(false);
      handleCloseDialog();
      onComponentsChange?.();
    } catch (error) {
      console.error("Error deleting component:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="h2">
          Components
        </Typography>

        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Component
          </Button>
        </Box>
      </Box>

      <SearchAndFilterBar
        searchTerm={searchTerm}
        filterBrand={filterBrand}
        filterContext={filterContext}
        onSearchChange={setSearchTerm}
        onBrandFilterChange={setFilterBrand}
        onContextFilterChange={setFilterContext}
      />

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {components.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Loading components...</Typography>
          </Box>
        ) : filteredComponents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No components match your search
            </Typography>
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <AnimatePresence mode="popLayout">
              {filteredComponents.map((component, index) => (
                <Grid
                  key={component.id}
                  size={{ xs: 12, sm: 6, md: 4 }}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05, // Staggered animation
                    ease: "easeOut",
                  }}
                  layout
                >
                  <ComponentCard
                    component={component}
                    onEdit={handleOpenDialog}
                    onDelete={handleConfirmDelete}
                    onSelect={onSelectComponent}
                  />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Box>

      <AnimatePresence>
        {dialogOpen && (
          <ComponentForm
            open={dialogOpen}
            isEditing={isEditing}
            currentComponent={currentComponent}
            formErrors={formErrors}
            onClose={handleCloseDialog}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            onTagsChange={handleTagsChange}
            onDeviceChange={handleDeviceChange}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteDialogOpen && (
          <ConfirmDeleteDialog
            open={deleteDialogOpen}
            title="Confirm Deletion"
            itemName={currentComponent?.title || ""}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ComponentManager;
