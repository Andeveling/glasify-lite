/**
 * Gallery tRPC Router
 *
 * Admin procedure to discover and list model design images
 * Images are automatically discovered from `/public/models/designs/`
 *
 * Features:
 * - No database required (pure file discovery)
 * - Automatic on every call (fresh data)
 * - URL validation to prevent path traversal
 * - Admin-only access
 *
 * All procedures use adminProcedure (admin-only access)
 */

import { getGalleryImages } from '@/lib/gallery/get-gallery-images';
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';

/**
 * tRPC router for gallery operations
 * Namespace: admin.gallery
 */
export const galleryRouter = createTRPCRouter({
  /**
   * List all available gallery images
   *
   * Procedure: admin.gallery.list-images
   * Access: Admin only
   *
   * Returns:
   * - Array of images with filename, name, and public URL
   * - Sorted alphabetically by display name
   * - No database queries
   *
   * Errors:
   * - Returns empty array on error (graceful degradation)
   *
   * Example:
   * ```typescript
   * const { data } = await api.admin.gallery['list-images'].useQuery();
   * console.log(data); // [ { filename: "practicable.svg", name: "Practicable", url: "/models/designs/practicable.svg" }, ... ]
   * ```
   *
   * @returns Array of GalleryImage objects
   */
  'list-images': adminProcedure.query(async () => {
    // Discover images from filesystem
    const result = await getGalleryImages();

    // Handle errors from gallery scanner - return empty array for graceful degradation
    if ('code' in result && result.code !== undefined) {
      // On error, return empty array
      // Admin can still use form without image selector
      return [];
    }

    return result;
  }),
});
