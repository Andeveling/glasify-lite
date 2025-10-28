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
 *
 * @module app/(public)/cart/_components/cart-summary
 */

"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/app/_utils/format-currency.util";
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
import { cn } from "@/lib/utils";
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
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { data: session, isPending: isLoading } = useSession();
  const isAuthenticated = !!session?.user;

  /**
   * Handle "Generate Quote" button click
   *
   * Opens sign-in modal if unauthenticated
   */
  const handleGenerateQuote = () => {
    // Check authentication before proceeding
    if (!isAuthenticated) {
      // Open sign-in modal instead of redirecting
      setShowSignInModal(true);
      return;
    }
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
                {formatCurrency(summary.total, {
                  currency: summary.currency,
                  decimals: summary.currency === "USD" ? 2 : 0,
                  locale: summary.currency === "USD" ? "es-PA" : "es-CO",
                })}
              </p>
              <p className="text-muted-foreground text-xs">IVA incluido</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {isAuthenticated ? (
            /* Authenticated: Show drawer trigger */
            <QuoteGenerationDrawer
              trigger={
                <Button
                  className="w-full"
                  disabled={summary.isEmpty || isGenerating || isLoading}
                  size="lg"
                  type="button"
                >
                  {isGenerating ? "Generando..." : "Generar cotización"}
                </Button>
              }
            />
          ) : (
            /* Unauthenticated: Show button that opens sign-in modal */
            <Button
              className="w-full"
              disabled={summary.isEmpty || isGenerating || isLoading}
              onClick={handleGenerateQuote}
              size="lg"
              type="button"
            >
              {isGenerating ? "Generando..." : "Generar cotización"}
            </Button>
          )}

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
