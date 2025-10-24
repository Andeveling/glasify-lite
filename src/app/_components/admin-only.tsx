import { headers } from 'next/headers';
import { auth } from '@/server/auth';

type AdminOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Server Component guard that renders children only for admin users
 *
 * @example
 * ```tsx
 * <AdminOnly>
 *   <Button>Delete All Quotes</Button>
 * </AdminOnly>
 *
 * <AdminOnly fallback={<p>Acceso restringido</p>}>
 *   <SettingsPanel />
 * </AdminOnly>
 * ```
 *
 * @param children - Content to render for admin users
 * @param fallback - Optional content to render for non-admin users
 * @returns JSX element or null
 */
export async function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== 'admin') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
