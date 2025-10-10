/**
 * ProfileSupplier tRPC Router
 * 
 * Profile manufacturer management (Rehau, Deceuninck, etc.)
 * 
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import {
  createProfileSupplierSchema,
  listProfileSuppliersSchema,
  updateProfileSupplierSchema,
} from '../../../schemas/supplier.schema';
import { db } from '../../../db';
import { TRPCError } from '@trpc/server';

export const profileSupplierRouter = createTRPCRouter({
  /**
   * List all profile suppliers
   */
  list: protectedProcedure
    .input(listProfileSuppliersSchema.optional())
    .query(({ input }) => {
      const where = {
        ...(input?.isActive !== undefined && { isActive: input.isActive }),
        ...(input?.materialType && { materialType: input.materialType }),
        ...(input?.search && {
          name: {
            contains: input.search,
            mode: 'insensitive' as const,
          },
        }),
      };

      return db.profileSupplier.findMany({
        orderBy: { name: 'asc' },
        where,
      });
    }),

  /**
   * Get a single profile supplier by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const supplier = await db.profileSupplier.findUnique({
        where: { id: input.id },
      });

      if (!supplier) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `ProfileSupplier with ID ${input.id} not found`,
        });
      }

      return supplier;
    }),

  /**
   * Create a new profile supplier
   */
  create: protectedProcedure
    .input(createProfileSupplierSchema)
    .mutation(async ({ input }) => {
      // Check if supplier with same name already exists
      const existing = await db.profileSupplier.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `ProfileSupplier with name "${input.name}" already exists`,
        });
      }

      return db.profileSupplier.create({
        data: input,
      });
    }),

  /**
   * Update a profile supplier
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: updateProfileSupplierSchema,
      })
    )
    .mutation(async ({ input }) => {
      // Check if supplier exists
      const existing = await db.profileSupplier.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `ProfileSupplier with ID ${input.id} not found`,
        });
      }

      // If updating name, check for duplicates
      if (input.data.name && input.data.name !== existing.name) {
        const duplicate = await db.profileSupplier.findUnique({
          where: { name: input.data.name },
        });

        if (duplicate) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `ProfileSupplier with name "${input.data.name}" already exists`,
          });
        }
      }

      return db.profileSupplier.update({
        data: input.data,
        where: { id: input.id },
      });
    }),

  /**
   * Delete a profile supplier
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      // Check if supplier exists
      const existing = await db.profileSupplier.findUnique({
        include: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated field
          _count: {
            select: { models: true },
          },
        },
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `ProfileSupplier with ID ${input.id} not found`,
        });
      }

      // Prevent deletion if supplier has models
      if (existing._count.models > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete ProfileSupplier "${existing.name}" because it has ${existing._count.models} associated models`,
        });
      }

      return db.profileSupplier.delete({
        where: { id: input.id },
      });
    }),

  /**
   * Toggle active status
   */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const supplier = await db.profileSupplier.findUnique({
        where: { id: input.id },
      });

      if (!supplier) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `ProfileSupplier with ID ${input.id} not found`,
        });
      }

      return db.profileSupplier.update({
        data: { isActive: !supplier.isActive },
        where: { id: input.id },
      });
    }),
});
