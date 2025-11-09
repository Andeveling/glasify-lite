/**
 * Geocoding Types
 *
 * Server-side type definitions for geocoding operations
 * Used by geocoding service and transportation calculations
 */

/**
 * Coordinate pair
 */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Geocoding search result from Nominatim API
 */
export type GeocodingResult = {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  address: {
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    postcode?: string;
  };
  boundingBox?: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
};

/**
 * Geocoding API response
 */
export type GeocodingResponse = {
  results: GeocodingResult[];
  totalResults: number;
  queryTime: number;
};
