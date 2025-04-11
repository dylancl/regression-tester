import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { TestScenarioMap, TestStep } from "../data/testScenarios";

// Collection references
const componentsCollection = collection(db, "components");

// Types for Firestore documents
export interface ComponentDocument {
  id: string;
  componentId: string;
  component: string;
  brand: string;
  context: string;
  title: string;
  description: string;
  tags?: string[];
  device?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScenarioDocument {
  id: string;
  scenarioId: string;
  title: string;
  description: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface TestStepDocument {
  id: string;
  stepId: string;
  instruction: string;
  expectedResult: string;
  order: number;
  device?: string;
  createdAt: number;
  updatedAt: number;
}

// Component functions
export const getAllComponents = async (): Promise<ComponentDocument[]> => {
  const snapshot = await getDocs(
    query(componentsCollection, orderBy("component"))
  );
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ComponentDocument)
  );
};

export const getComponent = async (
  id: string
): Promise<ComponentDocument | null> => {
  const docRef = doc(componentsCollection, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ComponentDocument;
  }

  return null;
};

export const createComponent = async (
  data: Omit<ComponentDocument, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const timestamp = Date.now();
  const docRef = await addDoc(componentsCollection, {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

export const updateComponent = async (
  id: string,
  data: Partial<Omit<ComponentDocument, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  const docRef = doc(componentsCollection, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
};

export const deleteComponent = async (id: string): Promise<void> => {
  // Get all scenarios for this component
  const scenariosSnapshot = await getDocs(
    collection(db, `components/${id}/scenarios`)
  );

  // Create a batch to delete the component and all related scenarios and steps
  const batch = writeBatch(db);

  // For each scenario, get and delete all steps
  for (const scenarioDoc of scenariosSnapshot.docs) {
    const stepsSnapshot = await getDocs(
      collection(db, `components/${id}/scenarios/${scenarioDoc.id}/steps`)
    );
    stepsSnapshot.docs.forEach((stepDoc) => {
      batch.delete(
        doc(
          db,
          `components/${id}/scenarios/${scenarioDoc.id}/steps/${stepDoc.id}`
        )
      );
    });

    // Delete the scenario
    batch.delete(doc(db, `components/${id}/scenarios/${scenarioDoc.id}`));
  }

  // Delete the component
  batch.delete(doc(componentsCollection, id));

  // Commit the batch
  await batch.commit();
};

// Scenario functions
export const getScenariosForComponent = async (
  componentId: string
): Promise<ScenarioDocument[]> => {
  const scenariosCollection = collection(
    db,
    `components/${componentId}/scenarios`
  );
  const snapshot = await getDocs(query(scenariosCollection, orderBy("order")));
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ScenarioDocument)
  );
};

export const createScenario = async (
  componentId: string,
  data: Omit<ScenarioDocument, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const scenariosCollection = collection(
    db,
    `components/${componentId}/scenarios`
  );
  const timestamp = Date.now();
  const docRef = await addDoc(scenariosCollection, {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

export const updateScenario = async (
  componentId: string,
  scenarioId: string,
  data: Partial<Omit<ScenarioDocument, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  const docRef = doc(db, `components/${componentId}/scenarios/${scenarioId}`);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
};

export const deleteScenario = async (
  componentId: string,
  scenarioId: string
): Promise<void> => {
  // Get all steps for this scenario
  const stepsSnapshot = await getDocs(
    collection(db, `components/${componentId}/scenarios/${scenarioId}/steps`)
  );

  // Create a batch to delete the scenario and all related steps
  const batch = writeBatch(db);

  // Delete all steps
  stepsSnapshot.docs.forEach((stepDoc) => {
    batch.delete(
      doc(
        db,
        `components/${componentId}/scenarios/${scenarioId}/steps/${stepDoc.id}`
      )
    );
  });

  // Delete the scenario
  batch.delete(doc(db, `components/${componentId}/scenarios/${scenarioId}`));

  // Commit the batch
  await batch.commit();
};

// Test step functions
export const getTestStepsForScenario = async (
  componentId: string,
  scenarioId: string
): Promise<TestStepDocument[]> => {
  const stepsCollection = collection(
    db,
    `components/${componentId}/scenarios/${scenarioId}/steps`
  );
  const snapshot = await getDocs(query(stepsCollection, orderBy("order")));
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as TestStepDocument)
  );
};

export const createTestStep = async (
  componentId: string,
  scenarioId: string,
  data: Omit<TestStepDocument, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const stepsCollection = collection(
    db,
    `components/${componentId}/scenarios/${scenarioId}/steps`
  );
  const timestamp = Date.now();
  const docRef = await addDoc(stepsCollection, {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

export const updateTestStep = async (
  componentId: string,
  scenarioId: string,
  stepId: string,
  data: Partial<Omit<TestStepDocument, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  const docRef = doc(
    db,
    `components/${componentId}/scenarios/${scenarioId}/steps/${stepId}`
  );
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
};

export const deleteTestStep = async (
  componentId: string,
  scenarioId: string,
  stepId: string
): Promise<void> => {
  const docRef = doc(
    db,
    `components/${componentId}/scenarios/${scenarioId}/steps/${stepId}`
  );
  await deleteDoc(docRef);
};

// Function to get test scenarios for the regression tester
export const fetchTestScenariosFromFirestore =
  async (): Promise<TestScenarioMap> => {
    try {
      const components = await getAllComponents();
      const scenarios: TestScenarioMap = {};

      // Process each component
      for (const component of components) {
        // Generate the component key
        const key =
          component.device === "mobile"
            ? `${component.component}-${component.brand}-${component.context}-${component.device}`
            : `${component.component}-${component.brand}-${component.context}`;

        // Initialize the scenario array if it doesn't exist
        if (!scenarios[key]) {
          scenarios[key] = [];
        }

        // Get scenarios for this component
        const componentScenarios = await getScenariosForComponent(component.id);

        // Process each scenario
        for (const scenario of componentScenarios) {
          const steps = await getTestStepsForScenario(
            component.id,
            scenario.id
          );

          // Map steps to the expected format
          const mappedSteps: TestStep[] = steps.map((step) => ({
            id: step.stepId,
            instruction: step.instruction,
            expectedResult: step.expectedResult,
          }));

          // Add the scenario to the array
          scenarios[key].push({
            id: scenario.scenarioId,
            title: scenario.title,
            description: scenario.description,
            steps: mappedSteps,
          });
        }
      }

      // Add default scenarios
      scenarios["default"] = [
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
              expectedResult:
                "Component should adapt to different screen sizes",
            },
          ],
        },
      ];

      return scenarios;
    } catch (error) {
      console.error("Failed to fetch test scenarios from Firestore:", error);
      // Return default scenarios on error
      return {
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
                expectedResult:
                  "Component should adapt to different screen sizes",
              },
            ],
          },
        ],
      };
    }
  };
