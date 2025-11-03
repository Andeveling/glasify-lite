"use client";

import { FileText, Loader2, LogOut, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";

type UserMenuProps = {
	userName?: string | null;
	userEmail?: string | null;
};

export function UserMenu({
	userName: initialUserName,
	userEmail: initialUserEmail,
}: UserMenuProps) {
	const { theme, setTheme } = useTheme();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [isPending, startTransition] = useTransition();

	// Use Better Auth session hook for reactive updates
	const { data: session } = useSession();

	// Prefer session data over initial props for reactivity
	const userName = session?.user?.name ?? initialUserName;
	const userEmail = session?.user?.email ?? initialUserEmail;

	/**
	 * Handle user sign out using Better Auth client
	 *
	 * Uses authClient.signOut() which:
	 * - Invalidates session cookie
	 * - Clears Better Auth cache automatically (cookie-cache)
	 * - Triggers useSession() to refetch
	 *
	 * FIXME: Using window.location.href instead of router.push() as a temporary solution
	 * because router.refresh() + useSession() are not updating the UI consistently after logout.
	 * This forces a full page reload to ensure Header component shows GuestMenu.
	 *
	 * Ideal solution would be: authClient.signOut() → useSession() updates → router.refresh()
	 * but there seems to be a race condition or cache issue preventing immediate UI update.
	 */
	const onSignOut = async () => {
		setIsSigningOut(true);
		startTransition(async () => {
			try {
				// Better Auth client handles cookie invalidation
				await authClient.signOut();

				// FIXME: Hard reload to force UI update
				// Using window.location instead of Next.js navigation
				// to guarantee Header re-renders with fresh session state
				window.location.href = "/catalog";
			} catch (error) {
				console.error("Sign out error:", error);
				// Even on error, force reload to clear any stale state
				window.location.href = "/catalog";
			}
		});
	};

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const isLoading = isSigningOut || isPending;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Menú de usuario"
					disabled={isLoading}
					size="icon"
					variant="outline"
				>
					{isLoading ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<User className="h-5 w-5" />
					)}
					<span className="sr-only">Menú de usuario</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">
							{userName ?? "Usuario"}
						</p>
						{userEmail && (
							<p className="text-muted-foreground text-xs leading-none">
								{userEmail}
							</p>
						)}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild disabled={isLoading}>
					<Link className="w-full cursor-pointer" href="/my-quotes">
						<FileText className="mr-2 h-4 w-4" />
						<span>Mis Cotizaciones</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled={isLoading} onClick={toggleTheme}>
					{theme === "dark" ? (
						<Sun className="mr-2 h-4 w-4" />
					) : (
						<Moon className="mr-2 h-4 w-4" />
					)}
					<span>Cambiar a {theme === "dark" ? "Claro" : "Oscuro"}</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled={isLoading} onClick={onSignOut}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							<span>Cerrando sesión...</span>
						</>
					) : (
						<>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Cerrar Sesión</span>
						</>
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
