import { PrismaAdapter } from '@auth/prisma-adapter';
import type { DefaultSession, NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { env } from '@/env';
import { db } from '@/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'admin' | 'user';
    } & DefaultSession[ 'user' ];
  }

  interface User {
    role?: 'admin' | 'user';
  }
}

/**
 * Determines if a user is an admin based on their email
 * Compares against the ADMIN_EMAIL environment variable
 */
const isAdmin = (email: string | null | undefined): boolean => {
  if (!email || !env.ADMIN_EMAIL) return false;
  return email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  adapter: PrismaAdapter(db),
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: isAdmin(user.email) ? 'admin' : 'user',
      },
    }),
    async signIn({ user }) {
      // This callback is called after successful sign in
      // We can't redirect here, but we can use the session callback
      return true;
    },
  },
  pages: {
    signIn: '/signin',
  },
  providers: [
    GoogleProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Google provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
} satisfies NextAuthConfig;
