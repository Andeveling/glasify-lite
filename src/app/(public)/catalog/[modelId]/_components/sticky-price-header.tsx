'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { PriceBreakdownPopover } from '@/components/ui/price-breakdown-popover';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/export/pdf/pdf-utils';

// ============================================================================
// Types
// ============================================================================

type PriceBreakdownItem = {
  amount: number;
  label: string;
};

type StickyPriceHeaderProps = {
  basePrice: number;
  breakdown: PriceBreakdownItem[];
  className?: string;
  currency?: string;
  currentPrice: number;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Sticky Price Header Component (Molecule)
 *
 * Displays real-time calculated price with sticky positioning, ensuring price
 * is always visible during scroll. Includes price breakdown popover and
 * discount badge when applicable.
 *
 * ## Features
 * - **Sticky positioning**: Stays at top (z-10) during scroll
 * - **Backdrop blur**: Glass morphism effect for better readability
 * - **Price animation**: Smooth scale/fade effect when price updates
 * - **Breakdown popover**: Itemized price details on demand
 * - **Discount badge**: Shows savings when current price < base price
 * - **Responsive**: Compact layout on mobile (<768px)
 * - **Accessibility**: ARIA labels, keyboard navigation
 *
 * ## Usage
 * ```tsx
 * <StickyPriceHeader
 *   currentPrice={1444983}
 *   basePrice={1500000}
 *   currency="$"
 *   breakdown={[
 *     { label: 'Base del modelo', amount: 650000 },
 *     { label: 'Vidrio Laminado', amount: 120000 }
 *   ]}
 * />
 * ```
 *
 * ## Accessibility
 * - Screen reader announcement on price change
 * - Keyboard accessible popover trigger
 * - Semantic HTML structure
 *
 * @example
 * // In model-form.tsx
 * const { calculatedPrice } = usePriceCalculation({ ... });
 * return (
 *   <>
 *     <StickyPriceHeader currentPrice={calculatedPrice} ... />
 *     <Form>...</Form>
 *   </>
 * );
 */
export function StickyPriceHeader({
  basePrice,
  breakdown,
  className,
  currency = '$',
  currentPrice,
}: StickyPriceHeaderProps) {
  const discount = basePrice - currentPrice;
  const hasDiscount = discount > 0;

  return (
    <div
      className={cn(
        'sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 md:py-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Price display with animation */}
        <div className="flex items-baseline gap-2">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs md:text-sm">Precio configurado</p>
            <motion.p
              animate={{ opacity: 1, scale: 1 }}
              className="font-bold text-2xl md:text-3xl"
              initial={{ opacity: 0.8, scale: 0.98 }}
              key={currentPrice} // Re-animate when price changes
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {formatCurrency(currentPrice, currency)}
            </motion.p>
          </div>

          {/* Breakdown popover */}
          <PriceBreakdownPopover breakdown={breakdown} currency={currency} totalAmount={currentPrice} />
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400" variant="outline">
            -{formatCurrency(discount)}
          </Badge>
        )}
      </div>

      {/* Screen reader announcement for price changes */}
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        Precio actualizado: {formatCurrency(currentPrice)}
      </div>
    </div>
  );
}
