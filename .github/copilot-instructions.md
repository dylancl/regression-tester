# USC Regression Tester - AI Coding Guidelines

## Architecture Overview

This is a React/TypeScript application for regression testing Toyota/Lexus car components across European countries. Key architectural patterns:

- **Component Structure**: Lazy-loaded route components in `src/components/` with shared UI in `src/components/common/`
- **Data Flow**: Firebase Firestore for test scenarios/components, localStorage for user config, URL params for state sharing
- **State Management**: Custom hooks (`useRegressionTester`, `useTestCaseManagement`) encapsulate business logic
- **Configuration**: Country-specific validation in `src/utils/index.ts`, device responsiveness with `src/utils/deviceSizes.ts`

## Key Patterns & Conventions

### URL Generation & Configuration

- Use `generateUrl()` from `src/utils/index.ts` for creating test URLs
- Configuration keys follow `{component}-{brand}-{uscContext}` pattern (e.g., `car-filter-toyota-used`)
- Mobile testing includes device in key: `{component}-{brand}-{uscContext}-{device}`

### Firebase Integration

- Test scenarios stored as `TestScenarioMap` in Firestore collections
- Document structure: `{scenarioId, title, description, order, createdAt, updatedAt}`
- Use `fetchTestScenariosFromFirestore()` for data loading

### Component Architecture

- Custom hooks handle complex state logic (see `src/hooks/`)
- Theme context (`src/contexts/ThemeContext.tsx`) manages dark/light mode
- Responsive design uses `ResponsiveFrameContainer` with device size menus

### Validation Logic

- Country availability checked via `countryLanguageCodes[countryCode]?.hasLexus/hasStock/hasUsed`
- Automatic fallback when selected options unavailable for current country
- Device-specific scenarios loaded based on `options.device` property

## Development Workflow

### Build & Deploy

```bash
npm run dev          # Development server
npm run build        # Production build with TypeScript checking
npm run preview      # Preview production build
npm run deploy       # Deploy to GitHub Pages (includes build)
```

### Testing URLs

- Base URL configured in `vite.config.ts` as `/regression-tester/`
- Environment URLs generated from selected options (dev/acc/prev/prod)
- Country codes mapped to NMSC codes in `countryLanguageCodes`

## Common Patterns

### Adding New Components

1. Define component type in `src/types/index.ts`
2. Add to Firestore `components` collection
3. Create test scenarios in `scenarios` collection
4. Update URL generation logic if needed

### Country-Specific Logic

- Check `countryLanguageCodes[country].hasLexus/hasStock/hasUsed` before enabling options
- Use `validateOptionsForCountry()` in hooks for automatic fallback
- NMSC codes used for backend routing (e.g., "TFR" for France)

### Adding New Configuration Fields

When adding a new configuration option (like `tyCode`), update these files:

1. **URL Generation** (`src/utils/index.ts`):

   - `buildQueryString()` automatically includes all non-empty options
   - No changes needed unless special handling required

2. **Single View Configuration** (`src/components/controls/ControlPanel.tsx`):

   - Add the input field to the main configuration panel
   - Import `TextField` from MUI if using text input
   - Use `handleOptionChange` for state updates

3. **Multibox Frame Configuration** (`src/components/controls/FloatingConfigMenu.tsx`):

   - Add the input field to the frame-specific configuration menu
   - Import `TextField` from MUI if using text input
   - Use `onOptionChange(frame.id, name, value)` for state updates

4. **Sync Options** (`src/hooks/useMultiboxTester.ts`):

   - Add the new field to `syncOptions` in both `createFrameFromSavedConfig` and `createFrameConfig`
   - Set to `true` to enable syncing by default

5. **Sync Options Menu** (`src/components/controls/SyncOptionsMenu.tsx`):

   - Add to `syncableSettings` array with label and description
   - Add to `SyncOptions` type definition
   - Add to `defaultSyncOptions` object

6. **Type Definitions** (`src/types/index.ts`):
   - `SelectedOptions` interface automatically supports new fields via `[key: string]: string`
   - No changes needed for simple string options

### State Persistence

- Single view config saved to localStorage as `toyota-regression-tester-single-view-config`
- Multibox config shared between views for consistency
- URL parameters override saved config on page load

## File Organization

- `src/components/`: Route components (lazy loaded)
- `src/components/common/`: Shared UI components
- `src/components/controls/`: Configuration controls
- `src/hooks/`: Business logic hooks
- `src/utils/`: URL generation, country data, config storage
- `src/firebase/`: Database operations
- `src/types/`: TypeScript interfaces
