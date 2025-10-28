/**
 * Cart Indicator Component
 *
 * Displays cart item count badge in navbar with link to cart page.
 * Updates in real-time when cart changes via useCart hook.
 *
 * @module app/_components/cart-indicator
 */

"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/(public)/cart/_hooks/use-cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Constants
// ============================================================================

const MAX_BADGE_COUNT = 99;

// ============================================================================
// Types
// ============================================================================

type CartIndicatorProps = {
  /** Optional className for styling */
  className?: string;

  /** Display variant */
  variant?: "default" | "compact";
};

// ============================================================================
// Component
// ============================================================================

export function CartIndicator({
  className,
  variant = "default",
}: CartIndicatorProps) {
  const { summary } = useCart();
  const { itemCount } = summary;

  const isCompact = variant === "compact";
  const hasItems = itemCount > 0;

  return (
    <Button
      asChild
      className={cn("relative", className)}
      size={isCompact ? "icon" : "default"}
      variant="ghost"
    >
      <Link href="/cart">
        <ShoppingCart className={cn("h-5 w-5", { "mr-2": !isCompact })} />

        {!isCompact && <span>Carrito</span>}

        {/* Badge with item count */}
        {hasItems && (
          <output
            className={cn(
              "-right-1 -top-1 absolute flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-bold text-primary-foreground text-xs",
              {
                "animate-pulse": itemCount > 0, // Pulse animation when items added
              }
            )}
            title={`${itemCount} ${itemCount === 1 ? "item" : "items"} en el carrito`}
          >
            {itemCount > MAX_BADGE_COUNT ? "99+" : itemCount}
          </output>
        )}
      </Link>
    </Button>
  );
}
