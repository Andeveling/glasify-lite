/**
 * Address Formatter Utility
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Format ProjectAddress entities for display in UI
 */

import { COORDINATE_DISPLAY_DECIMAL_PLACES } from "@/app/(dashboard)/admin/quotes/_constants/geocoding.constants";
import { validateCoordinates } from "@/lib/utils/coordinates";

/**
 * Address-like type for formatting (accepts both server and client types)
 */
type FormattableAddress = {
	street?: string | null;
	district?: string | null;
	city?: string | null;
	region?: string | null;
	country?: string | null;
	postalCode?: string | null;
	label?: string | null;
	latitude?: number | unknown | null;
	longitude?: number | unknown | null;
};

/**
 * Format address object to comma-separated display string
 *
 * @param address - ProjectAddress entity or partial object
 * @returns Formatted address string (e.g., "Calle 72, Bogotá, Distrito Capital, Colombia")
 *
 * @example
 * const formatted = formatAddress({
 *   street: 'Calle 72 #10-34',
 *   city: 'Bogotá',
 *   region: 'Distrito Capital',
 *   country: 'Colombia'
 * });
 * // Returns: "Calle 72 #10-34, Bogotá, Distrito Capital, Colombia"
 */
export function formatAddress(
	address: FormattableAddress | null | undefined,
): string {
	if (!address) {
		return "Sin dirección";
	}

	// Collect all non-null address components in hierarchical order
	const components: string[] = [];

	// Most specific to most general: street → district → city → region → country
	if (address.street) {
		components.push(address.street);
	}
	if (address.district) {
		components.push(address.district);
	}
	if (address.city) {
		components.push(address.city);
	}
	if (address.region) {
		components.push(address.region);
	}
	if (address.country) {
		components.push(address.country);
	}

	// Add postal code at the end if present
	if (address.postalCode) {
		components.push(`CP ${address.postalCode}`);
	}

	// Join with commas and space
	const formatted = components.join(", ");

	return formatted || "Sin dirección";
}

/**
 * Format address with optional label prefix
 *
 * @param address - ProjectAddress entity
 * @returns Labeled address string (e.g., "Oficina Principal: Calle 72, Bogotá")
 *
 * @example
 * const formatted = formatAddressWithLabel({
 *   label: 'Oficina Principal',
 *   city: 'Bogotá',
 *   street: 'Calle 72'
 * });
 * // Returns: "Oficina Principal: Calle 72, Bogotá"
 */
export function formatAddressWithLabel(
	address: FormattableAddress | null | undefined,
): string {
	if (!address) {
		return "Sin dirección";
	}

	const formatted = formatAddress(address);

	if (address.label) {
		return `${address.label}: ${formatted}`;
	}

	return formatted;
}

/**
 * Parse and validate coordinate pair from ProjectAddress
 *
 * @param address - ProjectAddress entity with potential coordinates
 * @returns Coordinates object { latitude, longitude } or null if invalid/missing
 *
 * @example
 * const coords = parseCoordinates({ latitude: 4.7110, longitude: -74.0721 });
 * // Returns: { latitude: 4.7110, longitude: -74.0721 }
 *
 * const coords = parseCoordinates({ latitude: 4.7110, longitude: null });
 * // Returns: null (coordinate pair incomplete)
 */
export function parseCoordinates(
	address: FormattableAddress | null | undefined,
): { latitude: number; longitude: number } | null {
	if (!address) {
		return null;
	}

	// Check if both coordinates are present
	if (address.latitude === null || address.latitude === undefined) {
		return null;
	}

	if (address.longitude === null || address.longitude === undefined) {
		return null;
	}

	// Convert Prisma Decimal to number if needed
	const latitude =
		typeof address.latitude === "number"
			? address.latitude
			: Number(address.latitude);

	const longitude =
		typeof address.longitude === "number"
			? address.longitude
			: Number(address.longitude);

	// Validate coordinate ranges
	try {
		validateCoordinates(latitude, longitude);
		return { latitude, longitude };
	} catch {
		return null;
	}
}

/**
 * Format coordinates to display string
 *
 * @param latitude - Latitude value
 * @param longitude - Longitude value
 * @returns Formatted coordinates (e.g., "4.7110, -74.0721")
 *
 * @example
 * const formatted = formatCoordinates(4.7110, -74.0721);
 * // Returns: "4.7110, -74.0721"
 */
export function formatCoordinates(
	latitude: number | null | undefined,
	longitude: number | null | undefined,
): string {
	if (latitude === null || latitude === undefined) {
		return "Sin coordenadas";
	}

	if (longitude === null || longitude === undefined) {
		return "Sin coordenadas";
	}

	return `${latitude.toFixed(COORDINATE_DISPLAY_DECIMAL_PLACES)}, ${longitude.toFixed(COORDINATE_DISPLAY_DECIMAL_PLACES)}`;
}
