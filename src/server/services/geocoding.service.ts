/**
 * Geocoding Service - Nominatim API Integration
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Integrate with Nominatim (OpenStreetMap) geocoding API to convert
 * address strings to geographic coordinates.
 *
 * API Documentation: https://nominatim.org/release-docs/latest/api/Search/
 *
 * Rate Limiting: 1 request per second (enforced at tRPC layer)
 * Timeout: 5 seconds per request
 * User-Agent: Required by Nominatim to identify the application
 */

import { MILLISECONDS_TO_SECONDS_DIVISOR } from "@/lib/constants/coordinate.constants";
import {
  GEOCODING_API_TIMEOUT_MS,
  GEOCODING_API_URL,
  GEOCODING_DEFAULT_LANGUAGE,
  GEOCODING_USER_AGENT,
} from "@/lib/constants/geocoding.constants";
import logger from "@/lib/logger";
import type {
  GeocodingResponse,
  GeocodingResult,
} from "@/server/types/geocoding.types";

/**
 * Nominatim API response structure
 * Maps to our internal GeocodingResult type
 */
type NominatimResult = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
    road?: string;
    suburb?: string;
    county?: string;
  };
  boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
};

/**
 * Search for addresses using Nominatim geocoding API
 *
 * @param query - Address search string (e.g., "Calle 123, Bogotá, Colombia")
 * @param limit - Maximum number of results to return (1-10, default 5)
 * @param acceptLanguage - Language for results (default 'es' for Spanish)
 * @returns Promise with geocoding results and metadata
 *
 * @throws Error if API request fails or times out
 *
 * @example
 * const results = await searchAddress('Calle 72 #10-34, Bogotá');
 * console.log(results.results[0].displayName);
 * console.log(results.results[0].coordinates); // { latitude: 4.6533, longitude: -74.0836 }
 */
export async function searchAddress(
  query: string,
  limit = 5,
  acceptLanguage = GEOCODING_DEFAULT_LANGUAGE
): Promise<GeocodingResponse> {
  const startTime = performance.now();

  try {
    // Build API URL with query parameters
    const searchParams = new URLSearchParams({
      q: query,
      format: "json",
      limit: String(limit),
      addressdetails: "1", // Include detailed address components
      "accept-language": acceptLanguage,
    });

    const url = `${GEOCODING_API_URL}/search?${searchParams.toString()}`;

    logger.info("Geocoding API request", {
      url,
      query,
      limit,
      language: acceptLanguage,
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      GEOCODING_API_TIMEOUT_MS
    );

    try {
      // Make API request with User-Agent header (required by Nominatim)
      const response = await fetch(url, {
        headers: {
          "User-Agent": GEOCODING_USER_AGENT,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Nominatim API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as NominatimResult[];

      // Transform Nominatim results to internal format
      const results: GeocodingResult[] = data.map((item) =>
        transformNominatimResult(item)
      );

      const queryTime = Math.round(performance.now() - startTime);

      logger.info("Geocoding API response", {
        query,
        totalResults: results.length,
        queryTime,
      });

      return {
        results,
        totalResults: results.length,
        queryTime,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        logger.error("Geocoding API timeout", {
          query,
          timeout: GEOCODING_API_TIMEOUT_MS,
        });
        throw new Error(
          `La búsqueda de dirección excedió el tiempo límite de ${GEOCODING_API_TIMEOUT_MS / MILLISECONDS_TO_SECONDS_DIVISOR} segundos`
        );
      }

      throw error;
    }
  } catch (error) {
    const queryTime = Math.round(performance.now() - startTime);

    logger.error("Geocoding API error", {
      query,
      error: error instanceof Error ? error.message : String(error),
      queryTime,
    });

    throw new Error(
      `Error al buscar dirección: ${error instanceof Error ? error.message : "Error desconocido"}`
    );
  }
}

/**
 * Transform Nominatim API result to internal GeocodingResult format
 *
 * @param item - Nominatim API result
 * @returns GeocodingResult with normalized structure
 */
function transformNominatimResult(item: NominatimResult): GeocodingResult {
  // Extract city from various possible fields (city, town, village)
  const city = item.address.city ?? item.address.town ?? item.address.village;

  // Extract state/region
  const state = item.address.state ?? item.address.county;

  return {
    placeId: String(item.place_id),
    displayName: item.display_name,
    latitude: Number.parseFloat(item.lat),
    longitude: Number.parseFloat(item.lon),
    address: {
      country: item.address.country,
      state,
      city,
      postcode: item.address.postcode,
    },
    boundingBox: {
      south: Number.parseFloat(item.boundingbox[0]),
      north: Number.parseFloat(item.boundingbox[1]),
      west: Number.parseFloat(item.boundingbox[2]),
      east: Number.parseFloat(item.boundingbox[3]),
    },
  };
}
