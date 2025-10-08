import NextAuth from 'next-auth';

import { authConfig } from './config';

/**
 * IMPORTANT: We export auth directly without React's cache() wrapper to prevent
 * "Invalid value used as weak map key" errors when auth() is called from
 * contexts that include Headers objects or other non-WeakMap-compatible values.
 *
 * NextAuth v5 handles caching internally, so the React cache() wrapper is redundant
 * and causes issues with tRPC context creation.
 *
 * @see https://github.com/nextauthjs/next-auth/discussions/9438
 */
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
