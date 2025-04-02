import { createTheme, ThemeOptions, PaletteMode } from '@mui/material/styles';

// Create a theme instance for the specified mode
export const createAppTheme = (mode: PaletteMode) => {
  // Toyota colors - primary brand color #EB0A1E (Toyota Red)
  const commonPalette = {
    primary: {
      main: '#EB0A1E', // Toyota Red
      light: '#FF4D4D',
      dark: '#B00017',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#333333', // Dark grey often used in Toyota's digital products
      light: '#666666',
      dark: '#121212',
      contrastText: '#FFFFFF',
    },
  };

  const lightPalette = {
    ...commonPalette,
    mode: 'light' as PaletteMode,
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  };

  const darkPalette = {
    ...commonPalette,
    mode: 'dark' as PaletteMode,
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  };

  const themeOptions: ThemeOptions = {
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light' 
              ? '0px 2px 4px rgba(0, 0, 0, 0.1)' 
              : '0px 2px 4px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

// Export a default light theme for backwards compatibility
export const theme = createAppTheme('light');