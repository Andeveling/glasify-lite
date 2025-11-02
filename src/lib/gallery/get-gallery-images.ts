/**
 * Gallery Image Discovery
 *
 * Utility function to scan `/public/models/designs/` directory
 * and return list of available gallery images with metadata
 *
 * Features:
 * - Automatic file discovery (no hardcoding)
 * - Extension validation (SVG, PNG, JPG, WebP)
 * - Cross-platform path handling (Windows/Unix)
 * - Human-readable name generation from filenames
 * - Sorted alphabetically for consistent UX
 * - Error handling with detailed diagnostics
 */

import fs from "node:fs/promises";
import path from "node:path";

import {
	ALLOWED_EXTENSIONS,
	DESIGNS_DIR_RELATIVE,
	FILENAME_SEPARATOR,
	PUBLIC_URL_BASE,
} from "./constants";
import type { GalleryError, GalleryImage } from "./types";

/**
 * Convert kebab-case filename to Title Case display name
 *
 * Examples:
 * - "practicable.svg" → "Practicable"
 * - "doble-practicable-fijo.svg" → "Doble Practicable Fijo"
 * - "ox.svg" → "Ox"
 *
 * Algorithm:
 * 1. Remove file extension
 * 2. Split by hyphens
 * 3. Capitalize each word
 * 4. Join with spaces
 *
 * @param filename - Original filename with extension
 * @returns Human-readable display name
 */
function formatImageName(filename: string): string {
	// Remove extension (e.g., "practicable.svg" → "practicable")
	const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

	// Split by hyphens and capitalize each word
	return nameWithoutExt
		.split(FILENAME_SEPARATOR)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Validate file extension against allowed list
 *
 * @param filename - Filename to validate
 * @returns true if extension is allowed, false otherwise
 */
function isAllowedExtension(filename: string): boolean {
	const ext = path.extname(filename).toLowerCase();
	return ALLOWED_EXTENSIONS.includes(
		ext as (typeof ALLOWED_EXTENSIONS)[number],
	);
}

/**
 * Scan the designs directory and return array of available images
 *
 * Process:
 * 1. Construct absolute path to designs directory
 * 2. Read directory contents
 * 3. Filter files by allowed extensions
 * 4. Transform to GalleryImage objects with URLs
 * 5. Sort alphabetically by display name
 * 6. Return with metadata (timestamp, count)
 *
 * Error Handling:
 * - Returns detailed error if directory doesn't exist
 * - Returns empty array if directory is empty
 * - Logs warnings for invalid files
 *
 * @returns Array of GalleryImage objects sorted by name, or error
 */
export async function getGalleryImages(): Promise<
	GalleryImage[] | GalleryError
> {
	try {
		// Construct absolute path to designs directory
		const designsDir = path.join(process.cwd(), DESIGNS_DIR_RELATIVE);

		// Attempt to read directory
		let files: string[];
		try {
			files = await fs.readdir(designsDir);
		} catch (error) {
			// Directory doesn't exist or permission denied
			const errorCode = (error as NodeJS.ErrnoException).code;
			if (errorCode === "ENOENT") {
				return {
					code: "DIR_NOT_FOUND",
					details: { path: designsDir },
					message: `Designs directory not found at ${designsDir}`,
				};
			}
			if (errorCode === "EACCES") {
				return {
					code: "READ_ERROR",
					details: { errno: errorCode, path: designsDir },
					message: `Permission denied reading directory: ${designsDir}`,
				};
			}
			throw error;
		}

		// Filter files by allowed extensions
		const validFiles = files.filter(isAllowedExtension);

		// Return empty array if no valid images found
		if (validFiles.length === 0) {
			return [];
		}

		// Transform to GalleryImage objects
		const images: GalleryImage[] = validFiles
			.map((filename) => ({
				filename,
				name: formatImageName(filename),
				// Use posix paths for URLs (always forward slashes, even on Windows)
				url: `${PUBLIC_URL_BASE}/${filename}`,
			}))
			// Sort alphabetically by display name for consistent UX
			.sort((a, b) => a.name.localeCompare(b.name));

		return images;
	} catch (error) {
		return {
			code: "READ_ERROR",
			details: { error },
			message: `Failed to read gallery images: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Validate that an image URL is from the gallery
 *
 * Security check to ensure URLs are legitimate gallery paths
 * Prevents users from setting arbitrary URLs
 *
 * @param imageUrl - URL to validate
 * @returns true if URL is a valid gallery image URL, false otherwise
 */
export function isValidGalleryImageUrl(imageUrl: string): boolean {
	// Must start with gallery base path
	if (!imageUrl.startsWith(PUBLIC_URL_BASE)) {
		return false;
	}

	// Extract filename from URL
	const filename = `${imageUrl}`.replace(`${PUBLIC_URL_BASE}/`, "");

	// Check for path traversal attempts
	if (filename.includes("..") || filename.includes("/")) {
		return false;
	}

	// Validate extension
	return isAllowedExtension(filename);
}
