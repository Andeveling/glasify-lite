/**
 * Admin Router - Aggregates All Admin Modules
 *
 * Thin composition layer following Clean Architecture.
 * Each sub-router follows Repository → Service → Queries/Mutations → Index pattern.
 *
 * @module server/api/routers/admin
 */

import { colorsRouter } from "@/server/api/routers/admin/colors";
import { galleryRouter } from "@/server/api/routers/admin/gallery/gallery.router";
import { glassSolutionRouter } from "@/server/api/routers/admin/glass-solution";
import { glassSupplierRouter } from "@/server/api/routers/admin/glass-supplier";
import { glassTypeRouter } from "@/server/api/routers/admin/glass-type/glass-type.router";
import { modelRouter } from "@/server/api/routers/admin/model/model.router";
import { modelColorsRouter } from "@/server/api/routers/admin/model-colors";
import { profileSupplierRouter } from "@/server/api/routers/admin/profile-supplier";
import { serviceRouter } from "@/server/api/routers/admin/service";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * Admin router composition
 * All sub-routers follow Clean Architecture standards
 */
export const adminRouter = createTRPCRouter({
  colors: colorsRouter,
  gallery: galleryRouter,
  "glass-solution": glassSolutionRouter,
  "glass-supplier": glassSupplierRouter,
  "glass-type": glassTypeRouter,
  model: modelRouter,
  "model-colors": modelColorsRouter,
  "profile-supplier": profileSupplierRouter,
  service: serviceRouter,
});
