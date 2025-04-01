import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';
import MainLayout from './layouts/MainLayout';
import RegressionTester from './components/RegressionTester';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

// Inner component that has access to the theme context
const ThemedApp = () => {
  const { mode } = useThemeContext();
  const appTheme = createAppTheme(mode);
  
  return (
    <MuiThemeProvider theme={appTheme}>
      <CssBaseline />
      <MainLayout>
        <RegressionTester />
      </MainLayout>
    </MuiThemeProvider>
  );
};

export default App;
