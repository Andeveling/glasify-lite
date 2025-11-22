import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env";
import { db } from "@/server/db";

/**
 * Determines if a user is an admin based on their email
 * Compares against the ADMIN_EMAIL environment variable
 */
const isAdmin = (email: string | null | undefined): boolean => {
  if (!(email && env.ADMIN_EMAIL)) {
    return false;
  }
  return email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
};

/**
 * Better Auth instance configuration
 * Handles authentication with Google OAuth, session management, and RBAC
 * 
 * Note: Better Auth will automatically detect baseURL from BETTER_AUTH_URL env var
 * @see https://www.better-auth.com/docs/concepts/base-url
 */
export const auth = betterAuth({
  appName: "Glasify",
  // Don't set baseURL here - let Better Auth auto-detect from BETTER_AUTH_URL env var

  callbacks: {
    async signIn({
      user,
    }: {
      user: { id: string; email: string | null; role?: string };
    }) {
      // Set admin role if email matches ADMIN_EMAIL
      if (isAdmin(user.email) && user.role === "user") {
        await db.user.update({
          data: { role: "admin" },
          where: { id: user.id },
        });
      }
      return true;
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  plugins: [
    nextCookies(), // MUST be last plugin
  ],
  secret: env.BETTER_AUTH_SECRET || "development-secret-change-in-production",

  socialProviders: {
    google: {
      // Always request refresh token and ask user to select account
      accessType: "offline",
      clientId: env.AUTH_GOOGLE_ID as string,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      prompt: "select_account consent",
    },
  },

  user: {
    additionalFields: {
      role: {
        defaultValue: "user",
        type: "string",
      },
    },
  },
});
