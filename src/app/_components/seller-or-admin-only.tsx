import { headers } from "next/headers";
import { auth } from "@/server/auth";

type SellerOrAdminOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Server Component guard that renders children only for seller or admin users
 *
 * Use this guard for UI elements that both sellers and admins should see,
 * such as viewing all quotes or accessing the user database.
 *
 * @example
 * ```tsx
 * <SellerOrAdminOnly>
 *   <QuotesTable showUserInfo />
 * </SellerOrAdminOnly>
 *
 * <SellerOrAdminOnly fallback={<p>Acceso restringido a vendedores</p>}>
 *   <UsersList />
 * </SellerOrAdminOnly>
 * ```
 *
 * @param children - Content to render for seller or admin users
 * @param fallback - Optional content to render for non-seller/non-admin users
 * @returns JSX element or null
 */
export async function SellerOrAdminOnly({
  children,
  fallback = null,
}: SellerOrAdminOnlyProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = session?.user?.role;

  if (role !== "admin" && role !== "seller") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
