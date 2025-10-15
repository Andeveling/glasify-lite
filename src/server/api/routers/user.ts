import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import logger from '@/lib/logger';
import { adminProcedure, createTRPCRouter } from '../trpc';

/**
 * Zod Validation Schemas
 * Task: T039 [P] [US5]
 */

/**
 * List Users Input Schema
 * Optional filters for searching and filtering users
 */
const listUsersInput = z
  .object({
    role: z.nativeEnum(UserRole).optional(),
    search: z.string().min(1).max(100).optional(),
  })
  .optional();

/**
 * Update User Role Input Schema
 * Task: T039 [P] [US5]
 *
 * Validates userId (cuid format) and role (enum values)
 * Spanish error messages for user-facing validation
 */
const updateUserRoleInput = z.object({
  userId: z.string().cuid({
    message: 'ID de usuario inválido',
  }),
  role: z.nativeEnum(UserRole),
});

/**
 * List Users Output Schema
 * Returns user data without sensitive information
 */
const listUsersOutput = z.array(
  z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    role: z.nativeEnum(UserRole),
    quoteCount: z.number(),
  })
);

/**
 * Update User Role Output Schema
 */
const updateUserRoleOutput = z.object({
  id: z.string(),
  email: z.string().nullable(),
  role: z.nativeEnum(UserRole),
});

/**
 * User Management Router
 * Task: T035 [US5]
 *
 * Provides admin procedures for managing user roles.
 * All procedures use adminProcedure to ensure only admins can access.
 *
 * Features:
 * - List all users with optional filtering
 * - Update user roles
 * - Business rule: Admin cannot demote self
 * - Audit logging for role changes
 */
export const userRouter = createTRPCRouter({
  /**
   * List All Users
   * Task: T036 [US5]
   *
   * Admin procedure to list all users in the system.
   * Supports optional filtering by role and search query.
   *
   * Returns users with:
   * - Basic info (id, name, email, role)
   * - Quote count (aggregated from quotes table)
   * - Creation date
   *
   * No sensitive data (password, sessions) is exposed.
   *
   * @input role - Optional role filter (admin, seller, user)
   * @input search - Optional search query (matches name or email)
   * @output Array of users with quote counts
   */
  'list-all': adminProcedure
    .input(listUsersInput)
    .output(listUsersOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('[US5] Listing all users', {
          role: input?.role,
          search: input?.search,
          adminId: ctx.session.user.id,
        });

        // Build where clause with optional filters
        const where = {
          ...(input?.role && { role: input.role }),
          ...(input?.search && {
            OR: [
              {
                name: {
                  contains: input.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: input.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }),
        };

        // Fetch users with quote count
        const users = await ctx.db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            _count: {
              select: {
                quotes: true,
              },
            },
          },
          orderBy: {
            email: 'asc',
          },
        });

        // Map to output format
        const usersWithQuoteCount = users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          quoteCount: user._count.quotes,
        }));

        logger.info('[US5] Users listed successfully', {
          count: usersWithQuoteCount.length,
          adminId: ctx.session.user.id,
        });

        return usersWithQuoteCount;
      } catch (error) {
        logger.error('[US5] Error listing users', {
          error: error instanceof Error ? error.message : String(error),
          adminId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al listar usuarios',
        });
      }
    }),

  /**
   * Update User Role
   * Task: T037 [US5]
   *
   * Admin procedure to change a user's role.
   *
   * Business Rules:
   * - Only admins can update roles
   * - Admin cannot demote themselves (prevents lockout)
   * - Role changes are logged for audit trail
   *
   * @input userId - User ID to update (cuid format)
   * @input role - New role (admin, seller, user)
   * @output Updated user info (id, email, role, updatedAt)
   */
  'update-role': adminProcedure
    .input(updateUserRoleInput)
    .output(updateUserRoleOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info('[US5] Updating user role', {
          userId: input.userId,
          newRole: input.role,
          adminId: ctx.session.user.id,
        });

        // Business Rule: Admin cannot demote self
        if (input.userId === ctx.session.user.id && input.role !== 'admin') {
          logger.warn('[US5] Admin attempted to demote self', {
            userId: input.userId,
            newRole: input.role,
            adminId: ctx.session.user.id,
          });

          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'No puedes cambiar tu propio rol de administrador',
          });
        }

        // Fetch current user data for logging
        const currentUser = await ctx.db.user.findUnique({
          where: { id: input.userId },
          select: { email: true, role: true },
        });

        if (!currentUser) {
          logger.warn('[US5] User not found for role update', {
            userId: input.userId,
            adminId: ctx.session.user.id,
          });

          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado',
          });
        }

        // Update user role
        const updatedUser = await ctx.db.user.update({
          where: { id: input.userId },
          data: { role: input.role },
          select: {
            id: true,
            email: true,
            role: true,
          },
        });

        // Log role change for audit trail
        logger.info('[US5] User role updated successfully', {
          userId: input.userId,
          email: updatedUser.email,
          oldRole: currentUser.role,
          newRole: updatedUser.role,
          adminId: ctx.session.user.id,
          adminEmail: ctx.session.user.email,
        });

        return updatedUser;
      } catch (error) {
        // Re-throw TRPCErrors
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error('[US5] Error updating user role', {
          error: error instanceof Error ? error.message : String(error),
          userId: input.userId,
          newRole: input.role,
          adminId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el rol del usuario',
        });
      }
    }),
});
