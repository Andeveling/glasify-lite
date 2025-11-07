/**
 * Session Provider
 *
 * Wraps application with Better Auth for client-side session access.
 * Better Auth uses nano-store internally, so no additional provider wrapper is needed.
 * The auth-client is already reactive and will update across the app.
 *
 * @module providers/session-provider
 */

"use client";

type SessionProviderProps = {
  children: React.ReactNode;
};

/**
 * Session Provider Component (Deprecated - kept for compatibility)
 *
 * Better Auth manages session state internally via nano-store.
 * This provider is now a simple pass-through component.
 * useSession() from auth-client handles reactive session updates.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  // Better Auth handles session state internally via nano-store
  // No external provider wrapper needed
  return children;
}
