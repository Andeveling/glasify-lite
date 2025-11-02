import { headers } from "next/headers";
import { auth } from "@/server/auth";

type SellerOnlyProps = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

/**
 * Server Component guard that renders children for seller or admin users
 *
 * @example
 * ```tsx
 * <SellerOnly>
 *   <CreateQuoteButton />
 * </SellerOnly>
 *
 * <SellerOnly fallback={<p>Solo para vendedores</p>}>
 *   <QuotesManagement />
 * </SellerOnly>
 * ```
 *
 * @param children - Content to render for seller/admin users
 * @param fallback - Optional content to render for regular users
 * @returns JSX element or null
 */
export async function SellerOnly({
	children,
	fallback = null,
}: SellerOnlyProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!["admin", "seller"].includes(session?.user?.role || "")) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
