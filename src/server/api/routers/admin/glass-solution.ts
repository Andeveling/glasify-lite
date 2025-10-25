/**
 * Glass Solution tRPC Router
 *
 * Admin CRUD operations for GlassSolution entity
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Includes referential integrity check for deletions
 */

import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import logger from '@/lib/logger';
import {
  createGlassSolutionSchema,
  deleteGlassSolutionSchema,
  getGlassSolutionByIdSchema,
  listGlassSolutionsSchema,
  updateGlassSolutionSchema,
} from '@/lib/validations/admin/glass-solution.schema';
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { canDeleteGlassSolution } from '@/server/services/referential-integrity.service';

/**
 * Helper: Generate URL-friendly slug from key
 * Converts snake_case keys to kebab-case slugs
 */
function generateSlugFromKey(key: string): string {
  return key.replace(/_/g, '-');
}

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: { search?: string; isActive?: boolean }): Prisma.GlassSolutionWhereInput {
  const where: Prisma.GlassSolutionWhereInput = {};

  // Search by key, name, or nameEs
  if (input.search) {
    where.OR = [
      {
        key: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
      {
        nameEs: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Filter by active status
  if (input.isActive !== undefined) {
    where.isActive = input.isActive;
  }

  return where;
}

/**
 * Helper: Build orderBy clause for list query
 */
function buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc'): Prisma.GlassSolutionOrderByWithRelationInput {
  const orderBy: Prisma.GlassSolutionOrderByWithRelationInput = {};

  switch (sortBy) {
    case 'key':
      orderBy.key = sortOrder;
      break;
    case 'name':
      orderBy.name = sortOrder;
      break;
    case 'sortOrder':
      orderBy.sortOrder = sortOrder;
      break;
    case 'createdAt':
      orderBy.createdAt = sortOrder;
      break;
    default:
      orderBy.sortOrder = 'asc'; // Default sort by priority
  }

  return orderBy;
}

/**
 * Glass Solution Router
 */
export const glassSolutionRouter = createTRPCRouter({
  /**
   * Create Glass Solution
   * POST /api/trpc/admin/glassSolution.create
   *
   * Creates a new glass solution
   */
  create: adminProcedure.input(createGlassSolutionSchema).mutation(async ({ ctx, input }) => {
    // Check for duplicate key
    const existingByKey = await ctx.db.glassSolution.findUnique({
      where: { key: input.key },
    });

    if (existingByKey) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Ya existe una solución con esta clave',
      });
    }

    const glassSolution = await ctx.db.glassSolution.create({
      data: {
        ...input,
        slug: generateSlugFromKey(input.key),
      },
    });

    logger.info('Glass solution created', {
      solutionId: glassSolution.id,
      solutionKey: glassSolution.key,
      solutionName: glassSolution.nameEs,
      userId: ctx.session.user.id,
    });

    return glassSolution;
  }),

  /**
   * Delete Glass Solution
   * DELETE /api/trpc/admin/glassSolution.delete
   *
   * Deletes a glass solution if no glass types are assigned
   * Uses referential integrity service to check dependencies
   */
  delete: adminProcedure.input(deleteGlassSolutionSchema).mutation(async ({ ctx, input }) => {
    // Check if exists
    const existing = await ctx.db.glassSolution.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Solución de cristal no encontrada',
      });
    }

    // Check referential integrity
    const integrityCheck = await canDeleteGlassSolution(input.id);

    if (!integrityCheck.canDelete) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: integrityCheck.message,
      });
    }

    await ctx.db.glassSolution.delete({
      where: { id: input.id },
    });

    logger.warn('Glass solution deleted', {
      solutionId: input.id,
      solutionKey: existing.key,
      solutionName: existing.nameEs,
      userId: ctx.session.user.id,
    });

    return { success: true };
  }),

  /**
   * Get Glass Solution by ID
   * GET /api/trpc/admin/glassSolution.getById
   *
   * Returns full glass solution details with assignment count
   */
  getById: adminProcedure.input(getGlassSolutionByIdSchema).query(async ({ ctx, input }) => {
    const glassSolution = await ctx.db.glassSolution.findUnique({
      include: {
        // biome-ignore lint/style/useNamingConvention: Prisma generated field
        _count: {
          select: {
            glassTypes: true,
          },
        },
      },
      where: { id: input.id },
    });

    if (!glassSolution) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Solución de cristal no encontrada',
      });
    }

    logger.info('Glass solution retrieved', {
      solutionId: input.id,
      solutionKey: glassSolution.key,
      userId: ctx.session.user.id,
    });

    return glassSolution;
  }),

  /**
   * List Glass Solutions
   * GET /api/trpc/admin/glassSolution.list
   *
   * Supports pagination, search, filtering, and sorting
   */
  list: adminProcedure.input(listGlassSolutionsSchema).query(async ({ ctx, input }) => {
    const { page, limit, sortBy, sortOrder, isActive, ...restFilters } = input;

    const where = buildWhereClause({
      ...restFilters,
      isActive: isActive ? (isActive === 'all' ? undefined : isActive === 'active') : undefined,
    });
    const orderBy = buildOrderByClause(sortBy, sortOrder);

    // Get total count
    const total = await ctx.db.glassSolution.count({ where });

    // Get paginated items with glass type count
    const items = await ctx.db.glassSolution.findMany({
      include: {
        // biome-ignore lint/style/useNamingConvention: Prisma generated field
        _count: {
          select: {
            glassTypes: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    logger.info('Glass solutions listed', {
      filters: { ...restFilters, isActive },
      limit,
      page,
      total,
      userId: ctx.session.user.id,
    });

    return {
      items,
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }),

  /**
   * Update Glass Solution
   * PUT /api/trpc/admin/glassSolution.update
   *
   * Updates an existing glass solution
   */
  update: adminProcedure.input(updateGlassSolutionSchema).mutation(async ({ ctx, input }) => {
    const { id, data } = input;

    // Check if exists
    const existing = await ctx.db.glassSolution.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Solución de cristal no encontrada',
      });
    }

    // Check for duplicate key (if key is being updated)
    if (data.key && data.key !== existing.key) {
      const duplicate = await ctx.db.glassSolution.findUnique({
        where: { key: data.key },
      });

      if (duplicate) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe una solución con esta clave',
        });
      }
    }

    const glassSolution = await ctx.db.glassSolution.update({
      data: {
        ...data,
        // If key is updated, also update slug
        ...(data.key && { slug: generateSlugFromKey(data.key) }),
      },
      where: { id },
    });

    logger.info('Glass solution updated', {
      changes: data,
      solutionId: glassSolution.id,
      solutionKey: glassSolution.key,
      userId: ctx.session.user.id,
    });

    return glassSolution;
  }),
});
