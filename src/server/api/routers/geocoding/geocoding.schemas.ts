/**
 * Geocoding Schemas
 *
 * Validation schemas for geocoding API requests and responses
 * using Zod for type safety and runtime validation
 */

import { z } from "zod";
import {
  GEOCODING_DEFAULT_LANGUAGE,
  GEOCODING_DEFAULT_LIMIT,
  GEOCODING_MAX_LIMIT,
  GEOCODING_QUERY_MAX_LENGTH,
  GEOCODING_QUERY_MIN_LENGTH,
} from "./geocoding.constants";

/**
 * Geocoding search input schema
 * Validates user query for address search
 */
export const geocodingSearchInputSchema = z.object({
  query: z
    .string()
    .min(GEOCODING_QUERY_MIN_LENGTH, "La búsqueda debe tener al menos 3 caracteres")
    .max(GEOCODING_QUERY_MAX_LENGTH, "La búsqueda no puede exceder 500 caracteres")
    .describe("Address search string (e.g., 'Calle 72, Bogotá')"),

  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(GEOCODING_MAX_LIMIT, "El límite no puede exceder 10 resultados")
    .default(GEOCODING_DEFAULT_LIMIT)
    .describe("Maximum number of results to return"),

  acceptLanguage: z
    .string()
    .default(GEOCODING_DEFAULT_LANGUAGE)
    .describe("Language code for results (e.g., 'es' for Spanish)"),
});

export type GeocodingSearchInput = z.infer<typeof geocodingSearchInputSchema>;

/**
 * Address components output schema
 */
export const addressComponentsSchema = z.object({
  country: z.string().nullable().describe("Country name"),
  state: z.string().nullable().describe("State/Region name"),
  city: z.string().nullable().describe("City name"),
  postcode: z.string().nullable().describe("Postal code"),
});

export type AddressComponents = z.infer<typeof addressComponentsSchema>;

/**
 * Bounding box schema
 */
export const boundingBoxSchema = z.object({
  south: z.number().describe("South latitude"),
  north: z.number().describe("North latitude"),
  west: z.number().describe("West longitude"),
  east: z.number().describe("East longitude"),
});

export type BoundingBox = z.infer<typeof boundingBoxSchema>;

/**
 * Single geocoding result schema
 */
export const geocodingResultSchema = z.object({
  placeId: z.string().describe("Unique identifier from Nominatim"),
  displayName: z.string().describe("Full formatted address"),
  latitude: z.number().describe("Latitude coordinate"),
  longitude: z.number().describe("Longitude coordinate"),
  address: addressComponentsSchema,
  boundingBox: boundingBoxSchema,
});

export type GeocodingResult = z.infer<typeof geocodingResultSchema>;

/**
 * Geocoding response schema
 */
export const geocodingResponseSchema = z.object({
  results: z
    .array(geocodingResultSchema)
    .describe("Array of geocoding results"),
  totalResults: z
    .number()
    .int()
    .describe("Total number of results returned"),
  queryTime: z.number().int().describe("Query execution time in milliseconds"),
});

export type GeocodingResponse = z.infer<typeof geocodingResponseSchema>;

/**
 * Nominatim API response schema (internal)
 */
export const nominatimAddressSchema = z.object({
  city: z.string().optional(),
  town: z.string().optional(),
  village: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postcode: z.string().optional(),
  road: z.string().optional(),
  suburb: z.string().optional(),
  county: z.string().optional(),
});

export const nominatimResultSchema = z.object({
  place_id: z.number(),
  licence: z.string(),
  osm_type: z.string(),
  osm_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  address: nominatimAddressSchema,
  boundingbox: z.tuple([z.string(), z.string(), z.string(), z.string()]),
});

export type NominatimResult = z.infer<typeof nominatimResultSchema>;
