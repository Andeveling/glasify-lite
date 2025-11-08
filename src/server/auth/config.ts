import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/server/db/drizzle";
import { users } from "@/server/db/schemas/user.schema";

const {
  BASE_URL,
  BETTER_AUTH_SECRET,
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  ADMIN_EMAIL,
} = env;

/**
 * Determines if a user is an admin based on their email
 * Compares against the ADMIN_EMAIL environment variable
 */
const isAdmin = (email: string | null | undefined): boolean => {
  if (!(email && ADMIN_EMAIL)) {
    return false;
  }
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

/**
 * Better Auth instance configuration
 * Handles authentication with Google OAuth, session management, and RBAC
 */
export const auth = betterAuth({
  appName: "Glasify",
  baseURL: BASE_URL,

  callbacks: {
    async signIn({
      user,
    }: {
      user: { id: string; email: string | null; role?: string };
    }) {
      // Set admin role if email matches ADMIN_EMAIL
      if (isAdmin(user.email) && user.role === "user") {
        await db
          .update(users)
          .set({ role: "admin", updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
      return true;
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  plugins: [
    nextCookies(), // MUST be last plugin
  ],
  secret: BETTER_AUTH_SECRET,

  socialProviders: {
    google: {
      // Always request refresh token and ask user to select account
      accessType: "offline",
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
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
