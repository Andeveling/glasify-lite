/**
 * Geocoding Constants
 *
 * Feature: 001-delivery-address
 * Purpose: Configuration constants for geocoding API and coordinates
 */

/**
 * Nominatim API Configuration
 */
export const GEOCODING_API_URL = "https://nominatim.openstreetmap.org";
export const GEOCODING_API_TIMEOUT_MS = 5000; // 5 seconds
export const GEOCODING_RATE_LIMIT_PER_SECOND = 1; // Nominatim usage policy
export const GEOCODING_USER_AGENT = "Glasify-Lite/1.0";
export const GEOCODING_DEFAULT_LANGUAGE = "es";
export const GEOCODING_DEFAULT_LIMIT = 5;
export const GEOCODING_MAX_LIMIT = 10;

/**
 * Coordinate Validation Ranges
 */
export const MIN_LATITUDE = -90;
export const MAX_LATITUDE = 90;
export const MIN_LONGITUDE = -180;
export const MAX_LONGITUDE = 180;
export const COORDINATE_DECIMAL_PLACES = 7; // ~1cm precision

/**
 * Address Field Length Limits
 */
export const MAX_LABEL_LENGTH = 100;
export const MAX_COUNTRY_LENGTH = 100;
export const MAX_REGION_LENGTH = 100;
export const MAX_CITY_LENGTH = 100;
export const MAX_DISTRICT_LENGTH = 100;
export const MAX_STREET_LENGTH = 200;
export const MAX_REFERENCE_LENGTH = 200;
export const MAX_POSTAL_CODE_LENGTH = 20;

/**
 * Map Configuration (for Phase 6: User Story 4)
 */
export const DEFAULT_MAP_ZOOM = 13;
export const MIN_MAP_ZOOM = 3;
export const MAX_MAP_ZOOM = 18;
export const MAP_MARKER_COLOR = "#3B82F6"; // Primary blue

/**
 * Transportation Configuration
 */
export const WAREHOUSE_CACHE_TIME_MS = 300_000; // 5 minutes
export const TRANSPORTATION_COST_CACHE_TIME_MS = 300_000; // 5 minutes
export const TRANSPORTATION_MAX_DISTANCE_KM = 1000; // Flag quotes >1000km for review

/**
 * Precision constants for distance calculations
 */
export const DISTANCE_PRECISION_MULTIPLIER = 100; // For 2 decimal places (km)
export const DISTANCE_PRECISION_DIVISOR = 100;

/**
 * Earth's radius in meters (for Haversine distance calculation)
 */
export const EARTH_RADIUS_METERS = 6_371_000;
export const EARTH_RADIUS_KM = 6371;

/**
 * Math constants
 */
export const DEGREES_TO_RADIANS_FACTOR = 180;

/**
 * Conversion constants
 */
export const MILLISECONDS_TO_SECONDS_DIVISOR = 1000;

/**
 * Display formatting constants
 */
export const COORDINATE_DISPLAY_DECIMAL_PLACES = 4;
