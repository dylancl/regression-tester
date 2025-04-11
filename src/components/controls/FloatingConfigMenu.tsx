import React, { useState } from "react";
import {
  Box,
  Fab,
  Popover,
  Typography,
  Stack,
  Divider,
  useTheme,
  IconButton,
  Fade,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";
import { Settings, Close } from "@mui/icons-material";
import { SelectedOptions } from "../../types";
import { componentMap, countryLanguageCodes } from "../../utils";

interface FloatingConfigMenuProps {
  frame: {
    id: string;
    countryLanguageCode: string;
    selectedOptions: SelectedOptions;
  };
  onChangeCountry: (frameId: string, code: string) => void;
  onOptionChange: (frameId: string, name: string, value: string) => void;
  onShowNotification: (message: string) => void;
}

export const FloatingConfigMenu: React.FC<FloatingConfigMenuProps> = ({
  frame,
  onChangeCountry,
  onOptionChange,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Get country-specific features
  const countrySettings = countryLanguageCodes[frame.countryLanguageCode] || {};
  const hasLexus = countrySettings.hasLexus || false;
  const hasStock = countrySettings.hasStock || false;
  const hasUsed = countrySettings.hasUsed !== false; // Default to true if not explicitly set to false

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: SelectChangeEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    onOptionChange(frame.id, name, value);
  };

  const handleCountryChange = (code: string) => {
    onChangeCountry(frame.id, code);
    // Don't close the popover so the user can continue making changes
  };

  return (
    <>
      <Fab
        size="small"
        color="default"
        aria-label="configuration options"
        onClick={handleClick}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          bgcolor: open
            ? theme.palette.primary.main
            : theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.4)"
            : "rgba(255, 255, 255, 0.4)",
          color: open
            ? "#fff"
            : theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(0, 0, 0, 0.7)",
          "&:hover": {
            bgcolor: theme.palette.primary.main,
            color: "#fff",
          },
          transition: "background-color 0.3s, color 0.3s, opacity 0.3s",
          boxShadow: open ? theme.shadows[8] : "none",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0.7,
          zIndex: 100,
        }}
      >
        <Settings />
      </Fab>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        slots={{ transition: Fade }}
        slotProps={{
          transition: {
            timeout: { enter: 200, exit: 200 },
          },
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              maxWidth: 380,
              width: "100%",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(66, 66, 66, 0.2)"
                : "rgba(248, 248, 248, 0.8)",
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color="primary">
            Frame Configuration
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2,
            maxHeight: "40rem",
            overflowY: "auto",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: theme.palette.background.default,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Country Selection Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.9)",
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Country
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  id="country"
                  value={frame.countryLanguageCode}
                  label="Country"
                  onChange={(e) => handleCountryChange(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {Object.entries(countryLanguageCodes).map(
                    ([code, country]) => (
                      <MenuItem key={code} value={code}>
                        {country.pretty} ({code})
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>
                  Use the dropdown to change country
                </FormHelperText>
              </FormControl>
            </Box>
            <Divider />

            {/* Environment Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.9)",
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Environment
              </Typography>
              <Stack spacing={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel id="environment-label">
                    Deployment Environment
                  </InputLabel>
                  <Select
                    labelId="environment-label"
                    id="environment"
                    name="environment"
                    value={frame.selectedOptions.environment || "prev"}
                    label="Deployment Environment"
                    onChange={handleChange}
                  >
                    <MenuItem value="localhost">Localhost</MenuItem>
                    <MenuItem value="dev">Development</MenuItem>
                    <MenuItem value="acc">Acceptance</MenuItem>
                    <MenuItem value="prev">Preview</MenuItem>
                    <MenuItem value="prod">Production</MenuItem>
                  </Select>
                  <FormHelperText>
                    Select the deployment environment
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="usc-env-label">USC Environment</InputLabel>
                  <Select
                    labelId="usc-env-label"
                    id="uscEnv"
                    name="uscEnv"
                    value={frame.selectedOptions.uscEnv || "uat"}
                    label="USC Environment"
                    onChange={handleChange}
                  >
                    <MenuItem value="uat">UAT</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                  </Select>
                  <FormHelperText>Backend environment</FormHelperText>
                </FormControl>
              </Stack>
            </Box>
            <Divider />

            {/* Component Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.9)",
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Component
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="component-label">Component</InputLabel>
                <Select
                  labelId="component-label"
                  id="component"
                  name="component"
                  value={frame.selectedOptions.component || "car-filter"}
                  label="Component"
                  onChange={handleChange}
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
                        <Box
                          sx={{ fontSize: "0.8em", color: "text.secondary" }}
                        >
                          {description}
                        </Box>
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>Select the component to test</FormHelperText>
              </FormControl>
            </Box>
            <Divider />

            {/* USC Context Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.9)",
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                USC Context
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="usc-context-label">USC Context</InputLabel>
                <Select
                  labelId="usc-context-label"
                  id="uscContext"
                  name="uscContext"
                  value={frame.selectedOptions.uscContext || "used"}
                  label="USC Context"
                  onChange={handleChange}
                  disabled={
                    frame.selectedOptions.component === "used-stock-cars-pdf"
                  }
                >
                  <MenuItem value="used" disabled={!hasUsed}>
                    Used {!hasUsed && "(Not Available)"}
                  </MenuItem>
                  <MenuItem value="stock" disabled={!hasStock}>
                    Stock {!hasStock && "(Not Available)"}
                  </MenuItem>
                </Select>
                <FormHelperText>
                  {!hasStock && frame.selectedOptions.uscContext === "used"
                    ? "Stock is not available for this country"
                    : !hasUsed && frame.selectedOptions.uscContext === "stock"
                    ? "Used is not available for this country"
                    : "Used or Stock cars"}
                </FormHelperText>
              </FormControl>
            </Box>
            <Divider />

            {/* Brand Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.9)",
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Brand Settings
              </Typography>
              <Stack spacing={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel id="brand-label">Brand</InputLabel>
                  <Select
                    labelId="brand-label"
                    id="brand"
                    name="brand"
                    value={frame.selectedOptions.brand || "toyota"}
                    label="Brand"
                    onChange={handleChange}
                  >
                    <MenuItem value="toyota">Toyota</MenuItem>
                    <MenuItem value="lexus" disabled={!hasLexus}>
                      Lexus {!hasLexus && "(Not Available)"}
                    </MenuItem>
                  </Select>
                  <FormHelperText>
                    {!hasLexus && frame.selectedOptions.brand === "toyota"
                      ? "Lexus is not available for this country"
                      : "Brand selection"}
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="variant-brand-label">
                    Variant Brand
                  </InputLabel>
                  <Select
                    labelId="variant-brand-label"
                    id="variantBrand"
                    name="variantBrand"
                    value={frame.selectedOptions.variantBrand || "toyota"}
                    label="Variant Brand"
                    onChange={handleChange}
                  >
                    <MenuItem value="toyota">Toyota</MenuItem>
                    <MenuItem value="lexus">Lexus</MenuItem>
                  </Select>
                  <FormHelperText>
                    Variant brand for the component
                  </FormHelperText>
                </FormControl>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default FloatingConfigMenu;
