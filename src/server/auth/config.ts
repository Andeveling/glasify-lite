import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { testUtils } from "better-auth/plugins"
import { env } from "@/env"
import { db } from "@/server/db"

/**
 * Determines if a user is an admin based on their email
 * Compares against the ADMIN_EMAIL environment variable
 */
const isAdmin = (email: string | null | undefined): boolean => {
  if (!(email && env.ADMIN_EMAIL)) {
    return false
  }
  return email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()
}

/**
 * Plugin list for Better Auth
 * - testUtils: ONLY added in development/test environments
 * - nextCookies: MUST be last plugin
 *
 * WARNING: testUtils exposes internal methods. Never enable in production.
 */
const plugins = [
  // Test utilities plugin - ONLY for development/test
  // Guards: only if explicitly enabled and not in production
  ...(process.env.NODE_ENV !== "production" && process.env.BETTER_AUTH_TEST_UTILS === "true"
    ? [testUtils()]
    : []),
  nextCookies(), // MUST be last plugin
]

/**
 * Better Auth instance configuration
 * Handles authentication with email/password, session management, and RBAC
 *
 * Note: Better Auth will automatically detect baseURL from BETTER_AUTH_URL env var
 * @see https://www.better-auth.com/docs/concepts/base-url
 */
export const auth = betterAuth({
  appName: "Glasify",
  // Don't set baseURL here - let Better Auth auto-detect from BETTER_AUTH_URL env var

  callbacks: {
    async signIn({ user }: { user: { id: string; email: string | null; role?: string } }) {
      // Set admin role if email matches ADMIN_EMAIL
      if (isAdmin(user.email) && user.role === "user") {
        await db.user.update({
          data: { role: "admin" },
          where: { id: user.id },
        })
      }
      return true
    },
  },
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins,
  secret: env.BETTER_AUTH_SECRET || "development-secret-change-in-production",

  user: {
    additionalFields: {
      role: {
        defaultValue: "user",
        type: "string",
      },
    },
  },
})
