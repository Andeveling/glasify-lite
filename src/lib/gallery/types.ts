/**
 * Gallery Types
 *
 * Type definitions for the gallery system that discovers and manages
 * model design images from `/public/models/designs/`
 */

/**
 * Represents a single image in the gallery
 * - filename: Original filename (e.g., "practicable.svg")
 * - name: Human-readable name (e.g., "Practicable")
 * - url: Public URL path accessible from browser (e.g., "/models/designs/practicable.svg")
 */
export type GalleryImage = {
  /**
   * Original filename including extension
   * @example "practicable.svg"
   */
  filename: string;

  /**
   * Human-readable display name derived from filename
   * Format: kebab-case filename → Title Case
   * @example "practicable.svg" → "Practicable"
   * @example "doble-practicable-fijo.svg" → "Doble Practicable Fijo"
   */
  name: string;

  /**
   * Public URL path for accessing the image
   * Relative to domain root, safe for `<img src>` and Next.js Image component
   * @example "/models/designs/practicable.svg"
   */
  url: string;
};

/**
 * Response from gallery.list-images tRPC procedure
 */
export type GalleryImagesResponse = {
  /**
   * Array of available gallery images sorted alphabetically by name
   */
  images: GalleryImage[];

  /**
   * Total count of images discovered
   * Useful for UI pagination/virtualization if needed
   */
  total: number;

  /**
   * Timestamp when gallery was last scanned
   * Used for caching validation
   */
  scannedAt: Date;
};

/**
 * Configuration for gallery system
 */
export type GalleryConfig = {
  /**
   * Absolute path to designs directory on filesystem
   * @example "/home/user/project/public/models/designs"
   */
  designsDir: string;

  /**
   * Public URL base path for images
   * @example "/models/designs"
   */
  publicUrlBase: string;

  /**
   * Allowed file extensions (lowercase, with dot)
   * @example [".svg", ".png", ".jpg", ".jpeg", ".webp"]
   */
  allowedExtensions: string[];
};

/**
 * Error details for gallery operations
 */
export type GalleryError = {
  code: "DIR_NOT_FOUND" | "READ_ERROR" | "NO_IMAGES" | "INVALID_CONFIG";
  message: string;
  details?: Record<string, unknown>;
};
