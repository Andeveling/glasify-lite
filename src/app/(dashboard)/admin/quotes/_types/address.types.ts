/**
 * Address Types - DEPRECATED
 *
 * @deprecated
 * Types have been moved to server layer for SOLID principles
 *
 * Import from:
 * - @server/types/address.types (ProjectAddress, ProjectAddressInput)
 * - @server/types/geocoding.types (GeocodingResult, GeocodingResponse, Coordinates)
 * - @server/types/transportation.types (WarehouseLocation, TransportationCost)
 */

// Re-export for backwards compatibility
export type {
  ProjectAddress,
  ProjectAddressInput,
} from "@/server/types/address.types";

export type {
  Coordinates,
  GeocodingResponse,
  GeocodingResult,
} from "@/server/types/geocoding.types";

export type {
  TransportationCost,
  WarehouseLocation,
} from "@/server/types/transportation.types";
