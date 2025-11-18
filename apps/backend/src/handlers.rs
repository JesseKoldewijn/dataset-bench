use axum::{
    extract::Query,
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use chrono::Utc;

use crate::generator::DatasetGenerator;
use crate::models::{DatasetQuery, DatasetResponse, HealthResponse, TimeUnit};

/// Health check endpoint
#[utoipa::path(
    get,
    path = "/api/health-check",
    responses(
        (status = 200, description = "Service is healthy", body = HealthResponse)
    ),
    tag = "health"
)]
pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        timestamp: Utc::now(),
    })
}

/// Get dataset with deterministic generation
/// 
/// This endpoint generates a time-series dataset for the specified date range.
/// The data generation is deterministic, meaning that requesting the same
/// time range will always produce identical data points, even across different requests.
#[utoipa::path(
    get,
    path = "/api/dataset",
    params(DatasetQuery),
    responses(
        (status = 200, description = "Dataset generated successfully", body = DatasetResponse),
        (status = 400, description = "Invalid date range or parameters")
    ),
    tag = "dataset"
)]
pub async fn get_dataset(
    Query(params): Query<DatasetQuery>,
) -> Result<Json<DatasetResponse>, (StatusCode, String)> {
    // Validate date range
    if params.end <= params.start {
        return Err((
            StatusCode::BAD_REQUEST,
            "End date must be after start date".to_string(),
        ));
    }

    // Validate that either points or point_by is specified
    let points = match (&params.points, &params.point_by) {
        (None, None) => {
            return Err((
                StatusCode::BAD_REQUEST,
                "Either 'points' or 'point_by' parameter must be specified".to_string(),
            ));
        }
        (Some(_), Some(_)) => {
            return Err((
                StatusCode::BAD_REQUEST,
                "Cannot specify both 'points' and 'point_by' parameters".to_string(),
            ));
        }
        (Some(p), None) => *p,
        (None, Some(unit)) => calculate_points_from_time_unit(params.start, params.end, *unit)?,
    };
    
    if points == 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            "Number of points must be greater than 0".to_string(),
        ));
    }

    let dataset = DatasetGenerator::generate(params.start, params.end, points);
    
    Ok(Json(dataset))
}

/// Get time-series dataset (alternative endpoint for clarity)
#[utoipa::path(
    get,
    path = "/api/timeseries",
    params(DatasetQuery),
    responses(
        (status = 200, description = "Time series data generated successfully", body = DatasetResponse),
        (status = 400, description = "Invalid date range or parameters")
    ),
    tag = "dataset"
)]
pub async fn get_timeseries(
    Query(params): Query<DatasetQuery>,
) -> Result<Json<DatasetResponse>, (StatusCode, String)> {
    // Reuse the same logic
    get_dataset(Query(params)).await
}

/// Helper function to calculate number of points based on time unit
fn calculate_points_from_time_unit(
    start: chrono::DateTime<Utc>,
    end: chrono::DateTime<Utc>,
    unit: TimeUnit,
) -> Result<usize, (StatusCode, String)> {
    let duration = end - start;
    
    let points = match unit {
        TimeUnit::Minutes => {
            let minutes = duration.num_minutes();
            if minutes <= 0 {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Time range is too small for the specified time unit".to_string(),
                ));
            }
            minutes as usize
        }
        TimeUnit::Hours => {
            let hours = duration.num_hours();
            if hours <= 0 {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Time range is too small for the specified time unit".to_string(),
                ));
            }
            hours as usize
        }
        TimeUnit::Days => {
            let days = duration.num_days();
            if days <= 0 {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Time range is too small for the specified time unit".to_string(),
                ));
            }
            days as usize
        }
        TimeUnit::Weeks => {
            let weeks = duration.num_weeks();
            if weeks <= 0 {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Time range is too small for the specified time unit".to_string(),
                ));
            }
            weeks as usize
        }
        TimeUnit::Months => {
            // Approximate months as 30 days
            let days = duration.num_days();
            let months = days / 30;
            if months <= 0 {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Time range is too small for the specified time unit (need at least 30 days)".to_string(),
                ));
            }
            months as usize
        }
    };
    
    Ok(points)
}

/// Create the application router with all endpoints
pub fn create_router() -> Router {
    Router::new()
        .route("/api/health-check", get(health_check))
        .route("/api/dataset", get(get_dataset))
        .route("/api/timeseries", get(get_timeseries))
}
