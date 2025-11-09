/**
 * Transportation Constants - DEPRECATED
 *
 * @deprecated Use constants from lib/constants instead
 * - Coordinate ranges: @lib/constants/coordinate.constants
 * - Transportation config: @lib/constants/transportation.constants
 */

// Re-export for backwards compatibility
export {
  DISTANCE_PRECISION_DIVISOR,
  DISTANCE_PRECISION_MULTIPLIER,
  EARTH_RADIUS_METERS,
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
} from "@/lib/constants/coordinate.constants";

export { TRANSPORTATION_MAX_DISTANCE_KM } from "@/lib/constants/transportation.constants";
