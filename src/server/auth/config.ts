import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/server/db";

/**
 * Determines if a user is an admin based on their email
 * Compares against the ADMIN_EMAIL environment variable
 */
const isAdmin = (email: string | null | undefined): boolean => {
  if (!(email && process.env.ADMIN_EMAIL)) {
    return false;
  }
  return email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
};

/**
 * Better Auth instance configuration
 * Handles authentication with Google OAuth, session management, and RBAC
 */
export const auth = betterAuth({
  appName: "Glasify",
  baseURL:
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://glasify-lite.vercel.app",

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
  secret:
    process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production",

  socialProviders: {
    google: {
      // Always request refresh token and ask user to select account
      accessType: "offline",
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
