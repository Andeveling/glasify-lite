/**
 * Coordinate & Geography Constants
 *
 * Centralized configuration for:
 * - Geographic bounds and precision
 * - Distance calculations (Haversine formula)
 * - Mathematical conversion factors
 */

// Geographic bounds (WGS84 standard)
export const LATITUDE_MIN = -90;
export const LATITUDE_MAX = 90;
export const LONGITUDE_MIN = -180;
export const LONGITUDE_MAX = 180;

// Coordinate precision
export const COORDINATE_DECIMAL_PLACES = 7; // ~1cm precision
export const COORDINATE_DISPLAY_DECIMAL_PLACES = 4;

// Earth's radius for distance calculations (Haversine formula)
export const EARTH_RADIUS_METERS = 6_371_000;
export const EARTH_RADIUS_KM = 6371;

// Distance precision formatting
export const DISTANCE_PRECISION_MULTIPLIER = 100; // For 2 decimal places
export const DISTANCE_PRECISION_DIVISOR = 100;

// Mathematical conversion factors
export const DEGREES_TO_RADIANS_FACTOR = 180;
export const MILLISECONDS_TO_SECONDS_DIVISOR = 1000;
