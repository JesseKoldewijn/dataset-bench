# Backend API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A high-performance deterministic time-series dataset generation API built with Rust, Axum, and utoipa.

## Tech Stack

-   **Framework**: Axum 0.8
-   **Runtime**: Tokio (async runtime)
-   **API Documentation**: utoipa + Swagger UI
-   **Serialization**: Serde + serde_json
-   **Compression**: tower-http (GZIP)
-   **CORS**: tower-http
-   **Data Generation**: rand, rand_chacha (deterministic)
-   **Parallel Processing**: rayon

## Features

-   ✅ Deterministic time-series data generation with seeded RNG
-   ✅ Flexible time interval generation (minutes, hours, days, weeks, months)
-   ✅ GZIP compression support
-   ✅ CORS enabled for frontend clients
-   ✅ OpenAPI 3.0 specification
-   ✅ Interactive Swagger UI documentation
-   ✅ Type-safe request/response handling
-   ✅ Request timeout middleware (30s)
-   ✅ Parallel data generation with rayon

## API Endpoints

### Health Check

```
GET /api/health-check
```

Returns the health status of the API.

**Response:**

```json
{
	"status": "ok",
	"message": "Service is healthy"
}
```

### Generate Dataset

```
GET /api/dataset?start=2024-01-01T00:00:00Z&end=2024-01-07T00:00:00Z&points=100
```

Generate a deterministic time-series dataset between two timestamps.

**Query Parameters:**

-   `start` (required): ISO 8601 datetime - Start of the time range
-   `end` (required): ISO 8601 datetime - End of the time range
-   `points` (optional): Number of data points to generate (mutually exclusive with `point_by`)
-   `point_by` (optional): Time unit for intervals - `minutes`, `hours`, `days`, `weeks`, `months` (mutually exclusive with `points`)

**Example Requests:**

```bash
# Generate 100 evenly distributed points
curl "http://localhost:3000/api/dataset?start=2024-01-01T00:00:00Z&end=2024-01-07T00:00:00Z&points=100"

# Generate hourly data points
curl "http://localhost:3000/api/dataset?start=2024-01-01T00:00:00Z&end=2024-01-07T00:00:00Z&point_by=hours"

# Generate daily data points
curl "http://localhost:3000/api/dataset?start=2024-01-01T00:00:00Z&end=2024-01-31T00:00:00Z&point_by=days"
```

**Response:**

```json
{
	"data": [
		{
			"timestamp": "2024-01-01T00:00:00Z",
			"value": 42.5
		}
	],
	"count": 100,
	"start": "2024-01-01T00:00:00Z",
	"end": "2024-01-07T00:00:00Z"
}
```

### Get Time Series

```
GET /api/timeseries?start=2024-01-01T00:00:00Z&end=2024-01-07T00:00:00Z&point_by=hours
```

Alias endpoint for dataset generation (same functionality as `/api/dataset`).

## Getting Started

### Prerequisites

-   Rust (latest stable)
-   Cargo

### Install Dependencies

Dependencies are managed through `Cargo.toml` and will be automatically installed on build.

### Development

Run the development server:

```bash
cargo run
```

The server will start on `http://localhost:3000`

### Build for Production

```bash
cargo build --release
```

The optimized binary will be in `target/release/rust-dataset-bench`

### Run Production Build

```bash
./target/release/rust-dataset-bench
```

## Documentation

Once the server is running, you can access:

-   **Swagger UI**: http://localhost:3000/swagger-ui
-   **OpenAPI Spec**: http://localhost:3000/api-doc/openapi.json

## Configuration

The API uses the following default configuration:

-   **Host**: `0.0.0.0`
-   **Port**: `3000`
-   **Request Timeout**: 30 seconds
-   **Compression**: GZIP enabled
-   **CORS**: All origins allowed (configure for production)

## Data Generation

The API generates deterministic data using a seeded random number generator (ChaCha). The same time range and parameters will always produce the same dataset, making it perfect for:

-   Testing and development
-   Reproducible demos
-   Benchmark comparisons
-   Data visualization prototypes

Values are generated in the range of -100.0 to 100.0 with random walk characteristics.

## Project Structure

```
backend/
├── src/
│   ├── main.rs         # Application entry point, server setup
│   ├── handlers.rs     # API route handlers
│   ├── models.rs       # Data models and schemas
│   └── generator.rs    # Dataset generation logic
├── Cargo.toml          # Rust dependencies and configuration
└── target/             # Compiled output (ignored in git)
```

## Integration with Frontend Clients

This backend is designed to work with the frontend clients in the monorepo:

-   React client (Next.js 15) at `http://localhost:3001`
-   Solid client (Solid Start) at `http://localhost:3002`

Both clients use the OpenAPI specification to generate type-safe API clients.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Jesse Koldewijn
