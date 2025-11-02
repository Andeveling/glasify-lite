/**
 * EmptyCartState Component
 *
 * Displays friendly empty state when cart has no items.
 * Provides clear messaging and navigation to catalog.
 *
 * Features:
 * - Friendly empty state icon and message
 * - Clear call-to-action to browse catalog
 * - Responsive design
 * - Accessible navigation
 *
 * @module app/(public)/cart/_components/empty-cart-state
 */

"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

// ============================================================================
// Types
// ============================================================================

export type EmptyCartStateProps = {
	/** Optional custom message */
	message?: string;

	/** Optional CTA text */
	ctaText?: string;

	/** Optional catalog URL */
	catalogUrl?: string;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Empty cart state component
 *
 * @example
 * ```tsx
 * <EmptyCartState />
 * ```
 */
export function EmptyCartState({
	message = "Tu carrito está vacío",
	ctaText = "Explorar catálogo",
	catalogUrl = "/catalog",
}: EmptyCartStateProps) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia>
					<ShoppingCart className="size-10 text-muted-foreground" />
				</EmptyMedia>
				<EmptyTitle className="font-bold text-2xl">{message}</EmptyTitle>
				<EmptyDescription>
					Agrega configuraciones de ventanas desde el catálogo
					<br />
					para comenzar a construir tu presupuesto
				</EmptyDescription>
			</EmptyHeader>
			<Button asChild size="lg">
				<Link href={catalogUrl}>{ctaText}</Link>
			</Button>
		</Empty>
	);
}
