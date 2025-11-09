/**
 * User Router Schemas
 *
 * Input/output schemas for user management procedures.
 * Extends drizzle-zod generated schemas with custom validations.
 */

import { z } from "zod";
import { USER_ROLE_VALUES } from "@/server/db/schema";
import { userSelectSchema } from "@/server/db/schemas/user.schema";
import { USER_SEARCH_LIMITS, USER_VALIDATION_MESSAGES } from "./user.constants";

/**
 * List Users Input Schema
 *
 * Optional filters:
 * - role: Filter by specific role (admin, seller, user)
 * - search: Search in name or email fields (minimum 3 chars)
 */
export const listUsersInput = z
  .object({
    role: z.enum(USER_ROLE_VALUES).optional(),
    search: z
      .string()
      .min(USER_SEARCH_LIMITS.MIN_LENGTH, {
        message: USER_VALIDATION_MESSAGES.INVALID_SEARCH,
      })
      .max(USER_SEARCH_LIMITS.MAX_LENGTH, {
        message: USER_VALIDATION_MESSAGES.INVALID_SEARCH,
      })
      .optional(),
  })
  .optional();

/**
 * List Users Output Schema
 *
 * Returns array of users with computed quote counts.
 * Extends user select schema with additional metadata.
 *
 * Note: name and email can be null from database but Zod transforms to undefined
 * for consistency with API output types.
 */
export const listUsersOutput = z.array(
  userSelectSchema
    .extend({
      quoteCount: z.number().int().min(0),
    })
    .transform((user) => ({
      ...user,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
    }))
);

/**
 * Update User Role Input Schema
 *
 * Validates userId (CUID format) and role (enum values).
 * Used for both admin and seller operations.
 */
export const updateUserRoleInput = z.object({
  role: z.enum(USER_ROLE_VALUES),
  userId: z.string().cuid({
    message: USER_VALIDATION_MESSAGES.INVALID_USER_ID,
  }),
});

/**
 * Update User Role Output Schema
 *
 * Returns updated user data without sensitive information.
 * Transforms null to undefined for email consistency.
 */
export const updateUserRoleOutput = userSelectSchema
  .pick({
    id: true,
    email: true,
    role: true,
  })
  .transform((user) => ({
    ...user,
    email: user.email ?? undefined,
  }));
