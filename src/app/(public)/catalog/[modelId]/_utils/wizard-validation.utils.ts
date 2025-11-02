/**
 * Validation utility functions for wizard
 * Pure functions for business logic validation
 */

import {
	MAX_DIMENSION,
	MAX_ROOM_LOCATION_LENGTH,
	MIN_DIMENSION,
} from "../_constants/wizard-config.constants";

/**
 * Validate dimension values against min/max constraints
 * @param width - Width in millimeters
 * @param height - Height in millimeters
 * @returns Object with isValid flag and optional error message
 */
export function validateDimensions(
	width: number,
	height: number,
): { isValid: boolean; error?: string } {
	if (width < MIN_DIMENSION || width > MAX_DIMENSION) {
		return {
			error: `El ancho debe estar entre ${MIN_DIMENSION}mm y ${MAX_DIMENSION}mm`,
			isValid: false,
		};
	}

	if (height < MIN_DIMENSION || height > MAX_DIMENSION) {
		return {
			error: `El alto debe estar entre ${MIN_DIMENSION}mm y ${MAX_DIMENSION}mm`,
			isValid: false,
		};
	}

	return { isValid: true };
}

/**
 * Validate custom room location text input
 * @param value - Room location text
 * @returns Object with isValid flag and optional error message
 */
export function validateRoomLocation(value: string): {
	isValid: boolean;
	error?: string;
} {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return {
			error: "La ubicación es requerida",
			isValid: false,
		};
	}

	if (trimmed.length > MAX_ROOM_LOCATION_LENGTH) {
		return {
			error: `La ubicación no puede exceder ${MAX_ROOM_LOCATION_LENGTH} caracteres`,
			isValid: false,
		};
	}

	return { isValid: true };
}

/**
 * Validate glass solution selection
 * @param id - Selected glass solution ID
 * @param availableSolutions - Array of available solution IDs
 * @returns Object with isValid flag and optional error message
 */
export function validateGlassSolution(
	id: string | null,
	availableSolutions: string[],
): { isValid: boolean; error?: string } {
	if (!id) {
		return {
			error: "Debe seleccionar una solución de vidrio",
			isValid: false,
		};
	}

	if (!availableSolutions.includes(id)) {
		return {
			error: "La solución de vidrio seleccionada no es válida",
			isValid: false,
		};
	}

	return { isValid: true };
}
