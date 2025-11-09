/**
 * Geocoding Constants - DEPRECATED
 *
 * @deprecated
 * Constants have been consolidated to lib/constants/
 *
 * Import from:
 * - @lib/constants/geocoding.constants
 * - @lib/constants/coordinate.constants
 * - @lib/constants/transportation.constants
 * - @lib/constants/address.constants
 */

export {
  DEFAULT_MAP_ZOOM,
  MAP_MARKER_COLOR,
  MAX_CITY_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_DISTRICT_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_MAP_ZOOM,
  MAX_POSTAL_CODE_LENGTH,
  MAX_REFERENCE_LENGTH,
  MAX_REGION_LENGTH,
  MAX_STREET_LENGTH,
  MIN_MAP_ZOOM,
} from "@/lib/constants/address.constants";

export {
  COORDINATE_DECIMAL_PLACES,
  COORDINATE_DISPLAY_DECIMAL_PLACES,
  DEGREES_TO_RADIANS_FACTOR,
  DISTANCE_PRECISION_DIVISOR,
  DISTANCE_PRECISION_MULTIPLIER,
  EARTH_RADIUS_KM,
  EARTH_RADIUS_METERS,
  LATITUDE_MAX as MAX_LATITUDE,
  LATITUDE_MIN as MIN_LATITUDE,
  LONGITUDE_MAX as MAX_LONGITUDE,
  LONGITUDE_MIN as MIN_LONGITUDE,
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
  GEOCODING_RATE_LIMIT_PER_SECOND,
  GEOCODING_USER_AGENT,
} from "@/lib/constants/geocoding.constants";
export {
  TRANSPORTATION_COST_CACHE_TIME_MS,
  TRANSPORTATION_MAX_DISTANCE_KM,
  WAREHOUSE_CACHE_TIME_MS,
} from "@/lib/constants/transportation.constants";
