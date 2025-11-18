use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

/// Time unit for point generation
#[derive(Debug, Clone, Copy, Deserialize, Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum TimeUnit {
    /// Generate points by minutes
    Minutes,
    /// Generate points by hours
    Hours,
    /// Generate points by days
    Days,
    /// Generate points by weeks
    Weeks,
    /// Generate points by months
    Months,
}

/// A single data point in the time series
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct DataPoint {
    /// Timestamp of the data point
    #[schema(value_type = String, example = "2024-01-01T12:00:00Z")]
    pub timestamp: DateTime<Utc>,
    /// Value at this timestamp
    #[schema(example = 42.5)]
    pub value: f64,
}

/// Query parameters for dataset requests
#[derive(Debug, Deserialize, IntoParams, ToSchema)]
pub struct DatasetQuery {
    /// Start of the time range (ISO 8601 format)
    #[param(example = "2024-01-01T00:00:00Z")]
    pub start: DateTime<Utc>,
    /// End of the time range (ISO 8601 format)
    #[param(example = "2024-01-02T00:00:00Z")]
    pub end: DateTime<Utc>,
    /// Number of data points to generate. Either points or point_by must be specified.
    #[param(example = 100)]
    pub points: Option<usize>,
    /// Generate points by time unit. Either points or point_by must be specified.
    #[param(example = "hours")]
    pub point_by: Option<TimeUnit>,
}

/// Response containing the generated dataset
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DatasetResponse {
    /// Start of the time range
    #[schema(value_type = String, example = "2024-01-01T00:00:00Z")]
    pub start: DateTime<Utc>,
    /// End of the time range
    #[schema(value_type = String, example = "2024-01-02T00:00:00Z")]
    pub end: DateTime<Utc>,
    /// Number of data points in the dataset
    #[schema(example = 100)]
    pub count: usize,
    /// Array of data points
    pub data: Vec<DataPoint>,
}

/// Health check response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct HealthResponse {
    /// Service status
    #[schema(example = "healthy")]
    pub status: String,
    /// Current server timestamp
    #[schema(value_type = String, example = "2024-01-01T12:00:00Z")]
    pub timestamp: DateTime<Utc>,
}
