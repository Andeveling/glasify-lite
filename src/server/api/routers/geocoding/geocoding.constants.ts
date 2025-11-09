/**
 * Geocoding Constants - DEPRECATED
 *
 * @deprecated Use constants from lib/constants instead
 * - Geocoding API config: @lib/constants/geocoding.constants
 * - Coordinate math: @lib/constants/coordinate.constants
 * - Transportation: @lib/constants/transportation.constants
 */

export {
  DISTANCE_PRECISION_DIVISOR,
  DISTANCE_PRECISION_MULTIPLIER,
  EARTH_RADIUS_METERS,
  MILLISECONDS_TO_SECONDS_DIVISOR,
} from "@/lib/constants/coordinate.constants";
// Re-export for backwards compatibility
export {
  GEOCODING_API_TIMEOUT_MS,
  GEOCODING_API_URL,
  GEOCODING_DEFAULT_LANGUAGE,
  GEOCODING_DEFAULT_LIMIT,
  GEOCODING_MAX_LIMIT,
  GEOCODING_QUERY_MAX_LENGTH,
  GEOCODING_QUERY_MIN_LENGTH,
} from "@/lib/constants/geocoding.constants";

export { TRANSPORTATION_MAX_DISTANCE_KM } from "@/lib/constants/transportation.constants";
