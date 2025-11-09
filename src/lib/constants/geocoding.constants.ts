/**
 * Geocoding API Constants
 *
 * Configuration specific to Nominatim geocoding service
 */

// Nominatim API configuration
export const GEOCODING_API_URL = "https://nominatim.openstreetmap.org";
export const GEOCODING_API_TIMEOUT_MS = 5000; // 5 seconds
export const GEOCODING_RATE_LIMIT_PER_SECOND = 1; // API usage policy
export const GEOCODING_USER_AGENT =
  "Glasify-Lite/1.0 (Contact: admin@glasify.com)";

// Search defaults and limits
export const GEOCODING_DEFAULT_LANGUAGE = "es";
export const GEOCODING_DEFAULT_LIMIT = 5;
export const GEOCODING_MAX_LIMIT = 10;

// Query validation
export const GEOCODING_QUERY_MIN_LENGTH = 3;
export const GEOCODING_QUERY_MAX_LENGTH = 500;
