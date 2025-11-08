/**
 * Colors tRPC Router
 *
 * Admin CRUD operations for Color catalog management
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Implements three-tier deletion strategy:
 * - Prevent deletion if used in quotes (hard constraint)
 * - Soft delete if used in models (isActive = false)
 * - Hard delete if no references exist
 *
 * TODO: Migrate from Prisma to Drizzle ORM
 */

// import type { Prisma } from "@prisma/client"; // TODO: Remove Prisma dependency
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import {
  colorCreateSchema,
  colorIdSchema,
  colorListSchema,
  colorUpdateSchema,
} from "@/lib/validations/color";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

/**
 * Helper: Build where clause for list query
 * TODO: Migrate to Drizzle where clause builder
 */
function buildWhereClause(input: {
  search?: string;
  isActive?: boolean;
}): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  // Search by color name (case-insensitive)
  if (input.search) {
    where.name = {
      contains: input.search,
      mode: "insensitive",
    };
  }

  // Filter by active status
  if (input.isActive !== undefined) {
    where.isActive = input.isActive;
  }

  return where;
}

/**
 * Colors Router
 */
export const colorsRouter = createTRPCRouter({
  /**
   * List colors with optional filtering and pagination
   * Returns paginated colors with usage statistics (_count)
   */
  list: adminProcedure.input(colorListSchema).query(async ({ ctx, input }) => {
    try {
      const where = buildWhereClause(input);

      // Count total matching records
      const total = await ctx.db.color.count({ where });

      // Calculate pagination
      const skip = (input.page - 1) * input.limit;
      const totalPages = Math.ceil(total / input.limit);

      // Fetch paginated results
      const colors = await ctx.db.color.findMany({
        where,
        include: {
          _count: {
            select: {
              modelColors: true,
              quoteItems: true,
            },
          },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip,
        take: input.limit,
      });

      logger.info("Colors list retrieved", {
        userId: ctx.session?.user.id,
        count: colors.length,
        total,
        page: input.page,
        filters: input,
      });

      return {
        items: colors,
        total,
        page: input.page,
        limit: input.limit,
        totalPages,
      };
    } catch (error) {
      logger.error("Failed to list colors", {
        userId: ctx.session?.user.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener la lista de colores",
      });
    }
  }),

  /**
   * Get single color by ID with usage statistics
   */
  getById: adminProcedure.input(colorIdSchema).query(async ({ ctx, input }) => {
    try {
      const color = await ctx.db.color.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              modelColors: true,
              quoteItems: true,
            },
          },
          modelColors: {
            include: {
              model: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            take: 10, // Show first 10 models using this color
          },
        },
      });

      if (!color) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Color no encontrado",
        });
      }

      logger.info("Color retrieved", {
        userId: ctx.session?.user.id,
        colorId: input.id,
      });

      return color;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      logger.error("Failed to get color", {
        userId: ctx.session?.user.id,
        colorId: input.id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener el color",
      });
    }
  }),

  /**
   * Create new color
   * Validates duplicate name+hexCode via unique constraint
   */
  create: adminProcedure
    .input(colorCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check for duplicate name+hexCode combination
        const existing = await ctx.db.color.findUnique({
          where: {
            name_hexCode: {
              name: input.name,
              hexCode: input.hexCode,
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ya existe un color con este nombre y código hexadecimal",
          });
        }

        const color = await ctx.db.color.create({
          data: {
            name: input.name,
            ralCode: input.ralCode,
            hexCode: input.hexCode,
            isActive: input.isActive,
          },
        });

        logger.info("Color created", {
          userId: ctx.session?.user.id,
          colorId: color.id,
          colorName: color.name,
          hexCode: color.hexCode,
        });

        return color;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle Prisma unique constraint violation
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ya existe un color con este nombre y código hexadecimal",
          });
        }

        logger.error("Failed to create color", {
          userId: ctx.session?.user.id,
          input,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear el color",
        });
      }
    }),

  /**
   * Update existing color
   * Validates duplicate name+hexCode if changed
   */
  update: adminProcedure
    .input(colorIdSchema.merge(colorUpdateSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;

        // Check if color exists
        const existing = await ctx.db.color.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Color no encontrado",
          });
        }

        // Check for duplicate if name or hexCode changed
        if (data.name || data.hexCode) {
          const duplicateCheck = await ctx.db.color.findFirst({
            where: {
              AND: [
                { id: { not: id } },
                {
                  name: data.name ?? existing.name,
                  hexCode: data.hexCode ?? existing.hexCode,
                },
              ],
            },
          });

          if (duplicateCheck) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Ya existe un color con este nombre y código hexadecimal",
            });
          }
        }

        const color = await ctx.db.color.update({
          where: { id },
          data,
        });

        logger.info("Color updated", {
          userId: ctx.session?.user.id,
          colorId: id,
          changes: data,
        });

        return color;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("Failed to update color", {
          userId: ctx.session?.user.id,
          colorId: input.id,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el color",
        });
      }
    }),

  /**
   * Delete color (three-tier strategy)
   * - If used in quotes: Prevent deletion (error)
   * - If used in models: Soft delete (isActive = false)
   * - If no references: Hard delete
   */
  delete: adminProcedure
    .input(colorIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get color with usage counts
        const color = await ctx.db.color.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                modelColors: true,
                quoteItems: true,
              },
            },
          },
        });

        if (!color) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Color no encontrado",
          });
        }

        // Tier 1: Prevent deletion if used in quotes (hard constraint)
        if (color._count.quoteItems > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `No se puede eliminar. Color usado en ${color._count.quoteItems} cotización(es)`,
          });
        }

        // Tier 2: Soft delete if used in models
        if (color._count.modelColors > 0) {
          const updated = await ctx.db.color.update({
            where: { id: input.id },
            data: { isActive: false },
          });

          logger.info("Color soft deleted (used in models)", {
            userId: ctx.session?.user.id,
            colorId: input.id,
            modelCount: color._count.modelColors,
          });

          return {
            success: true,
            action: "soft_delete" as const,
            message: `Color desactivado. Usado en ${color._count.modelColors} modelo(s)`,
            color: updated,
          };
        }

        // Tier 3: Hard delete if no references
        await ctx.db.color.delete({
          where: { id: input.id },
        });

        logger.info("Color hard deleted (no references)", {
          userId: ctx.session?.user.id,
          colorId: input.id,
        });

        return {
          success: true,
          action: "hard_delete" as const,
          message: "Color eliminado exitosamente",
          color: null,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("Failed to delete color", {
          userId: ctx.session?.user.id,
          colorId: input.id,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar el color",
        });
      }
    }),

  /**
   * Check color usage statistics
   * Used to determine deletion strategy before attempting delete
   */
  checkUsage: adminProcedure
    .input(colorIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const color = await ctx.db.color.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                modelColors: true,
                quoteItems: true,
              },
            },
          },
        });

        if (!color) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Color no encontrado",
          });
        }

        const modelCount = color._count.modelColors;
        const quoteCount = color._count.quoteItems;

        return {
          modelCount,
          quoteCount,
          canDelete: quoteCount === 0, // Can delete (soft or hard) if not in quotes
          canHardDelete: quoteCount === 0 && modelCount === 0, // Can hard delete only if no references
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("Failed to check color usage", {
          userId: ctx.session?.user.id,
          colorId: input.id,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al verificar el uso del color",
        });
      }
    }),
});
