/**
 * CartSummary Component
 *
 * Displays cart totals and "Generate Quote" call-to-action button.
 * Shows breakdown of total items, subtotal, and quote generation CTA.
 *
 * Features:
 * - Item count display
 * - Total price display
 * - Prominent "Generate Quote" CTA button (opens drawer)
 * - Empty cart detection
 * - Loading/disabled states
 * - Authentication check before quote generation
 * - Real-time session verification (no stale cache)
 *
 * @module app/(public)/cart/_components/cart-summary
 */

"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { SignInModal } from "@/components/signin-modal";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTenantConfig } from "@/providers/tenant-config-provider";
import type { CartSummary as CartSummaryType } from "@/types/cart.types";
import { QuoteGenerationDrawer } from "./quote-generation-drawer";

// ============================================================================
// Types
// ============================================================================

export type CartSummaryProps = {
	/** Cart summary data */
	summary: CartSummaryType;

	/** Whether quote generation is in progress */
	isGenerating?: boolean;

	/** Custom CSS class */
	className?: string;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Cart summary component with totals and CTA
 *
 * @example
 * ```tsx
 * <CartSummary
 *   summary={{ itemCount: 5, total: 75000, currency: 'MXN', isEmpty: false }}
 * />
 * ```
 */
export function CartSummary({
	summary,
	isGenerating = false,
	className,
}: CartSummaryProps) {
	const tenantConfig = useTenantConfig();
	const [showSignInModal, setShowSignInModal] = useState(false);

	// ✅ Better Auth session hook with real-time updates
	const { data: session, isPending: isSessionLoading, error } = useSession();

	// ✅ Track authentication state - force re-check on session changes
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// ✅ Effect: Update auth state when session changes (handles logout/login)
	useEffect(() => {
		// Session is valid if user exists and no error
		const hasValidSession = !!session?.user && !error;
		setIsAuthenticated(hasValidSession);
	}, [session, error]);

	/**
	 * Handle "Generate Quote" button click
	 *
	 * Verifies authentication in real-time before proceeding
	 * Opens sign-in modal if unauthenticated
	 * Prevents event propagation to stop drawer from opening
	 */
	const handleGenerateQuote = (event: React.MouseEvent<HTMLButtonElement>) => {
		// ✅ Real-time authentication check (not cached)
		const hasValidSession = !!session?.user && !error;

		if (!hasValidSession) {
			// Prevent drawer from opening
			event.preventDefault();
			event.stopPropagation();

			// Open sign-in modal for unauthenticated users
			setShowSignInModal(true);
			return;
		}

		// User is authenticated - drawer will open normally via trigger
	};

	return (
		<>
			<Card className={cn("sticky top-4", className)}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShoppingCart className="size-5" />
						Resumen de presupuesto
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Item count */}
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Artículos en carrito</span>
						<span className="font-medium">{summary.itemCount}</span>
					</div>

					{/* Divider */}
					<div className="h-px bg-border" />

					{/* Total */}
					<div className="flex items-center justify-between">
						<span className="font-medium text-base">Total</span>
						<div className="text-right">
							<p className="font-bold text-2xl">
								{formatCurrency(summary.total, { context: tenantConfig })}
							</p>
							<p className="text-muted-foreground text-xs">IVA incluido</p>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex-col gap-2">
					{/* Unified button UI with auth check on click */}
					<QuoteGenerationDrawer
						trigger={
							<Button
								className="w-full"
								disabled={summary.isEmpty || isGenerating || isSessionLoading}
								onClick={handleGenerateQuote}
								size="lg"
								type="button"
							>
								{isGenerating ? "Generando..." : "Generar cotización"}
							</Button>
						}
					/>

					{/* Auth hint for unauthenticated users */}
					{isAuthenticated || summary.isEmpty ? null : (
						<p className="text-center text-muted-foreground text-xs">
							Se requiere autenticación para generar cotizaciones
						</p>
					)}
				</CardFooter>

				{/* Empty cart helper text */}
				{summary.isEmpty && (
					<div className="px-6 pb-4">
						<p className="text-center text-muted-foreground text-sm">
							Agrega artículos al carrito para generar una cotización
						</p>
					</div>
				)}
			</Card>

			{/* Sign-in modal for unauthenticated users */}
			<SignInModal
				callbackUrl="/cart"
				onOpenChangeAction={setShowSignInModal}
				open={showSignInModal}
			/>
		</>
	);
}
