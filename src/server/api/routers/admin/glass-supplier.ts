/**
 * Glass Supplier tRPC Router
 *
 * Admin CRUD operations for GlassSupplier entity
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Includes referential integrity check for deletions
 */

import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import logger from '@/lib/logger';
import {
  createGlassSupplierSchema,
  deleteGlassSupplierSchema,
  getGlassSupplierByIdSchema,
  listGlassSuppliersSchema,
  updateGlassSupplierSchema,
} from '@/lib/validations/admin/glass-supplier.schema';
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { canDeleteGlassSupplier } from '@/server/services/referential-integrity.service';

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: {
  search?: string;
  country?: string;
  isActive?: boolean;
}): Prisma.GlassSupplierWhereInput {
  const where: Prisma.GlassSupplierWhereInput = {};

  // Search by name or code
  if (input.search) {
    where.OR = [
      {
        name: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
      {
        code: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
      {
        country: {
          contains: input.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Filter by country
  if (input.country) {
    where.country = {
      equals: input.country,
      mode: 'insensitive',
    };
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
function buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc'): Prisma.GlassSupplierOrderByWithRelationInput {
  const orderBy: Prisma.GlassSupplierOrderByWithRelationInput = {};

  switch (sortBy) {
    case 'name':
      orderBy.name = sortOrder;
      break;
    case 'code':
      orderBy.code = sortOrder;
      break;
    case 'country':
      orderBy.country = sortOrder;
      break;
    case 'createdAt':
      orderBy.createdAt = sortOrder;
      break;
    default:
      orderBy.name = 'asc'; // Default sort
  }

  return orderBy;
}

/**
 * Glass Supplier Router
 */
export const glassSupplierRouter = createTRPCRouter({
  /**
   * Create Glass Supplier
   * POST /api/trpc/admin/glassSupplier.create
   *
   * Creates a new glass supplier
   */
  create: adminProcedure.input(createGlassSupplierSchema).mutation(async ({ ctx, input }) => {
    // Check for duplicate name
    const existingByName = await ctx.db.glassSupplier.findUnique({
      where: { name: input.name },
    });

    if (existingByName) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Ya existe un proveedor de vidrio con este nombre',
      });
    }

    // Check for duplicate code (if provided)
    if (input.code) {
      const existingByCode = await ctx.db.glassSupplier.findUnique({
        where: { code: input.code },
      });

      if (existingByCode) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe un proveedor de vidrio con este código',
        });
      }
    }

    const glassSupplier = await ctx.db.glassSupplier.create({
      data: input,
    });

    logger.info('Glass supplier created', {
      code: glassSupplier.code,
      country: glassSupplier.country,
      supplierId: glassSupplier.id,
      supplierName: glassSupplier.name,
      userId: ctx.session.user.id,
    });

    return glassSupplier;
  }),

  /**
   * Delete Glass Supplier
   * DELETE /api/trpc/admin/glassSupplier.delete
   *
   * Deletes a glass supplier if no glass types are associated
   * Uses referential integrity service to check dependencies
   */
  delete: adminProcedure.input(deleteGlassSupplierSchema).mutation(async ({ ctx, input }) => {
    // Check if exists
    const existing = await ctx.db.glassSupplier.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Proveedor de vidrio no encontrado',
      });
    }

    // Check referential integrity
    const integrityCheck = await canDeleteGlassSupplier(input.id);

    if (!integrityCheck.canDelete) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: integrityCheck.message,
      });
    }

    await ctx.db.glassSupplier.delete({
      where: { id: input.id },
    });

    logger.warn('Glass supplier deleted', {
      supplierId: input.id,
      supplierName: existing.name,
      userId: ctx.session.user.id,
    });

    return { success: true };
  }),

  /**
   * Get Glass Supplier by ID
   * GET /api/trpc/admin/glassSupplier.getById
   *
   * Returns full glass supplier details
   */
  getById: adminProcedure.input(getGlassSupplierByIdSchema).query(async ({ ctx, input }) => {
    const glassSupplier = await ctx.db.glassSupplier.findUnique({
      where: { id: input.id },
    });

    if (!glassSupplier) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Proveedor de vidrio no encontrado',
      });
    }

    logger.info('Glass supplier retrieved', {
      supplierId: input.id,
      supplierName: glassSupplier.name,
      userId: ctx.session.user.id,
    });

    return glassSupplier;
  }),

  /**
   * List Glass Suppliers
   * GET /api/trpc/admin/glassSupplier.list
   *
   * Supports pagination, search, filtering, and sorting
   */
  list: adminProcedure.input(listGlassSuppliersSchema).query(async ({ ctx, input }) => {
    const { page, limit, sortBy, sortOrder, isActive, ...restFilters } = input;

    const where = buildWhereClause({
      ...restFilters,
      isActive: isActive ? (isActive === 'all' ? undefined : isActive === 'active') : undefined,
    });
    const orderBy = buildOrderByClause(sortBy, sortOrder);

    // Get total count
    const total = await ctx.db.glassSupplier.count({ where });

    // Get paginated items
    const items = await ctx.db.glassSupplier.findMany({
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    logger.info('Glass suppliers listed', {
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
   * Update Glass Supplier
   * PUT /api/trpc/admin/glassSupplier.update
   *
   * Updates an existing glass supplier
   */
  update: adminProcedure.input(updateGlassSupplierSchema).mutation(async ({ ctx, input }) => {
    const { id, data } = input;

    // Check if exists
    const existing = await ctx.db.glassSupplier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Proveedor de vidrio no encontrado',
      });
    }

    // Check for duplicate name (if name is being updated)
    if (data.name && data.name !== existing.name) {
      const duplicate = await ctx.db.glassSupplier.findUnique({
        where: { name: data.name },
      });

      if (duplicate) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe un proveedor con este nombre',
        });
      }
    }

    // Check for duplicate code (if code is being updated)
    if (data.code && data.code !== existing.code) {
      const duplicate = await ctx.db.glassSupplier.findUnique({
        where: { code: data.code },
      });

      if (duplicate) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe un proveedor con este código',
        });
      }
    }

    const glassSupplier = await ctx.db.glassSupplier.update({
      data,
      where: { id },
    });

    logger.info('Glass supplier updated', {
      changes: data,
      supplierId: glassSupplier.id,
      supplierName: glassSupplier.name,
      userId: ctx.session.user.id,
    });

    return glassSupplier;
  }),
});
