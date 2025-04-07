import { SelectedOptions } from '../types';

// Constants for Google Sheets integration
export const GOOGLE_SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
export const TEST_SCENARIOS_SPREADSHEET_ID = import.meta.env.VITE_TEST_SCENARIOS_SPREADSHEET_ID;
export const API_KEY = import.meta.env.VITE_TEST_SCENARIOS_API_KEY;

// Status types for test steps
export type TestStepStatus = 'pass' | 'fail' | 'blocked' | null;

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
  return `${options.component}-${options.brand}-${options.uscContext}`;
};

// Function to fetch test scenarios from Google Sheets
export const fetchTestScenariosFromSheets = async (): Promise<TestScenarioMap> => {
  try {
    // Fetch both the component scenarios and general scenarios from different sheets
    const componentsUrl = `${GOOGLE_SHEETS_BASE_URL}/${TEST_SCENARIOS_SPREADSHEET_ID}/values/Components?key=${API_KEY}`;
    const stepsUrl = `${GOOGLE_SHEETS_BASE_URL}/${TEST_SCENARIOS_SPREADSHEET_ID}/values/Steps?key=${API_KEY}`;
    
    const [componentsResponse, stepsResponse] = await Promise.all([
      fetch(componentsUrl),
      fetch(stepsUrl)
    ]);
    
    if (!componentsResponse.ok || !stepsResponse.ok) {
      throw new Error(`Error fetching test scenarios: ${componentsResponse.statusText || stepsResponse.statusText}`);
    }
    
    const componentsData = await componentsResponse.json();
    const stepsData = await stepsResponse.json();
    
    // Parse the sheet data into our TestScenarioMap format
    return parseNewSheetFormat(componentsData, stepsData);
  } catch (error) {
    console.error("Failed to fetch test scenarios:", error);

    return getDefaultScenarios(); // Return default scenarios on error
  }
};

// Function to parse the new improved sheet format
// Components sheet: ComponentID | Component | Brand | Context | Title | Description | Tags
// Steps sheet: ComponentID | ScenarioID | StepID | Instruction | ExpectedResult | Status
const parseNewSheetFormat = (componentsData: any, stepsData: any): TestScenarioMap => {
  const componentsRows = componentsData.values || [];
  const stepsRows = stepsData.values || [];
  
  if (componentsRows.length < 2 || stepsRows.length < 2) {
    return getDefaultScenarios(); // Return default scenarios if no data
  }
  
  const scenarios: TestScenarioMap = {};
  const componentsMap: Record<string, {
    key: string;
    title: string;
    description: string;
  }> = {};
  
  // First, process components sheet (skip header row)
  for (let i = 1; i < componentsRows.length; i++) {
    const row = componentsRows[i];
    
    if (row.length < 6) continue; // Skip incomplete rows
    
    const [componentId, component, brand, context, title, description] = row;
    const key = `${component}-${brand}-${context}`;
    
    componentsMap[componentId] = {
      key,
      title,
      description
    };
    
    // Initialize the component's scenario array if it doesn't exist
    if (!scenarios[key]) {
      scenarios[key] = [];
    }
  }
  
  // Then, process steps sheet (skip header row)
  for (let i = 1; i < stepsRows.length; i++) {
    const row = stepsRows[i];
    
    if (row.length < 5) continue; // Skip incomplete rows
    
    const [componentId, scenarioId, stepId, instruction, expectedResult] = row;
    
    if (!componentsMap[componentId]) continue; // Skip if component not found
    
    const { key, title, description } = componentsMap[componentId];
    
    // Check if this scenario already exists
    let scenario = scenarios[key].find(s => s.id === scenarioId);
    
    if (!scenario) {
      // Create new scenario
      scenario = {
        id: scenarioId,
        title: `${title} - ${scenarioId}`, // Include scenario ID in title for clarity
        description,
        steps: []
      };
      scenarios[key].push(scenario);
    }
    
    // Add the step to the scenario
    scenario.steps.push({
      id: stepId,
      instruction,
      expectedResult
    });
  }
  
  console.log("Parsed scenarios from new format:", scenarios);
  return scenarios;
};

// Default scenarios (fallback for when API fails or for development)
export const getDefaultScenarios = (): TestScenarioMap => {
  return {
    // Car Filter component - Toyota - Used cars
    'carFilter-toyota-used': [
      {
        id: 'car-filter-basic-functionality',
        title: 'Basic Car Filter Functionality',
        description: 'Testing the basic functionality of the car filter component',
        steps: [
          {
            id: 'step-1',
            instruction: 'Open the Car Filter component',
            expectedResult: 'You should see 12 results displayed'
          },
          {
            id: 'step-2',
            instruction: 'Press the favorites button on any car',
            expectedResult: 'The car should be added to favorites and the button should change state'
          },
          {
            id: 'step-3',
            instruction: 'Filter by price range (€10,000 - €20,000)',
            expectedResult: 'Results should update to only show cars within the selected price range'
          }
        ]
      }
    ],
    
    'default': [
      {
        id: 'default-scenarios',
        title: 'Basic Component Testing',
        description: 'Generic tests that apply to most components',
        steps: [
          {
            id: 'step-1',
            instruction: 'Verify component loads correctly',
            expectedResult: 'Component should display without errors'
          },
          {
            id: 'step-2',
            instruction: 'Test responsive behavior',
            expectedResult: 'Component should adapt to different screen sizes'
          }
        ]
      }
    ]
  };
};

// Function to get test scenarios for a specific component configuration
export const getTestScenarios = async (options: SelectedOptions): Promise<TestScenario[]> => {
  const key = getComponentKey(options);
  const allScenarios = await fetchTestScenariosFromSheets();
  return allScenarios[key] || allScenarios['default'] || [];
};