/**
 * Service tRPC Router
 *
 * Admin CRUD operations for Service entity
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Includes referential integrity check for deletions
 */

import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import logger from '@/lib/logger';
import {
  createServiceSchema,
  deleteServiceSchema,
  getServiceByIdSchema,
  listServicesSchema,
  updateServiceSchema,
} from '@/lib/validations/admin/service.schema';
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { canDeleteService } from '@/server/services/referential-integrity.service';

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: {
  search?: string;
  type?: 'all' | 'area' | 'perimeter' | 'fixed';
  isActive?: 'all' | 'active' | 'inactive';
}): Prisma.ServiceWhereInput {
  const where: Prisma.ServiceWhereInput = {};

  // Search by name
  if (input.search) {
    where.name = {
      contains: input.search,
      mode: 'insensitive',
    };
  }

  // Filter by type
  if (input.type && input.type !== 'all') {
    where.type = input.type;
  }

  // Filter by active status
  if (input.isActive && input.isActive !== 'all') {
    where.isActive = input.isActive === 'active';
  }

  return where;
}

/**
 * Helper: Build orderBy clause for list query
 */
function buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc'): Prisma.ServiceOrderByWithRelationInput {
  const orderBy: Prisma.ServiceOrderByWithRelationInput = {};

  switch (sortBy) {
    case 'name':
      orderBy.name = sortOrder;
      break;
    case 'rate':
      orderBy.rate = sortOrder;
      break;
    case 'updatedAt':
      orderBy.updatedAt = sortOrder;
      break;
    default:
      orderBy.createdAt = sortOrder;
  }

  return orderBy;
}

/**
 * Service Router
 */
export const serviceRouter = createTRPCRouter({
  /**
   * Create Service
   * POST /api/trpc/admin.service.create
   *
   * Creates a new service
   */
  create: adminProcedure.input(createServiceSchema).mutation(async ({ ctx, input }) => {
    const service = await ctx.db.service.create({
      data: input,
    });

    logger.info('Service created', {
      serviceId: service.id,
      serviceName: service.name,
      serviceType: service.type,
      userId: ctx.session.user.id,
    });

    return service;
  }),

  /**
   * Delete Service
   * DELETE /api/trpc/admin.service.delete
   *
   * Deletes service after checking referential integrity
   */
  delete: adminProcedure.input(deleteServiceSchema).mutation(async ({ ctx, input }) => {
    // Check referential integrity
    const integrityCheck = await canDeleteService(input.id);

    if (!integrityCheck.canDelete) {
      logger.warn('Service deletion blocked - referential integrity', {
        dependencies: integrityCheck.dependencies,
        serviceId: input.id,
        userId: ctx.session.user.id,
      });

      throw new TRPCError({
        code: 'CONFLICT',
        message: integrityCheck.message,
      });
    }

    // Delete service
    const deletedService = await ctx.db.service.delete({
      where: { id: input.id },
    });

    logger.info('Service deleted', {
      serviceId: deletedService.id,
      serviceName: deletedService.name,
      userId: ctx.session.user.id,
    });

    return { success: true };
  }),

  /**
   * Get Service by ID
   * GET /api/trpc/admin.service.getById
   *
   * Returns detailed service information
   */
  getById: adminProcedure.input(getServiceByIdSchema).query(async ({ ctx, input }) => {
    const service = await ctx.db.service.findUnique({
      where: { id: input.id },
    });

    if (!service) {
      logger.warn('Service not found', {
        serviceId: input.id,
        userId: ctx.session.user.id,
      });
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Servicio no encontrado',
      });
    }

    logger.info('Service retrieved', {
      serviceId: service.id,
      userId: ctx.session.user.id,
    });

    return service;
  }),

  /**
   * List Services
   * GET /api/trpc/admin.service.list
   *
   * Returns paginated list of services with filtering and sorting
   */
  list: adminProcedure.input(listServicesSchema).query(async ({ ctx, input }) => {
    const { limit, page, search, sortBy, sortOrder, type, isActive } = input;

    const where = buildWhereClause({ isActive, search, type });
    const orderBy = buildOrderByClause(sortBy, sortOrder);

    // Execute count and find queries in parallel
    const [total, items] = await Promise.all([
      ctx.db.service.count({ where }),
      ctx.db.service.findMany({
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info('Services listed', {
      count: items.length,
      filters: { isActive, search, type },
      page,
      total,
      userId: ctx.session.user.id,
    });

    return {
      items,
      limit,
      page,
      total,
      totalPages,
    };
  }),

  /**
   * Update Service
   * PATCH /api/trpc/admin.service.update
   *
   * Updates service information
   */
  update: adminProcedure.input(updateServiceSchema).mutation(async ({ ctx, input }) => {
    const { data, id } = input;

    // Verify service exists
    const currentService = await ctx.db.service.findUnique({
      select: { id: true },
      where: { id },
    });

    if (!currentService) {
      logger.warn('Service not found for update', {
        serviceId: id,
        userId: ctx.session.user.id,
      });
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Servicio no encontrado',
      });
    }

    // Update service
    const updatedService = await ctx.db.service.update({
      data,
      where: { id },
    });

    logger.info('Service updated', {
      serviceId: updatedService.id,
      userId: ctx.session.user.id,
    });

    return updatedService;
  }),
});
