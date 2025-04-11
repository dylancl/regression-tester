import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createAppTheme } from "./theme";
import MainLayout from "./layouts/MainLayout";
import RegressionTester from "./components/RegressionTester";
import MultiboxTester from "./components/MultiboxTester";
import EnvironmentsOverview from "./components/EnvironmentsOverview";
import CountriesOverview from "./components/CountriesOverview";
import TestCaseManagement from "./components/TestCaseManagement";
import PrintableReportPage from "./components/test-instructions/PrintableReportPage";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import PrintableTestReport from "./components/test-instructions/PrintableTestReport";

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

  // Get the base path from the Vite config
  const basename = import.meta.env.BASE_URL;

  return (
    <MuiThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter basename={basename}>
        <MainLayout>
          <Routes>
            <Route path="/" element={<RegressionTester />} />
            <Route path="/multibox" element={<MultiboxTester />} />
            <Route path="/environments" element={<EnvironmentsOverview />} />
            <Route path="/countries" element={<CountriesOverview />} />
            <Route path="/test-management" element={<TestCaseManagement />} />
            <Route path="/printable-report" element={<PrintableReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;
