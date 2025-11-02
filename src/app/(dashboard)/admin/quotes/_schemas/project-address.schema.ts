/**
 * Project Address Validation Schema
 *
 * Feature: 001-delivery-address
 * Purpose: Zod validation for ProjectAddress input
 */

import { z } from "zod";
import {
	GEOCODING_DEFAULT_LANGUAGE,
	GEOCODING_DEFAULT_LIMIT,
	GEOCODING_MAX_LIMIT,
	MAX_CITY_LENGTH,
	MAX_COUNTRY_LENGTH,
	MAX_DISTRICT_LENGTH,
	MAX_LABEL_LENGTH,
	MAX_LATITUDE,
	MAX_LONGITUDE,
	MAX_POSTAL_CODE_LENGTH,
	MAX_REFERENCE_LENGTH,
	MAX_REGION_LENGTH,
	MAX_STREET_LENGTH,
	MIN_LATITUDE,
	MIN_LONGITUDE,
} from "../_constants/geocoding.constants";

/**
 * ProjectAddress input schema with validation rules
 *
 * Rules:
 * - At least one of city, street, or reference required (prevents empty addresses)
 * - Coordinates: both present or both null (no partial coordinates)
 * - Latitude range: [-90, 90]
 * - Longitude range: [-180, 180]
 */
export const projectAddressSchema = z
	.object({
		quoteId: z.string().cuid().optional(),
		label: z.string().max(MAX_LABEL_LENGTH).optional(),
		country: z.string().max(MAX_COUNTRY_LENGTH).optional(),
		region: z.string().max(MAX_REGION_LENGTH).optional(),
		city: z.string().max(MAX_CITY_LENGTH).optional(),
		district: z.string().max(MAX_DISTRICT_LENGTH).optional(),
		street: z.string().max(MAX_STREET_LENGTH).optional(),
		reference: z.string().max(MAX_REFERENCE_LENGTH).optional(),
		latitude: z.number().min(MIN_LATITUDE).max(MAX_LATITUDE).optional(),
		longitude: z.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE).optional(),
		postalCode: z.string().max(MAX_POSTAL_CODE_LENGTH).optional(),
	})
	.refine(
		(data) => {
			// At least one identifier required
			return data.city || data.street || data.reference;
		},
		{
			message:
				"Al menos uno de los siguientes campos es requerido: ciudad, dirección o referencia",
		},
	)
	.refine(
		(data) => {
			// Coordinate pair validation: both present or both absent
			const hasLatitude = data.latitude !== undefined;
			const hasLongitude = data.longitude !== undefined;
			return hasLatitude === hasLongitude;
		},
		{
			message:
				"Latitud y longitud deben estar ambos presentes o ambos ausentes",
		},
	);

/**
 * Type inference from schema
 */
export type ProjectAddressInput = z.infer<typeof projectAddressSchema>;

/**
 * Geocoding search input schema
 */
export const geocodingSearchSchema = z.object({
	query: z.string().min(1, "La consulta de búsqueda es requerida"),
	limit: z
		.number()
		.int()
		.min(1)
		.max(GEOCODING_MAX_LIMIT)
		.optional()
		.default(GEOCODING_DEFAULT_LIMIT),
	acceptLanguage: z.string().optional().default(GEOCODING_DEFAULT_LANGUAGE),
});

/**
 * Transportation cost input schema
 */
export const transportationCostSchema = z.object({
	deliveryLatitude: z
		.number()
		.min(MIN_LATITUDE, "Latitud inválida")
		.max(MAX_LATITUDE, "Latitud inválida"),
	deliveryLongitude: z
		.number()
		.min(MIN_LONGITUDE, "Longitud inválida")
		.max(MAX_LONGITUDE, "Longitud inválida"),
	deliveryCity: z.string().optional(),
});
