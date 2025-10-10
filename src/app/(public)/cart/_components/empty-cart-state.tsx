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

'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  message = 'Tu carrito está vacío',
  ctaText = 'Explorar catálogo',
  catalogUrl = '/catalog',
}: EmptyCartStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-6 py-12">
        {/* Icon */}
        <div className="rounded-full bg-muted p-6">
          <ShoppingCart className="size-12 text-muted-foreground" />
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="font-semibold text-xl">{message}</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Agrega configuraciones de ventanas desde el catálogo
            <br />
            para comenzar a construir tu presupuesto
          </p>
        </div>

        {/* CTA */}
        <Button asChild size="lg">
          <Link href={catalogUrl}>{ctaText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
