/**
 * Gallery Constants
 *
 * Configuration and constants for the gallery system
 */

/**
 * Allowed image file extensions (lowercase, with leading dot)
 * Determines what files are discovered by the gallery scanner
 *
 * Rationale:
 * - SVG: Scalable, small file size, perfect for design mockups
 * - PNG: Lossless, supports transparency, good for details
 * - JPG/JPEG: Lossy, good for photographs
 * - WebP: Modern format, better compression than JPEG/PNG
 */
export const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp'] as const;

/**
 * Public URL base path for accessing images
 * Maps to Next.js public folder: /public/models/designs
 */
export const PUBLIC_URL_BASE = '/models/designs' as const;

/**
 * Relative path from project root to designs directory
 * Used by Node.js fs to locate files on filesystem
 */
export const DESIGNS_DIR_RELATIVE = 'public/models/designs' as const;

/**
 * Cache duration for gallery images list in milliseconds
 * Balances fresh data discovery with performance
 *
 * Strategy:
 * - 5 minutes: Admin sees new images relatively quickly after upload
 * - Sufficient for typical workflow (admin uploads, then selects in form)
 * - Can be refreshed manually if needed
 */
const CACHE_MINUTES = 5;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
export const GALLERY_CACHE_TTL_MS = CACHE_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;

/**
 * Maximum number of images to load before warning about performance
 * Helps identify when pagination/virtualization is needed
 */
export const GALLERY_WARN_THRESHOLD = 200;

/**
 * Character set used in kebab-case filenames to split on
 * Example: "doble-practicable-fijo.svg" → ["doble", "practicable", "fijo"]
 */
export const FILENAME_SEPARATOR = '-' as const;
