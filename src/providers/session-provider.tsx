/**
 * Session Provider
 *
 * Wraps application with NextAuth SessionProvider for client-side session access.
 * Required for useSession() hook to work in Client Components.
 *
 * @module providers/session-provider
 */

'use client';

import type { Session } from 'next-auth';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

type SessionProviderProps = {
  children: React.ReactNode;
  session?: Session | null;
};

/**
 * Session Provider Component
 *
 * Wraps children with NextAuth SessionProvider.
 * Allows client components to access session via useSession() hook.
 *
 * @example
 * ```tsx
 * // In root layout or route layout
 * import { SessionProvider } from '@/providers/session-provider';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <SessionProvider>
 *       {children}
 *     </SessionProvider>
 *   );
 * }
 * ```
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
