/**
 * E2E Test Auth Helper
 *
 * Provides session injection for Playwright E2E tests using Better Auth's
 * test utilities plugin. This enables authenticated admin testing without
 * requiring Google OAuth browser automation.
 *
 * IMPORTANT: This helper requires:
 * 1. BETTER_AUTH_TEST_UTILS="true" in .env.local
 * 2. testUtils plugin enabled in auth config
 *
 * @module e2e/helpers/test-auth-helper
 */

import type { PlaywrightTestArgs } from "@playwright/test";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

/**
 * Test user structure returned by testUtils.createUser
 */
export interface TestUser {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string | null;
}

/**
 * Authenticated session with cookies for Playwright
 */
export interface AuthSession {
  /** The session token */
  token: string;
  /** Session expiry */
  expiresAt: Date;
  /** User ID */
  userId: string;
  /** Cookies ready for Playwright injection */
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Lax" | "Strict" | "None";
  }>;
}

/**
 * Resolved test context from auth.$context
 */
interface TestContext {
  test: {
    createUser: (data: { email: string; name?: string }) => TestUser;
    saveUser: (user: TestUser) => Promise<TestUser>;
    deleteUser: (userId: string) => Promise<void>;
    login: (data: { userId: string }) => Promise<{
      session: { token: string; expiresAt: Date; userId: string };
      cookies: Array<{
        name: string;
        value: string;
        domain?: string;
        path?: string;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "Lax" | "Strict" | "None";
      }>;
    }>;
    getAuthHeaders: (data: { userId: string }) => Promise<Record<string, string>>;
    getCookies: (data: { userId: string; domain: string }) => Promise<AuthSession["cookies"]>;
  };
}

/**
 * Get the test context from auth.$context
 * This will fail if testUtils plugin is not enabled
 */
async function getTestContext(): Promise<TestContext["test"]> {
  const ctx = await auth.$context as TestContext;
  if (!ctx.test) {
    throw new Error(
      "testUtils not available in auth context.\n" +
        "Ensure BETTER_AUTH_TEST_UTILS=\"true\" is set in .env.local and restart the dev server."
    );
  }
  return ctx.test;
}

/**
 * Create a test user and save to database
 *
 * @param overrides - User fields to override defaults
 * @returns Created user
 */
export async function createTestUser(
  overrides: Partial<{ email: string; name: string }> = {}
): Promise<TestUser> {
  const test = await getTestContext();
  const user = test.createUser({
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    name: overrides.name ?? "Test User",
  });
  return test.saveUser(user);
}

/**
 * Set user role directly via Prisma (bypasses testUtils for role updates)
 *
 * @param userId - User ID
 * @param role - New role
 */
export async function setUserRole(
  userId: string,
  role: "admin" | "seller" | "user"
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { role },
  });
}

/**
 * Get user by ID from database
 *
 * @param userId - User ID
 * @returns User or null
 */
export async function getUserById(
  userId: string
): Promise<{ id: string; email: string; name?: string | null; role: string } | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

/**
 * Create authenticated session and return cookies for Playwright
 *
 * @param userId - User ID to create session for
 * @returns Auth session with cookies
 */
export async function createAuthSession(userId: string): Promise<AuthSession> {
  const test = await getTestContext();
  const result = await test.login({ userId });

  return {
    token: result.session.token,
    expiresAt: result.session.expiresAt,
    userId: result.session.userId,
    cookies: result.cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain ?? "localhost",
      path: cookie.path ?? "/",
      httpOnly: cookie.httpOnly ?? true,
      secure: cookie.secure ?? false,
      sameSite: cookie.sameSite ?? "Lax",
    })),
  };
}

/**
 * Create admin user with admin role and return auth session
 *
 * @param overrides - User fields to override defaults
 * @returns Auth session for admin user
 */
export async function createAdminUser(
  overrides: Partial<{ email: string; name: string }> = {}
): Promise<AuthSession> {
  const user = await createTestUser({
    email: overrides.email ?? `admin-test-${Date.now()}@example.com`,
    name: overrides.name ?? "Admin Test",
  });

  await setUserRole(user.id, "admin");

  return createAuthSession(user.id);
}

/**
 * Delete a test user (cleanup after test)
 *
 * @param userId - User ID to delete
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const test = await getTestContext();
  await test.deleteUser(userId);
}

/**
 * Inject auth cookies into Playwright page context
 *
 * @param page - Playwright page object
 * @param cookies - Cookies to inject
 */
export async function injectAuthCookies(
  page: PlaywrightTestArgs["page"],
  cookies: AuthSession["cookies"]
): Promise<void> {
  await page.context().addCookies(cookies);
}

/**
 * Admin test fixture - creates admin user, injects cookies, returns cleanup function
 *
 * Usage:
 * ```typescript
 * test("admin flow", async ({ page }) => {
 *   const { user, cleanup } = await createAdminSession();
 *   await injectAuthCookies(page, user.cookies);
 *   // ... test code ...
 *   await cleanup();
 * });
 * ```
 */
export async function createAdminSession(): Promise<{
  user: AuthSession;
  cleanup: () => Promise<void>;
}> {
  const user = await createAdminUser();
  return {
    user,
    cleanup: async () => {
      await deleteTestUser(user.userId);
    },
  };
}
