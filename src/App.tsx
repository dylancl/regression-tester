import { lazy, Suspense } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createAppTheme } from "./theme";
import MainLayout from "./layouts/MainLayout";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import LoadingIndicator from "./components/controls/LoadingIndicator";

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

  // Lazy load components to optimize performance
  // This will split the code into separate chunks for each component
  // and load them only when needed
  const RegressionTester = lazy(() => import("./components/RegressionTester"));
  const MultiboxTester = lazy(() => import("./components/MultiboxTester"));
  const EnvironmentsOverview = lazy(
    () => import("./components/EnvironmentsOverview")
  );
  const CountriesOverview = lazy(
    () => import("./components/CountriesOverview")
  );
  const TestCaseManagement = lazy(
    () => import("./components/TestCaseManagement")
  );
  const PrintableReportPage = lazy(
    () => import("./components/test-instructions/PrintableReportPage")
  );

  // Get the base path from the Vite config
  const basename = import.meta.env.BASE_URL;

  return (
    <MuiThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter basename={basename}>
        <MainLayout>
          <Suspense
            fallback={
              <LoadingIndicator message="Application is starting up..." />
            }
          >
            <Routes>
              <Route path="/" element={<RegressionTester />} />
              <Route path="/multibox" element={<MultiboxTester />} />
              <Route path="/environments" element={<EnvironmentsOverview />} />
              <Route path="/countries" element={<CountriesOverview />} />
              <Route path="/test-management" element={<TestCaseManagement />} />
              <Route
                path="/printable-report"
                element={<PrintableReportPage />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;
