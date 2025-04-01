# Toyota Component Regression Tester

A modern React application for testing Toyota/Lexus components across different NMSC (National Marketing and Sales Company) sites and environments.

## Features

- Test components across all European market sites
- Switch between different environments (dev, acceptance, preview, production)
- Support for different components (car-filter, used-stock-cars, used-stock-cars-pdf)
- Toggle between Toyota and Lexus brands (where available)
- Toggle between Used and Stock car contexts (where available)
- Modern UI with Toyota styling
- Responsive design that works on desktop and mobile
- Smooth animations using Framer Motion

## Technologies Used

- React 18
- TypeScript
- Vite (for fast development and optimized builds)
- Material UI (for Toyota-themed components)
- Framer Motion (for animations)
- React Hooks (for state management)

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

1. Select an environment (localhost, dev, acc, prev, prod)
2. Choose the component to test
3. Configure the context (used/stock) and environment (UAT/production)
4. Select Toyota or Lexus brand
5. Navigate through different countries using the arrows or country selector
6. Copy the URL to share a specific configuration

## Architecture

The application follows a clean architecture with:

- **Components**: UI components built with Material UI
- **Hooks**: Custom React hooks for logic management
- **Utils**: Utility functions for URL generation and data management
- **Types**: TypeScript interfaces for type safety

## License

Proprietary - Toyota Motor Europe
