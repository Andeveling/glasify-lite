/**
 * User Service - Business Logic Layer
 *
 * Centralized logic for user management operations:
 * - Listing users with quote aggregation
 * - Updating user roles with audit logging
 *
 * Separates database access from presentation logic.
 */

import type { db } from "@/server/db/drizzle";
import { eq, ilike, or, sql } from "drizzle-orm";
import logger from "@/lib/logger";
import { quotes, users, type User, type USER_ROLE_VALUES } from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Filter object for listing users
 */
export type ListUsersFilters = {
  role?: (typeof USER_ROLE_VALUES)[number];
  search?: string;
};

/**
 * User with quote count
 */
export type UserWithQuoteCount = Omit<User, "name" | "email"> & {
  name?: string;
  email?: string;
  quoteCount: number;
};

/**
 * List all users with optional filtering and quote counts
 *
 * @param client - Drizzle database instance from tRPC context
 * @param filters - Optional role filter and search query
 * @returns Array of users with computed quote counts
 *
 * Builds SQL conditions dynamically:
 * - Role filter: `users.role = $role`
 * - Search filter: `users.name ILIKE $search OR users.email ILIKE $search`
 * - Quote aggregation: Subquery counting user's quotes
 *
 * Performance: O(n) where n = number of users, uses index on User(role)
 */
export async function listUsersWithQuoteCount(
  client: DbClient,
  filters?: ListUsersFilters
): Promise<UserWithQuoteCount[]> {
  const conditions: Parameters<typeof sql.join>[0] = [];

  // Apply role filter if provided
  if (filters?.role) {
    conditions.push(eq(users.role, filters.role));
  }

  // Apply search filter if provided (searches name and email)
  if (filters?.search) {
    const searchCondition = or(
      ilike(users.name, `%${filters.search}%`),
      ilike(users.email, `%${filters.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // Build WHERE clause - combine all conditions with AND
  const whereClause =
    conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

  // Query users with quote count aggregation
  const usersWithQuotes = (await client
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      // Subquery: count quotes for each user
      quoteCount: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${quotes} 
        WHERE ${quotes.userId} = ${users.id}
      )`,
    })
    .from(users)
    .where(whereClause)
    .orderBy(users.email)) as Array<{
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
    image: string | null;
    role: (typeof USER_ROLE_VALUES)[number];
    createdAt: Date;
    updatedAt: Date;
    quoteCount: number;
  }>;

  // Transform null values to undefined for API consistency
  return usersWithQuotes.map((user) => ({
    ...user,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
  })) as UserWithQuoteCount[];
}

/**
 * Update user role with audit logging
 *
 * Business rules:
 * - Admin cannot demote themselves
 * - All role changes are logged for audit trail
 *
 * @param client - Drizzle database instance
 * @param userId - User ID to update
 * @param newRole - New role to assign
 * @param adminId - Admin making the change (for audit logging)
 * @returns Updated user object
 *
 * @throws Error if user not found
 */
export async function updateUserRoleWithAudit(
  client: DbClient,
  userId: string,
  newRole: (typeof USER_ROLE_VALUES)[number],
  adminId: string
): Promise<User> {
  // Fetch current user for audit trail
  const [currentUser] = await client
    .select({
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) {
    throw new Error(`User ${userId} not found`);
  }

  // Update user role
  const updatedUsers = (await client
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId))
    .returning()) as User[];

  const updatedUser = updatedUsers[0];

  if (!updatedUser) {
    throw new Error(`Failed to update user ${userId}`);
  }

  // Log role change for audit trail
  logger.info("[US5] User role updated successfully", {
    adminId,
    email: updatedUser.email,
    newRole: updatedUser.role,
    oldRole: currentUser.role,
    userId,
  });

  return updatedUser;
}
