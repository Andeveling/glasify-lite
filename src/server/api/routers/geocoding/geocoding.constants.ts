/**
 * Geocoding Constants
 *
 * Configuration values for geocoding operations
 */

// Query validation
export const GEOCODING_QUERY_MIN_LENGTH = 3;
export const GEOCODING_QUERY_MAX_LENGTH = 500;
export const GEOCODING_DEFAULT_LIMIT = 5;
export const GEOCODING_MAX_LIMIT = 10;
export const GEOCODING_DEFAULT_LANGUAGE = "es";

// API configuration
export const GEOCODING_API_URL = "https://nominatim.openstreetmap.org";
export const GEOCODING_API_TIMEOUT_MS = 5000;
export const MILLISECONDS_TO_SECONDS_DIVISOR = 1000;

// Precision
export const DISTANCE_PRECISION_MULTIPLIER = 100;
export const DISTANCE_PRECISION_DIVISOR = 100;
export const EARTH_RADIUS_METERS = 6_371_000; // Haversine formula constant

// Transportation
export const TRANSPORTATION_MAX_DISTANCE_KM = 1000;
