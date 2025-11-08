/**
 * Gallery tRPC Router
 *
 * Admin procedure to discover and list model design images
 * Images are automatically discovered from `/public/models/designs/`
 *
 * All procedures use adminProcedure (admin-only access)
 */

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { listGalleryImages } from "./gallery.service";

/**
 * tRPC router for gallery operations
 */
export const galleryRouter = createTRPCRouter({
  /**
   * List all available gallery images
   */
  "list-images": adminProcedure.query(async () => listGalleryImages()),
});
