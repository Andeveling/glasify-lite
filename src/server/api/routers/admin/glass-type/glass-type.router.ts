/**
 * Glass Type tRPC Router
 *
 * Admin CRUD operations for GlassType entity using Drizzle ORM
 *
 * Architecture:
 * - Router: Thin layer for tRPC procedures (this file)
 * - Service: Business logic and orchestration (glass-type.service.ts)
 * - Repository: Pure data access with Drizzle (repositories/glass-type-repository.ts)
 *
 * All procedures use adminProcedure (admin-only access)
 * Logging and validation handled by service layer
 */

import {
  createGlassTypeSchema,
  deleteGlassTypeSchema,
  listGlassTypesSchema,
  updateGlassTypeSchema,
} from "@/lib/validations/admin/glass-type.schema";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  createGlassTypeWithRelations,
  deleteGlassTypeWithIntegrityCheck,
  getGlassTypesList,
  updateGlassTypeWithRelations,
} from "./glass-type.service";
import { findGlassTypeByIdWithDetails } from "./repositories/glass-type-repository";

/**
 * Glass Type Router
 *
 * Delegates all operations to service layer
 */
export const glassTypeRouter = createTRPCRouter({
  /**
   * Create Glass Type
   * POST /api/trpc/admin/glassType.create
   *
   * Creates a new glass type with solutions and characteristics
   */
  create: adminProcedure
    .input(createGlassTypeSchema)
    .mutation(async ({ ctx, input }) =>
      createGlassTypeWithRelations(ctx.db, ctx.session.user.id, {
        name: input.name,
        code: input.code,
        series: input.series ?? undefined,
        manufacturer: input.manufacturer ?? undefined,
        thicknessMm: input.thicknessMm,
        pricePerSqm: input.pricePerSqm,
        uValue: input.uValue ?? undefined,
        description: input.description ?? undefined,
        solarFactor: input.solarFactor ?? undefined,
        lightTransmission: input.lightTransmission ?? undefined,
        isActive: input.isActive,
        lastReviewDate: input.lastReviewDate ?? undefined,
        solutions: input.solutions,
        characteristics: input.characteristics.map((char) => ({
          characteristicId: char.characteristicId,
          value: char.value ?? undefined,
          certification: char.certification ?? undefined,
          notes: char.notes,
        })),
      })
    ),

  /**
   * Delete Glass Type
   * DELETE /api/trpc/admin/glassType.delete
   *
   * Deletes a glass type if no quote items are associated
   */
  delete: adminProcedure
    .input(deleteGlassTypeSchema)
    .mutation(async ({ ctx, input }) =>
      deleteGlassTypeWithIntegrityCheck(ctx.db, ctx.session.user.id, input.id)
    ),

  /**
   * Get Glass Type by ID
   * GET /api/trpc/admin/glassType.getById
   *
   * Returns full glass type details with solutions and characteristics
   */
  getById: adminProcedure
    .input(deleteGlassTypeSchema)
    .query(async ({ ctx, input }) =>
      findGlassTypeByIdWithDetails(ctx.db, input.id)
    ),

  /**
   * List Glass Types
   * GET /api/trpc/admin/glassType.list
   *
   * Supports pagination, search, filtering, and sorting
   */
  list: adminProcedure
    .input(listGlassTypesSchema)
    .query(async ({ ctx, input }) =>
      getGlassTypesList(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update Glass Type
   * PUT /api/trpc/admin/glassType.update
   *
   * Updates glass type with optional solutions/characteristics replacement
   */
  update: adminProcedure
    .input(updateGlassTypeSchema)
    .mutation(async ({ ctx, input }) =>
      updateGlassTypeWithRelations(ctx.db, ctx.session.user.id, {
        id: input.id,
        data: {
          ...input.data,
          characteristics: input.data.characteristics?.map((char) => ({
            characteristicId: char.characteristicId,
            value: char.value ?? undefined,
            certification: char.certification ?? undefined,
            notes: char.notes,
          })),
        },
      })
    ),
});
