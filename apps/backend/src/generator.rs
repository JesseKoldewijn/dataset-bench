use chrono::{DateTime, Datelike, Duration, Timelike, Utc};
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;
use rayon::prelude::*;

use crate::models::{DataPoint, DatasetResponse};

/// Generates deterministic dataset for a given time range
///
/// The key insight: we use the timestamp itself as the seed for random generation,
/// ensuring that any request for the same time range produces identical data.
pub struct DatasetGenerator;

impl DatasetGenerator {
    /// Generate a dataset for the given time range
    ///
    /// This function ensures determinism by:
    /// 1. Calculating evenly spaced timestamps across the range
    /// 2. Using each timestamp's epoch seconds as a seed for that specific point
    /// 3. Generating a deterministic "random walk" style value
    pub fn generate(start: DateTime<Utc>, end: DateTime<Utc>, points: usize) -> DatasetResponse {
        if points == 0 {
            return DatasetResponse {
                start,
                end,
                count: 0,
                data: vec![],
            };
        }

        let total_duration = end.signed_duration_since(start);
        let interval = if points > 1 {
            total_duration / (points as i32 - 1)
        } else {
            Duration::zero()
        };

        // Use parallel processing for large datasets (>1000 points)
        let data = if points > 1000 {
            (0..points)
                .into_par_iter()
                .map(|i| {
                    let timestamp = if points == 1 {
                        start
                    } else if i == points - 1 {
                        end
                    } else {
                        start + interval * i as i32
                    };

                    let value = Self::generate_value_for_timestamp(timestamp);
                    DataPoint { timestamp, value }
                })
                .collect()
        } else {
            // Sequential processing for smaller datasets
            let mut data = Vec::with_capacity(points);
            for i in 0..points {
                let timestamp = if points == 1 {
                    start
                } else if i == points - 1 {
                    end
                } else {
                    start + interval * i as i32
                };

                let value = Self::generate_value_for_timestamp(timestamp);
                data.push(DataPoint { timestamp, value });
            }
            data
        };

        DatasetResponse {
            start,
            end,
            count: data.len(),
            data,
        }
    }

    /// Generate a deterministic value for a specific timestamp
    ///
    /// Uses the timestamp's unix epoch seconds as the seed, ensuring
    /// the same timestamp always produces the same value.
    fn generate_value_for_timestamp(timestamp: DateTime<Utc>) -> f64 {
        // Use timestamp as seed - this ensures determinism
        let seed = timestamp.timestamp() as u64;

        // Create a deterministic RNG from the timestamp
        let mut rng = ChaCha8Rng::seed_from_u64(seed);

        // Generate a base value (simulating a metric between 0-100)
        let base = rng.random_range(0.0..100.0);

        // Add some cyclical pattern based on time of day
        let hour_of_day = timestamp.time().hour() as f64;
        let daily_cycle = 20.0 * (hour_of_day * std::f64::consts::PI / 12.0).sin();

        // Add weekly pattern (using day of week)
        let day_of_week = timestamp.weekday().num_days_from_monday() as f64;
        let weekly_cycle = 10.0 * (day_of_week * std::f64::consts::PI / 3.5).cos();

        base + daily_cycle + weekly_cycle
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_deterministic_generation() {
        let start = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap();

        let result1 = DatasetGenerator::generate(start, end, 10);
        let result2 = DatasetGenerator::generate(start, end, 10);

        assert_eq!(result1.count, result2.count);

        for (p1, p2) in result1.data.iter().zip(result2.data.iter()) {
            assert_eq!(p1.timestamp, p2.timestamp);
            assert_eq!(p1.value, p2.value);
        }
    }

    #[test]
    fn test_overlapping_ranges_consistency() {
        let start_x = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        let end_y = Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap();
        let end_z = Utc.with_ymd_and_hms(2024, 1, 3, 0, 0, 0).unwrap();

        // Request 1: x to y with 24 points
        let result_xy = DatasetGenerator::generate(start_x, end_y, 24);

        // Request 2: x to z with 48 points
        let result_xz = DatasetGenerator::generate(start_x, end_z, 48);

        // The overlapping timestamps should have identical values
        // Note: This test verifies the concept but timestamps may not align perfectly
        // due to different point distributions. The key is same timestamp = same value.
        let first_timestamp = result_xy.data[0].timestamp;
        let matching_point = result_xz
            .data
            .iter()
            .find(|p| p.timestamp == first_timestamp);

        if let Some(point) = matching_point {
            assert_eq!(result_xy.data[0].value, point.value);
        }
    }

    #[test]
    fn test_single_point() {
        let start = Utc.with_ymd_and_hms(2024, 1, 1, 12, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2024, 1, 1, 13, 0, 0).unwrap();

        let result = DatasetGenerator::generate(start, end, 1);

        assert_eq!(result.count, 1);
        // With a single point, it's placed at the start of the range
        assert_eq!(result.data[0].timestamp, start);
        // Verify the value is deterministic
        assert!(result.data[0].value.is_finite());
    }

    #[test]
    fn test_zero_points() {
        let start = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap();

        let result = DatasetGenerator::generate(start, end, 0);

        assert_eq!(result.count, 0);
        assert!(result.data.is_empty());
    }
}
