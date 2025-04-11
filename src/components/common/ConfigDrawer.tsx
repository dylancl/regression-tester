import React from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  ChevronLeft,
  DarkMode,
  LightMode,
  Settings,
} from "@mui/icons-material";
import { SelectedOptions } from "../../types";
import CountrySelector from "../controls/CountrySelector";
import ControlPanel from "../controls/ControlPanel";
import ProgressTracker from "../controls/ProgressTracker";
import { TestProgressData } from "../test-instructions/TestInstructions";

interface ConfigDrawerProps {
  /**
   * Whether the drawer is open
   */
  open: boolean;

  /**
   * Function to call when the drawer should be closed
   */
  onClose: () => void;

  /**
   * The current theme mode
   */
  themeMode: "light" | "dark";

  /**
   * Function to toggle the theme
   */
  onToggleTheme: () => void;

  /**
   * The selected options for the component
   */
  selectedOptions: SelectedOptions;

  /**
   * The current country language code
   */
  countryLanguageCode: string;

  /**
   * Function to navigate to the next country
   */
  onNextCountry: () => void;

  /**
   * Function to navigate to the previous country
   */
  onPrevCountry: () => void;

  /**
   * Function to change to a specific country
   */
  onChangeCountry: (code: string) => void;

  /**
   * Function to handle option changes
   */
  onOptionChange: (name: string, value: string) => void;

  /**
   * Test progress data
   */
  progressData?: TestProgressData;

  /**
   * Optional URL display component
   */
  urlDisplayComponent?: React.ReactNode;

  /**
   * Optional frame info component
   */
  frameInfoComponent?: React.ReactNode;
}

/**
 * Configuration drawer component for the Regression Tester
 */
const ConfigDrawer: React.FC<ConfigDrawerProps> = ({
  open,
  onClose,
  themeMode,
  onToggleTheme,
  selectedOptions,
  countryLanguageCode,
  onNextCountry,
  onPrevCountry,
  onChangeCountry,
  onOptionChange,
  progressData,
  urlDisplayComponent,
  frameInfoComponent,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Calculate the drawer width based on screen size
  const configDrawerWidth = isMobile ? "100%" : 340;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      sx={{
        width: open ? configDrawerWidth : 0,
        flexShrink: 0,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
        "& .MuiDrawer-paper": {
          width: configDrawerWidth,
          boxSizing: "border-box",
          position: isMobile ? "fixed" : "relative",
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(66, 66, 66, 0.2)"
              : "rgba(248, 248, 248, 0.8)",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Settings color="primary" fontSize="small" />
          <Typography variant="subtitle1" color="primary" fontWeight="medium">
            Configuration
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip
            title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
          >
            <IconButton size="small" onClick={onToggleTheme} sx={{ mr: 0.5 }}>
              {themeMode === "light" ? (
                <DarkMode fontSize="small" />
              ) : (
                <LightMode fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <ChevronLeft fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          overflowY: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* URL display section - optional */}
        {urlDisplayComponent}

        {/* Frame info - optional */}
        {frameInfoComponent}

        {/* Country Selector first for better user flow */}
        <CountrySelector
          countryLanguageCode={countryLanguageCode}
          goToNextCountry={onNextCountry}
          goToPreviousCountry={onPrevCountry}
          changeCountry={onChangeCountry}
        />

        {/* Control Panel for settings */}
        <ControlPanel
          selectedOptions={selectedOptions}
          handleOptionChange={onOptionChange}
          countryLanguageCode={countryLanguageCode}
        />
      </Box>

      {/* Progress Tracker at bottom of sidebar */}
      {progressData && progressData.total > 0 && (
        <ProgressTracker progressData={progressData} />
      )}
    </Drawer>
  );
};

export default ConfigDrawer;
