import { SelectedOptions } from "../types";

// Status types for test steps
export type TestStepStatus = "pass" | "fail" | "blocked" | null;

// Interface for a single test step
export interface TestStep {
  id: string;
  instruction: string;
  expectedResult: string;
  status?: TestStepStatus;
}

// Interface for a test scenario
export interface TestScenario {
  id: string;
  title: string;
  description: string;
  steps: TestStep[];
}

// Interface for mapping components/options to test scenarios
export interface TestScenarioMap {
  [key: string]: TestScenario[];
}

// Helper function to generate a key for the component configuration
export const getComponentKey = (options: SelectedOptions): string => {
  // Include device property if it exists, otherwise default to 'desktop'
  const device = options.device || "desktop";

  // For mobile test scenarios, we include the device in the key
  if (device === "mobile") {
    return `${options.component}-${options.brand}-${options.uscContext}-${device}`;
  }

  // Default (desktop) behavior remains the same
  return `${options.component}-${options.brand}-${options.uscContext}`;
};

// Import Firestore functions
import { fetchTestScenariosFromFirestore } from "../firebase/firestore";

// Function to fetch test scenarios from Firestore
export const fetchTestScenarios = async (): Promise<TestScenarioMap> => {
  try {
    // Use the Firestore function to get scenarios instead of Google Sheets
    return await fetchTestScenariosFromFirestore();
  } catch (error) {
    console.error("Failed to fetch test scenarios:", error);
    return getDefaultScenarios(); // Return default scenarios on error
  }
};

// Default scenarios (fallback for when API fails or for development)
export const getDefaultScenarios = (): TestScenarioMap => {
  return {
    // Car Filter component - Toyota - Used cars
    "carFilter-toyota-used": [
      {
        id: "car-filter-basic-functionality",
        title: "Basic Car Filter Functionality",
        description:
          "Testing the basic functionality of the car filter component",
        steps: [
          {
            id: "step-1",
            instruction: "Open the Car Filter component",
            expectedResult: "You should see 12 results displayed",
          },
          {
            id: "step-2",
            instruction: "Press the favorites button on any car",
            expectedResult:
              "The car should be added to favorites and the button should change state",
          },
          {
            id: "step-3",
            instruction: "Filter by price range (€10,000 - €20,000)",
            expectedResult:
              "Results should update to only show cars within the selected price range",
          },
        ],
      },
    ],

    default: [
      {
        id: "default-scenarios",
        title: "Basic Component Testing",
        description: "Generic tests that apply to most components",
        steps: [
          {
            id: "step-1",
            instruction: "Verify component loads correctly",
            expectedResult: "Component should display without errors",
          },
          {
            id: "step-2",
            instruction: "Test responsive behavior",
            expectedResult: "Component should adapt to different screen sizes",
          },
        ],
      },
    ],
  };
};

// Function to get test scenarios for a specific component configuration
export const getTestScenarios = async (
  options: SelectedOptions
): Promise<TestScenario[]> => {
  const key = getComponentKey(options);
  const allScenarios = await fetchTestScenarios();
  return allScenarios[key] || allScenarios["default"] || [];
};
