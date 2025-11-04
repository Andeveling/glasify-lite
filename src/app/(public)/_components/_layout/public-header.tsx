import Link from "next/link";
import { CartIndicator } from "@/app/_components/cart-indicator";
import { RoleBasedNav } from "@/app/_components/role-based-nav";
import { getServerSession } from "@/lib/server-auth";
import { GuestMenu } from "./guest-menu";
import { UserMenu } from "./user-menu";

/**
 * Public Header Component
 * Task: T033 [US4] - Integrated RoleBasedNav for role-based navigation
 *
 * Server Component that renders the header with:
 * - Logo/brand
 * - Role-based navigation menu
 * - Shopping cart indicator
 * - User menu (authenticated) or guest menu
 *
 * Note: Uses getServerSession() helper which properly handles
 * Next.js 16 caching and revalidation after logout/login
 */
export default async function Header() {
	const session = await getServerSession();

	return (
		<header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto max-w-7xl">
				<div className="flex h-16 items-center justify-between px-4 md:px-6">
					{/* Logo y Navegación Principal */}
					<div className="flex items-center gap-8">
						<Link className="flex items-center" href="/catalog">
							<span className="font-bold text-xl tracking-tight">GLASIFY</span>
						</Link>
						{/* Role-Based Navigation: Shows appropriate links based on user role */}
						<RoleBasedNav className="hidden md:flex" />
					</div>

					{/* Acciones: Carrito y Menú de Usuario */}
					<div className="flex items-center gap-3">
						<CartIndicator variant="compact" />
						{session?.user ? (
							<UserMenu
								userEmail={session.user.email}
								userName={session.user.name}
							/>
						) : (
							<GuestMenu />
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
