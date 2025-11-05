/**
 * Cart Indicator Wrapper Component
 *
 * Client Component wrapper for CartIndicator to prevent hydration mismatch.
 * Uses dynamic import to disable SSR since CartIndicator depends on sessionStorage.
 *
 * @module app/_components/cart-indicator-wrapper
 */

"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to prevent hydration mismatch
// CartIndicator uses sessionStorage which is not available during SSR
const CartIndicator = dynamic(
	() =>
		import("./cart-indicator").then((mod) => ({
			default: mod.CartIndicator,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
		),
	},
);

type CartIndicatorWrapperProps = {
	/** Display variant */
	variant?: "default" | "compact";
	/** Optional className for styling */
	className?: string;
};

/**
 * Wrapper component that handles dynamic import of CartIndicator
 * Must be a Client Component to use dynamic() with ssr: false
 */
export function CartIndicatorWrapper({
	variant = "default",
	className,
}: CartIndicatorWrapperProps) {
	return <CartIndicator className={className} variant={variant} />;
}
