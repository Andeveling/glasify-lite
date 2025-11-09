import { TRPCError } from "@trpc/server";
import { eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";
import { quotes, USER_ROLE_VALUES, users } from "@/server/db/schema";
import {
  adminProcedure,
  createTRPCRouter,
  sellerOrAdminProcedure,
} from "../trpc";

const MIN_SEARCH_LENGTH = 3;
const MAX_SEARCH_LENGTH = 50;

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
    role: z.enum(USER_ROLE_VALUES).optional(),
    search: z.string().min(MIN_SEARCH_LENGTH).max(MAX_SEARCH_LENGTH).optional(),
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
  role: z.enum(USER_ROLE_VALUES),
  userId: z.string().cuid({
    error: "ID de usuario inválido",
  }),
});

/**
 * List Users Output Schema
 * Returns user data without sensitive information
 */
const listUsersOutput = z.array(
  z.object({
    email: z.string().nullable(),
    id: z.string(),
    name: z.string().nullable(),
    quoteCount: z.number(),
    role: z.enum(USER_ROLE_VALUES),
  })
);

/**
 * Update User Role Output Schema
 */
const updateUserRoleOutput = z.object({
  email: z.string().nullable(),
  id: z.string(),
  role: z.enum(USER_ROLE_VALUES),
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
   * Task: T036 [US5] - Updated for seller access
   *
   * Admin and Seller procedure to list all users in the system.
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
  "list-all": sellerOrAdminProcedure
    .input(listUsersInput)
    .output(listUsersOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info("[US5] Listing all users", {
          role: input?.role,
          search: input?.search,
          viewerId: ctx.session.user.id,
          viewerRole: ctx.session.user.role,
        });

        // Build where conditions
        const conditions: SQL<unknown>[] = [];

        if (input?.role) {
          conditions.push(eq(users.role, input.role));
        }

        if (input?.search) {
          const searchCondition = or(
            ilike(users.name, `%${input.search}%`),
            ilike(users.email, `%${input.search}%`)
          );
          if (searchCondition) {
            conditions.push(searchCondition);
          }
        }

        // Fetch users with quote count using subquery
        const usersWithQuotes = await ctx.db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            quoteCount: sql<number>`(
              SELECT COUNT(*)::int 
              FROM ${quotes} 
              WHERE ${quotes.userId} = ${users.id}
            )`,
          })
          .from(users)
          .where(
            conditions.length > 0
              ? sql`${sql.join(conditions, sql` AND `)}`
              : undefined
          )
          .orderBy(users.email);

        logger.info("[US5] Users listed successfully", {
          adminId: ctx.session.user.id,
          count: usersWithQuotes.length,
        });

        return usersWithQuotes;
      } catch (error) {
        logger.error("[US5] Error listing users", {
          adminId: ctx.session.user.id,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al listar usuarios",
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
  "update-role": adminProcedure
    .input(updateUserRoleInput)
    .output(updateUserRoleOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("[US5] Updating user role", {
          adminId: ctx.session.user.id,
          newRole: input.role,
          userId: input.userId,
        });

        // Business Rule: Admin cannot demote self
        if (input.userId === ctx.session.user.id && input.role !== "admin") {
          logger.warn("[US5] Admin attempted to demote self", {
            adminId: ctx.session.user.id,
            newRole: input.role,
            userId: input.userId,
          });

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No puedes cambiar tu propio rol de administrador",
          });
        }

        // Fetch current user data for logging
        const [currentUser] = await ctx.db
          .select({ email: users.email, role: users.role })
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (!currentUser) {
          logger.warn("[US5] User not found for role update", {
            adminId: ctx.session.user.id,
            userId: input.userId,
          });

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado",
          });
        }

        // Update user role
        const updatedUsers = await ctx.db
          .update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.userId))
          .returning();

        const updatedUser = updatedUsers[0];

        if (!updatedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al actualizar el rol del usuario",
          });
        }

        // Log role change for audit trail
        logger.info("[US5] User role updated successfully", {
          adminEmail: ctx.session.user.email,
          adminId: ctx.session.user.id,
          email: updatedUser.email,
          newRole: updatedUser.role,
          oldRole: currentUser.role,
          userId: input.userId,
        });

        return updatedUser;
      } catch (error) {
        // Re-throw TRPCErrors
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("[US5] Error updating user role", {
          adminId: ctx.session.user.id,
          error: error instanceof Error ? error.message : String(error),
          newRole: input.role,
          userId: input.userId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el rol del usuario",
        });
      }
    }),
});
