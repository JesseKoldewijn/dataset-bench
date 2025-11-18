# Solid Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A high-performance, reactive frontend for the Dataset Generation API built with SolidJS, Solid Start, and TailwindCSS.

## Tech Stack

-   **Framework**: Solid Start 1.2.0 (SolidJS meta-framework)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS 4 (CSS-based configuration)
-   **UI Components**: Custom components with CVA (Class Variance Authority)
-   **State Management**: TanStack Query (Solid Query v5)
-   **API Client**: openapi-fetch with generated TypeScript types
-   **Charts**: Chart.js with solid-chartjs integration
-   **Icons**: lucide-solid
-   **Routing**: @solidjs/router
-   **Build Tool**: Vinxi 0.5.8 (Vite-powered)
-   **Testing**: Vitest + Solid Testing Library + jest-axe

## Features

-   ✅ Type-safe API integration with auto-generated types
-   ✅ Fine-grained reactivity with SolidJS
-   ✅ Server-side rendering with Solid Start
-   ✅ Dark/light theme toggle with local storage persistence
-   ✅ Interactive data visualization with Chart.js
-   ✅ Responsive design with TailwindCSS 4
-   ✅ Comprehensive test coverage (components, accessibility)
-   ✅ Real-time dataset generation with loading states
-   ✅ Flexible time range and interval controls
-   ✅ Accessibility testing with axe-core
-   ✅ Optimized bundle size with fine-grained reactivity

## Getting Started

### Prerequisites

-   Node.js >= 20.0.0
-   Yarn >= 4.0.0
-   Backend API running on `http://localhost:3000`

### Installation

From the root of the monorepo:

```bash
yarn install
```

### Development

```bash
# From root
yarn dev:solid

# Or from this directory
yarn dev
```

The app will start on `http://localhost:3002`

### Generate API Types

Make sure the backend is running, then:

```bash
# From root
yarn generate-types:solid

# Or from this directory
yarn generate-types
```

This fetches the OpenAPI specification from the backend and generates TypeScript types in `src/lib/api/schema.d.ts`.

## Scripts

```bash
# Development server
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui

# Generate coverage report
yarn test:coverage

# Type checking
yarn type-check
```

## Project Structure

```
solid-client/
├── src/
│   ├── app.tsx                 # Root app component
│   ├── app.css                 # Global styles
│   ├── entry-client.tsx        # Client entry point
│   ├── entry-server.tsx        # Server entry point
│   ├── components/
│   │   ├── dataset-chart.tsx   # Chart visualization
│   │   ├── dataset-generator.tsx # Dataset generation form
│   │   ├── dataset-chart.test.tsx
│   │   ├── dataset-generator.test.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── theme-toggle.tsx
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── api/
│   │       ├── client.ts       # API client configuration
│   │       ├── schema.d.ts     # Generated TypeScript types
│   │       └── openapi.json    # OpenAPI specification
│   └── routes/
│       └── index.tsx           # Home page route
├── scripts/
│   └── generate-types.mjs      # Type generation script
├── app.config.ts               # Solid Start configuration
├── vitest.config.ts            # Vitest configuration
├── postcss.config.js           # PostCSS configuration
└── package.json
```

## Environment Variables

Solid Start uses `app.config.ts` for configuration. API URL is configured in the client:

```typescript
// src/lib/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:3000
```

## Components

### DatasetGenerator

Main form component for generating datasets with:

-   Date range picker
-   Interval selection (points or time units)
-   Real-time data fetching with Solid Query
-   Loading and error states
-   Fine-grained reactivity

### DatasetChart

Interactive chart component featuring:

-   Line chart visualization with Chart.js
-   Responsive design
-   Tooltips and legends
-   Dark/light theme support
-   Reactive data updates

### ThemeToggle

Theme switcher component with:

-   Local storage persistence
-   Smooth transitions
-   System preference support
-   Reactive theme updates

## UI Components

Custom UI components built with:

-   SolidJS primitives for reactivity
-   Tailwind CSS for styling
-   Class Variance Authority (CVA) for variants
-   Full TypeScript support

Components include:

-   Button
-   Card
-   Input
-   Label
-   Select

## Testing

Tests are written with:

-   **Vitest**: Fast unit test framework
-   **Solid Testing Library**: SolidJS component testing
-   **jest-axe**: Accessibility testing
-   **Happy DOM**: Lightweight DOM implementation

Run tests:

```bash
yarn test           # Run all tests
yarn test:watch     # Watch mode
yarn test:ui        # Interactive UI
yarn test:coverage  # With coverage report
```

Test coverage is tracked in the `coverage/` directory.

## API Integration

The app uses `openapi-fetch` with auto-generated types for type-safe API calls:

```typescript
import createClient from "openapi-fetch";
import type { paths } from "./schema";

const client = createClient<paths>({
	baseUrl: API_URL,
});

// Fully typed request and response
const { data, error } = await client.GET("/api/dataset", {
	params: {
		query: {
			start: "2024-01-01T00:00:00Z",
			end: "2024-01-07T00:00:00Z",
			points: 100,
		},
	},
});
```

## Performance Optimizations

-   **Fine-grained reactivity**: Only updates what changes, no virtual DOM diffing
-   **Server-side rendering**: Fast initial page loads
-   **Code splitting**: Automatic with Solid Start
-   **TanStack Query**: Efficient data caching and deduplication
-   **TailwindCSS JIT**: On-demand CSS generation
-   **Optimized bundle**: Smaller bundle size compared to React

## SolidJS Benefits

-   **Faster than React**: No virtual DOM overhead
-   **Fine-grained reactivity**: Surgical updates to the DOM
-   **Smaller bundle size**: Less JavaScript to download
-   **Familiar JSX syntax**: Easy to learn for React developers
-   **Built-in store**: No need for external state management
-   **Server-side rendering**: Built into Solid Start

## Accessibility

-   Semantic HTML
-   ARIA labels and roles
-   Keyboard navigation
-   Focus management
-   Automated accessibility testing with jest-axe

## Routing

Solid Start uses file-based routing:

-   Routes are defined in `src/routes/`
-   Automatic code splitting per route
-   Support for layouts, data loading, and error boundaries

## Build and Deployment

```bash
# Build for production
yarn build

# Preview production build
yarn start
```

The production build is optimized with:

-   Code splitting
-   Tree shaking
-   Minification
-   CSS optimization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Jesse Koldewijn
