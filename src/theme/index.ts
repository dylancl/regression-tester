import {
  createTheme,
  ThemeOptions,
  PaletteMode,
  alpha,
} from "@mui/material/styles";

// Create a theme instance for the specified mode
export const createAppTheme = (mode: PaletteMode) => {
  // Toyota colors - primary brand color #EB0A1E (Toyota Red)
  const toyotaRed = "#EB0A1E";
  const lexusRed = "#AB0F15";

  // Common palette values shared between light and dark mode
  const commonPalette = {
    primary: {
      main: toyotaRed,
      light: "#FF3B4E", // Brighter red
      dark: "#C0081A", // Deeper red
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#1F1F1F", // Darker for better contrast
      light: "#555555",
      dark: "#0A0A0A",
      contrastText: "#FFFFFF",
    },
    // Add accent colors for richer UI
    info: {
      main: "#2196F3",
      light: "#64B6F7",
      dark: "#0B79D0",
    },
    success: {
      main: "#4CAF50",
      light: "#7BC67E",
      dark: "#3B873E",
    },
    warning: {
      main: "#FF9800",
      light: "#FFB547",
      dark: "#C77700",
    },
    error: {
      main: toyotaRed,
      light: "#FF3B4E",
      dark: "#C0081A",
    },
  };

  // Light mode palette - cleaner and more refined
  const lightPalette = {
    ...commonPalette,
    mode: "light" as PaletteMode,
    background: {
      default: "#F8F9FA", // Slightly blue-ish white for better contrast
      paper: "#FFFFFF",
    },
    text: {
      primary: "#121212", // Darker text for better readability
      secondary: "#5F6368", // Google-style secondary text
    },
    divider: "rgba(0, 0, 0, 0.08)", // Lighter dividers
    action: {
      active: alpha(toyotaRed, 0.7),
      hover: alpha(toyotaRed, 0.05),
      selected: alpha(toyotaRed, 0.1),
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
    },
  };

  // Dark mode palette - richer and more contrasty
  const darkPalette = {
    ...commonPalette,
    mode: "dark" as PaletteMode,
    background: {
      default: "#0A0A0A", // True black background
      paper: "#1A1A1A", // Slightly lighter for cards and surfaces
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA", // Subdued secondary text
    },
    divider: "rgba(255, 255, 255, 0.08)", // Subtle dividers
    action: {
      active: alpha(toyotaRed, 0.9),
      hover: alpha(toyotaRed, 0.2),
      selected: alpha(toyotaRed, 0.25),
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
    },
  };

  // Common theme options with enhanced component styling
  const themeOptions: ThemeOptions = {
    palette: mode === "light" ? lightPalette : darkPalette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h2: {
        fontWeight: 600,
        letterSpacing: "-0.005em",
      },
      h3: {
        fontWeight: 600,
        letterSpacing: 0,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 500,
      },
      body1: {
        lineHeight: 1.6,
      },
      body2: {
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        textTransform: "none",
        letterSpacing: "0.02em",
      },
    },
    shape: {
      borderRadius: 8, // Consistent border radius
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: mode === "light" ? "#f1f1f1" : "#2D2D2D",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: mode === "light" ? "#BDBDBD" : "#555555",
              borderRadius: "4px",
              "&:hover": {
                background: toyotaRed,
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 500,
            // Add subtle transition for all button states
            transition: "all 0.2s ease-in-out",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0px 3px 6px rgba(0, 0, 0, 0.15)"
                  : "0px 3px 10px rgba(0, 0, 0, 0.4)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(1px)",
            },
          },
          outlined: {
            borderWidth: 1.5,
            "&:hover": {
              borderWidth: 1.5,
              backgroundColor: alpha(toyotaRed, 0.04),
            },
          },
          text: {
            "&:hover": {
              backgroundColor: alpha(toyotaRed, 0.04),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: "hidden",
            boxShadow:
              mode === "light"
                ? "0px 2px 8px rgba(0, 0, 0, 0.07)"
                : "0px 2px 8px rgba(0, 0, 0, 0.3)",
            transition: "box-shadow 0.3s ease, transform 0.2s ease",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0px 4px 12px rgba(0, 0, 0, 0.1)"
                  : "0px 4px 12px rgba(0, 0, 0, 0.4)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow:
              mode === "light"
                ? "0px 2px 8px rgba(0, 0, 0, 0.07)"
                : "0px 2px 8px rgba(0, 0, 0, 0.3)",
          },
          elevation1: {
            boxShadow:
              mode === "light"
                ? "0px 1px 4px rgba(0, 0, 0, 0.05)"
                : "0px 1px 4px rgba(0, 0, 0, 0.25)",
          },
          elevation2: {
            boxShadow:
              mode === "light"
                ? "0px 2px 8px rgba(0, 0, 0, 0.07)"
                : "0px 2px 8px rgba(0, 0, 0, 0.3)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            borderRight: `1px solid ${
              mode === "light"
                ? "rgba(0, 0, 0, 0.08)"
                : "rgba(255, 255, 255, 0.08)"
            }`,
            boxShadow:
              mode === "light"
                ? "0px 2px 8px rgba(0, 0, 0, 0.07)"
                : "0px 2px 8px rgba(0, 0, 0, 0.3)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            backgroundImage: "none",
            // Add subtle gradient for AppBar
            background:
              mode === "light"
                ? `linear-gradient(to right, ${toyotaRed}, ${alpha(
                    toyotaRed,
                    0.95
                  )})`
                : `linear-gradient(to right, ${toyotaRed}, ${alpha(
                    lexusRed,
                    0.95
                  )})`,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor:
              mode === "light"
                ? "rgba(0, 0, 0, 0.08)"
                : "rgba(255, 255, 255, 0.08)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            "&.MuiChip-colorPrimary": {
              background: alpha(toyotaRed, 0.1),
              color: mode === "light" ? toyotaRed : "#FF3B4E",
              borderColor: alpha(toyotaRed, 0.3),
            },
          },
          filled: {
            "&.MuiChip-colorPrimary": {
              background: alpha(toyotaRed, 0.95),
              color: "#FFFFFF",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor:
                  mode === "light"
                    ? "rgba(0, 0, 0, 0.15)"
                    : "rgba(255, 255, 255, 0.15)",
                transition: "border-color 0.2s ease-in-out",
              },
              "&:hover fieldset": {
                borderColor:
                  mode === "light"
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(255, 255, 255, 0.3)",
              },
              "&.Mui-focused fieldset": {
                borderColor: toyotaRed,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            border: "none",
            color: mode === "light" ? "#757575" : "#A0A0A0",
            backgroundColor:
              mode === "light"
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(255, 255, 255, 0.04)",
            "&.Mui-selected": {
              color: mode === "light" ? toyotaRed : "#FF3B4E",
              backgroundColor:
                mode === "light"
                  ? alpha(toyotaRed, 0.1)
                  : alpha(toyotaRed, 0.2),
              "&:hover": {
                backgroundColor:
                  mode === "light"
                    ? alpha(toyotaRed, 0.15)
                    : alpha(toyotaRed, 0.25),
              },
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            height: 6,
            "& .MuiSlider-track": {
              border: "none",
            },
            "& .MuiSlider-thumb": {
              height: 18,
              width: 18,
              "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                boxShadow: `0px 0px 0px 8px ${alpha(toyotaRed, 0.16)}`,
              },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          filledSuccess: {
            backgroundColor: "#4CAF50",
          },
          filledInfo: {
            backgroundColor: "#2196F3",
          },
          filledWarning: {
            backgroundColor: "#FF9800",
          },
          filledError: {
            backgroundColor: toyotaRed,
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            "& .MuiInputLabel-root.Mui-focused": {
              color: toyotaRed,
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

// Export a default light theme for backwards compatibility
export const theme = createAppTheme("light");
