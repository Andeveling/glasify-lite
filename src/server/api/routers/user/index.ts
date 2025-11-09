/**
 * User Router - Composition Layer
 *
 * Aggregates user-related procedures:
 * - List users with quote counts (admin only)
 * - Update user role (admin only)
 *
 * Delegates business logic to user.service.ts
 * Delegates validation to user.schemas.ts
 */

import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  listUsersInput,
  listUsersOutput,
  updateUserRoleInput,
  updateUserRoleOutput,
} from "./user.schemas";
import {
  listUsersWithQuoteCount,
  updateUserRoleWithAudit,
} from "./user.service";

/**
 * User Router
 *
 * Procedures:
 * - `list`: List all users with optional role/search filtering
 * - `update-role`: Update a user's role
 */
export const userRouter = createTRPCRouter({
  list: adminProcedure
    .input(listUsersInput)
    .output(listUsersOutput)
    .query(async ({ ctx, input }) => {
      try {
        const users = await listUsersWithQuoteCount(ctx.db, input);
        return users;
      } catch (error) {
        logger.error("[US5-TRPC] Failed to list users", {
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : error,
          filters: input,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No se pudieron cargar los usuarios",
        });
      }
    }),

  "update-role": adminProcedure
    .input(updateUserRoleInput)
    .output(updateUserRoleOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await updateUserRoleWithAudit(
          ctx.db,
          input.userId,
          input.role,
          ctx.session.user.id
        );

        // Transform null -> undefined for API consistency
        return {
          id: updatedUser.id,
          email: updatedUser.email ?? undefined,
          role: updatedUser.role,
        };
      } catch (error) {
        logger.error("[US5-TRPC] Failed to update user role", {
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : error,
          userId: input.userId,
          newRole: input.role,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error && error.message.includes("not found")
              ? "Usuario no encontrado"
              : "No se pudo actualizar el rol del usuario",
        });
      }
    }),
});
