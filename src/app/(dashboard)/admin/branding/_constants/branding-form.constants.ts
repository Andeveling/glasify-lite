/**
 * Branding form constants
 * File upload constraints and validation patterns
 */

// Byte conversion constants
export const BYTES_PER_KILOBYTE = 1024;
export const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;

// File upload constraints
export const MAX_LOGO_SIZE_MB = 2;
export const MAX_LOGO_FILE_SIZE_BYTES = MAX_LOGO_SIZE_MB * BYTES_PER_MEGABYTE;

export const ALLOWED_FILE_TYPES = [
	"image/png",
	"image/jpeg",
	"image/svg+xml",
	"image/webp",
] as const;

// Default colors
export const DEFAULT_PRIMARY_COLOR = "#3B82F6";
export const DEFAULT_SECONDARY_COLOR = "#1E40AF";

// Validation regex patterns
export const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
export const SOCIAL_URL_REGEX =
	/^https?:\/\/(www\.)?(facebook|instagram|linkedin)\.com/;
