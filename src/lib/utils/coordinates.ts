/**
 * Coordinate Utilities
 *
 * Feature: 001-delivery-address
 * Purpose: Coordinate validation and Haversine distance calculation
 */

import {
	DEGREES_TO_RADIANS_FACTOR,
	EARTH_RADIUS_METERS,
	MAX_LATITUDE,
	MAX_LONGITUDE,
	MIN_LATITUDE,
	MIN_LONGITUDE,
} from "@/app/(dashboard)/admin/quotes/_constants/geocoding.constants";

/**
 * Coordinate pair type
 */
export type Coordinates = {
	latitude: number;
	longitude: number;
};

/**
 * Validate coordinate ranges
 *
 * @param latitude - Latitude value to validate
 * @param longitude - Longitude value to validate
 * @throws Error if coordinates are out of range
 */
export function validateCoordinates(latitude: number, longitude: number): void {
	if (latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) {
		throw new Error(
			`Latitud inválida: ${latitude}. Debe estar entre ${MIN_LATITUDE} y ${MAX_LATITUDE}.`,
		);
	}

	if (longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) {
		throw new Error(
			`Longitud inválida: ${longitude}. Debe estar entre ${MIN_LONGITUDE} y ${MAX_LONGITUDE}.`,
		);
	}
}

/**
 * Calculate Haversine distance between two coordinates
 *
 * Returns the great-circle distance in meters using the Haversine formula.
 * Accuracy: ±5% margin vs actual road distance (acceptable for MVP).
 *
 * @param point1 - First coordinate pair (origin)
 * @param point2 - Second coordinate pair (destination)
 * @returns Distance in meters
 *
 * @example
 * const distance = haversineDistance(
 *   { latitude: 3.9009, longitude: -76.2978 },  // Buga
 *   { latitude: 6.2476, longitude: -75.5658 }   // Medellín
 * );
 * console.log(distance / 1000); // ~238.7 km
 */
export function haversineDistance(
	point1: Coordinates,
	point2: Coordinates,
): number {
	// Validate inputs
	validateCoordinates(point1.latitude, point1.longitude);
	validateCoordinates(point2.latitude, point2.longitude);

	// Convert degrees to radians
	const DEGREES_TO_RADIANS = Math.PI / DEGREES_TO_RADIANS_FACTOR;
	const toRadians = (degrees: number) => degrees * DEGREES_TO_RADIANS;

	const φ1 = toRadians(point1.latitude);
	const φ2 = toRadians(point2.latitude);
	const Δφ = toRadians(point2.latitude - point1.latitude);
	const Δλ = toRadians(point2.longitude - point1.longitude);

	// Haversine formula
	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = EARTH_RADIUS_METERS * c;

	return distance;
}

/**
 * Parse decimal coordinates to number (handles Prisma Decimal type)
 *
 * @param latitude - Latitude as Decimal or number
 * @param longitude - Longitude as Decimal or number
 * @returns Coordinate pair as numbers
 */
export function parseCoordinates(
	latitude: number | { toNumber: () => number } | null,
	longitude: number | { toNumber: () => number } | null,
): Coordinates | null {
	if (latitude === null || longitude === null) {
		return null;
	}

	const lat = typeof latitude === "number" ? latitude : latitude.toNumber();
	const lon = typeof longitude === "number" ? longitude : longitude.toNumber();

	validateCoordinates(lat, lon);

	return {
		latitude: lat,
		longitude: lon,
	};
}
