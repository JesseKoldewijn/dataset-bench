# React Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A modern, type-safe React frontend for the Dataset Generation API built with Next.js 15, TypeScript, and TailwindCSS.

## Tech Stack

-   **Framework**: Next.js 15.0.3 (App Router)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS 4 (CSS-based configuration)
-   **UI Components**: shadcn/ui with Radix UI primitives
-   **State Management**: TanStack Query (React Query v5)
-   **API Client**: openapi-fetch with generated TypeScript types
-   **Charts**: Chart.js with react-chartjs-2
-   **Theme**: next-themes (dark/light mode support)
-   **Testing**: Vitest + Testing Library + jest-axe
-   **Build Tool**: Vite (for tests)
-   **React Compiler**: Enabled for performance optimization

## Features

-   ✅ Type-safe API integration with auto-generated types
-   ✅ Server-side rendering with Next.js App Router
-   ✅ Dark/light theme toggle with system preference detection
-   ✅ Interactive data visualization with Chart.js
-   ✅ Responsive design with TailwindCSS 4
-   ✅ Comprehensive test coverage (components, accessibility)
-   ✅ Optimized with React 19 Compiler
-   ✅ Real-time dataset generation with loading states
-   ✅ Flexible time range and interval controls
-   ✅ Accessibility testing with axe-core

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
yarn dev:react

# Or from this directory
yarn dev
```

The app will start on `http://localhost:3001`

### Generate API Types

Make sure the backend is running, then:

```bash
# From root
yarn generate-types:react

# Or from this directory
yarn generate-types
```

This fetches the OpenAPI specification from the backend and generates TypeScript types in `lib/api/schema.d.ts`.

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

# Linting
yarn lint
```

## Project Structure

```
react-client/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # React Query provider
│   └── globals.css         # Global styles
├── components/
│   ├── dataset-chart.tsx   # Chart visualization component
│   ├── dataset-generator.tsx # Dataset generation form
│   ├── dataset-chart.test.tsx
│   ├── dataset-generator.test.tsx
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── theme-toggle.tsx
├── lib/
│   ├── utils.ts            # Utility functions
│   └── api/
│       ├── client.ts       # API client configuration
│       ├── schema.d.ts     # Generated TypeScript types
│       └── openapi.json    # OpenAPI specification
├── scripts/
│   └── generate-types.mjs  # Type generation script
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # TailwindCSS configuration
├── vitest.config.ts        # Vitest configuration
└── package.json
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Components

### DatasetGenerator

Main form component for generating datasets with:

-   Date range picker
-   Interval selection (points or time units)
-   Real-time data fetching with React Query
-   Loading and error states

### DatasetChart

Interactive chart component featuring:

-   Line chart visualization with Chart.js
-   Responsive design
-   Tooltips and legends
-   Dark/light theme support

### ThemeToggle

Theme switcher component with:

-   System preference detection
-   Smooth transitions
-   Persistent theme selection

## UI Components (shadcn/ui)

All UI components are built with:

-   Radix UI primitives for accessibility
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
-   **Testing Library**: React component testing
-   **jest-axe**: Accessibility testing
-   **Happy DOM**: Lightweight DOM implementation

Run tests:

```bash
yarn test           # Run all tests
yarn test:watch     # Watch mode
yarn test:ui        # Interactive UI
yarn test:coverage  # With coverage report
```

## API Integration

The app uses `openapi-fetch` with auto-generated types for type-safe API calls:

```typescript
import createClient from "openapi-fetch";
import type { paths } from "./schema";

const client = createClient<paths>({
	baseUrl: process.env.NEXT_PUBLIC_API_URL,
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

-   React 19 Compiler enabled for automatic optimization
-   Server-side rendering with Next.js App Router
-   TanStack Query for efficient data caching
-   Code splitting and lazy loading
-   TailwindCSS JIT compilation

## Accessibility

-   Semantic HTML
-   ARIA labels and roles
-   Keyboard navigation
-   Focus management
-   Automated accessibility testing with jest-axe

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Jesse Koldewijn
