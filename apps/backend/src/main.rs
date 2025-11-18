mod generator;
mod handlers;
mod models;

use axum::Router;
use std::net::SocketAddr;
use std::time::Duration;
use tower::ServiceBuilder;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{Any, CorsLayer};
use tower_http::timeout::TimeoutLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::handlers::create_router;
use crate::models::{DataPoint, DatasetQuery, DatasetResponse, HealthResponse};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::health_check,
        handlers::get_dataset,
        handlers::get_timeseries,
    ),
    components(
        schemas(DataPoint, DatasetQuery, DatasetResponse, HealthResponse)
    ),
    tags(
        (name = "health", description = "Health check endpoints"),
        (name = "dataset", description = "Dataset generation endpoints")
    ),
    info(
        title = "Dataset API",
        version = "1.0.0",
        description = "A deterministic time-series dataset generation API with gzip compression support",
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    // Create the main API router
    let api_router = create_router();

    // Merge with Swagger UI
    let app = Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-doc/openapi.json", ApiDoc::openapi()))
        .merge(api_router)
        // Add middleware layers
        .layer(
            ServiceBuilder::new()
                // 60 second timeout for all requests
                .layer(TimeoutLayer::new(Duration::from_secs(60)))
                // Gzip compression
                .layer(CompressionLayer::new())
                // CORS - allow requests from frontend
                .layer(
                    CorsLayer::new()
                        .allow_origin(Any)
                        .allow_methods(Any)
                        .allow_headers(Any)
                )
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("🚀 Server starting on http://{}", addr);
    println!("📚 Swagger UI available at http://{}/swagger-ui", addr);
    println!(
        "📄 OpenAPI spec available at http://{}/api-doc/openapi.json",
        addr
    );

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}
