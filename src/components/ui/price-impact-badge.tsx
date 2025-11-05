"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTenantConfig } from "@/app/_hooks/use-tenant-config";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type PriceImpactBadgeProps = {
  basePrice: number;
  className?: string;
  currency?: string;
  priceModifier: number; // Positive = surcharge, Negative = discount
};

// ============================================================================
// Component
// ============================================================================

/**
 * Price Impact Badge Component (Atom)
 *
 * Displays price differential (+$X / -$X) with semantic color coding.
 * Green for discounts, red for surcharges, neutral for no change.
 *
 * ## Features
 * - **Color coding**: Green (discount), Red (surcharge), Muted (no change)
 * - **Icon indicators**: Arrow down (discount), Arrow up (surcharge)
 * - **Absolute or percentage**: Shows raw amount with sign
 * - **Accessibility**: ARIA labels for screen readers
 *
 * ## Theme Integration
 * Uses CSS variables from globals.css:
 * - `--success`: Discount/savings (green)
 * - `--destructive`: Surcharge/cost (red)
 * - `--muted`: No impact (gray)
 *
 * @example
 * ```tsx
 * <PriceImpactBadge
 *   basePrice={650000}
 *   priceModifier={120000}
 *   currency="$"
 * />
 * // Displays: "↑ +$120.000" in red
 * ```
 */
export function PriceImpactBadge({
  basePrice,
  className,
  currency = "$",
  priceModifier,
}: PriceImpactBadgeProps) {
  const { formatContext } = useTenantConfig();

  const isDiscount = priceModifier < 0;
  const isSurcharge = priceModifier > 0;
  const isNeutral = priceModifier === 0;

  const absoluteAmount = Math.abs(priceModifier);
  const sign = isSurcharge ? "+" : "";
  const Icon = isDiscount ? ArrowDown : isSurcharge ? ArrowUp : null;

  // Color classes based on impact
  const colorClass = isDiscount
    ? "bg-success/10 text-success border-success/20"
    : isSurcharge
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : "bg-muted text-muted-foreground border-muted";

  // Don't render if neutral
  if (isNeutral) {
    return (
      <Badge
        className={cn("gap-1 text-xs", colorClass, className)}
        variant="outline"
      >
        Base
      </Badge>
    );
  }

  return (
    <Badge
      aria-label={
        isDiscount
          ? `Descuento de ${currency}${formatCurrency(absoluteAmount, { context: formatContext })}`
          : `Recargo de ${currency}${formatCurrency(absoluteAmount, { context: formatContext })}`
      }
      className={cn(
        "gap-1 font-medium text-xs tabular-nums",
        colorClass,
        className
      )}
      variant="outline"
    >
      {Icon && <Icon aria-hidden="true" className="h-3 w-3" />}
      <span>
        {sign}
        {formatCurrency(absoluteAmount, { context: formatContext })}
      </span>
    </Badge>
  );
}
