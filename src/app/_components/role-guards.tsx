import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { auth } from '@/server/auth';

/**
 * Admin Only Component
 * Task: T034 [US4]
 *
 * Server Component that conditionally renders children only for admin users.
 * This is a UI guard - it does NOT provide security (use middleware + tRPC for that).
 *
 * Purpose: Improve UX by hiding admin-only actions from non-admin users.
 * The actual authorization must happen server-side (middleware blocks routes, tRPC blocks procedures).
 *
 * Usage:
 * ```tsx
 * <AdminOnly>
 *   <Button>Editar Modelo</Button>
 * </AdminOnly>
 * ```
 *
 * @param children - Content to render only for admins
 * @param fallback - Optional content to render for non-admins
 * @returns Children if admin, fallback or null otherwise
 */
export async function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === 'admin';

  if (!isAdmin) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

/**
 * Seller Only Component
 *
 * Server Component that conditionally renders children only for seller and admin users.
 * This is a UI guard - it does NOT provide security (use middleware + tRPC for that).
 *
 * Purpose: Improve UX by hiding seller-only actions from regular users.
 *
 * Usage:
 * ```tsx
 * <SellerOnly>
 *   <Button>Ver Todas Mis Cotizaciones</Button>
 * </SellerOnly>
 * ```
 *
 * @param children - Content to render only for sellers and admins
 * @param fallback - Optional content to render for non-sellers
 * @returns Children if seller or admin, fallback or null otherwise
 */
export async function SellerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isSeller = session?.user?.role === 'seller';
  const isAdmin = session?.user?.role === 'admin';

  if (!(isSeller || isAdmin)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

/**
 * Authenticated Only Component
 *
 * Server Component that conditionally renders children only for authenticated users.
 * This is a UI guard - it does NOT provide security (use middleware + tRPC for that).
 *
 * Purpose: Improve UX by hiding authenticated-only actions from guests.
 *
 * Usage:
 * ```tsx
 * <AuthenticatedOnly>
 *   <Button>Mis Cotizaciones</Button>
 * </AuthenticatedOnly>
 * ```
 *
 * @param children - Content to render only for authenticated users
 * @param fallback - Optional content to render for guests
 * @returns Children if authenticated, fallback or null otherwise
 */
export async function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthenticated = !!session?.user;

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
