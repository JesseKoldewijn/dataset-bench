# Dataset Bench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A monorepo containing a deterministic time-series dataset generation API built with Rust (Axum) and modern frontend clients built with React and Solid.js.

## Structure

```
rust-dataset-bench/
├── apps/
│   ├── backend/          # Rust API (Axum + utoipa)
│   ├── react-client/     # Next.js 15 + TypeScript client
│   └── solid-client/     # Solid.js + TypeScript client
├── package.json          # Root workspace config
├── turbo.json           # Turborepo configuration
└── .yarnrc.yml          # Yarn 4 configuration
```

## Tech Stack

### Backend (Rust)

-   **Framework**: Axum 0.8
-   **Runtime**: Tokio
-   **API Docs**: utoipa + Swagger UI
-   **Features**: Deterministic data generation, GZIP compression, CORS support

### Frontend (React)

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS 4 (CSS-based config)
-   **UI Components**: shadcn/ui
-   **Data Fetching**: TanStack Query (React Query)
-   **API Client**: openapi-fetch with generated types
-   **Charts**: Chart.js + react-chartjs-2
-   **Testing**: Vitest + Testing Library

### Frontend (Solid.js)

-   **Framework**: Solid Start (SolidJS)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS 4 (CSS-based config)
-   **UI Components**: Custom components with CVA
-   **Data Fetching**: TanStack Query (Solid Query)
-   **API Client**: openapi-fetch with generated types
-   **Charts**: Chart.js + solid-chartjs
-   **Testing**: Vitest + Solid Testing Library

## Prerequisites

-   Node.js >= 20.0.0
-   Yarn >= 4.0.0
-   Rust (latest stable)
-   Cargo

## Getting Started

### 1. Install Dependencies

```bash
# Install Yarn if needed
corepack enable

# Install frontend dependencies
yarn install
```

### 2. Start Backend API

```bash
# From root directory
yarn dev:backend

# Or directly
cd apps/backend && cargo run
```

The backend will start on `http://localhost:3000`

-   Swagger UI: http://localhost:3000/swagger-ui
-   OpenAPI spec: http://localhost:3000/api-doc/openapi.json

### 3. Generate TypeScript Types

The `generate-types` script automatically starts the backend, waits for it to be ready, then generates types for both clients concurrently:

```bash
# Automatically starts backend, generates types for all clients, then stops backend
yarn generate-types
```

Or generate types for individual clients (requires backend to be running):

```bash
# Generate types for React client only
yarn generate-types:react

# Generate types for Solid client only
yarn generate-types:solid
```

This fetches the OpenAPI spec and generates TypeScript types for the frontends.

### 4. Start Frontend

```bash
# React client (Next.js)
yarn dev:react

# Solid client (Solid Start)
yarn dev:solid
```

-   React client: `http://localhost:3001`
-   Solid client: `http://localhost:3002`

### 5. Run All Concurrently

```bash
yarn dev
```

This runs the backend and both frontend clients simultaneously.

## API Endpoints

### Health Check

```
GET /api/health-check
```

### Generate Dataset

```
GET /api/dataset?start=2024-01-01T00:00:00Z&end=2024-01-07T00:00:00Z&points=100
GET /api/dataset?start=2024-01-01T00:00:00Z&end=2024-01-07T00:00:00Z&point_by=hours
```

Parameters:

-   `start`: ISO 8601 datetime (required)
-   `end`: ISO 8601 datetime (required)
-   `points`: Number of data points (mutually exclusive with `point_by`)
-   `point_by`: Time unit - `minutes`, `hours`, `days`, `weeks`, `months` (mutually exclusive with `points`)

## Development

### Build Backend

```bash
yarn build:backend
```

### Build Frontends

```bash
# React client
yarn build:react

# Solid client
yarn build:solid

# All
yarn build
```

### Test

```bash
yarn test
```

### Type Check

```bash
yarn type-check
```

### Lint

```bash
yarn lint
```

## Features

-   ✅ Monorepo with Turborepo
-   ✅ Deterministic time-series data generation
-   ✅ Type-safe API client with OpenAPI
-   ✅ Responsive UI with dark/light mode
-   ✅ Interactive data visualization
-   ✅ GZIP compression
-   ✅ CORS configured
-   ✅ Swagger documentation
-   ✅ Multiple frontend implementations (React & Solid.js)
-   ✅ Comprehensive test coverage with Vitest

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Jesse Koldewijn
