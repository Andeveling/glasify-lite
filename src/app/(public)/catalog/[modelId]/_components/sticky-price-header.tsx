'use client';

import { motion } from 'framer-motion';
import { Gem, Package, Ruler } from 'lucide-react';
import { useTenantConfig } from '@/app/_hooks/use-tenant-config';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PriceBreakdownPopover } from '@/components/ui/price-breakdown-popover';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type PriceBreakdownCategory = 'model' | 'glass' | 'service' | 'adjustment';

type PriceBreakdownItem = {
  amount: number;
  category: PriceBreakdownCategory;
  label: string;
};

type ConfigSummary = {
  glassTypeName?: string;
  heightMm?: number;
  modelName: string;
  solutionName?: string;
  widthMm?: number;
};

type StickyPriceHeaderProps = {
  basePrice: number;
  breakdown: PriceBreakdownItem[];
  className?: string;
  configSummary: ConfigSummary;
  currency?: string;
  currentPrice: number;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Sticky Price Header Component (Molecule)
 *
 * Displays real-time calculated price with configuration summary, using sticky
 * positioning to ensure critical information is always visible during scroll.
 *
 * ## Features
 * - **Sticky positioning**: Stays at top (z-10) during scroll
 * - **Configuration summary**: Model name, dimensions, glass type always visible
 * - **Backdrop blur**: Glass morphism effect for better readability
 * - **Price animation**: Smooth scale/fade effect when price updates
 * - **Breakdown popover**: Itemized price details on demand
 * - **Discount badge**: Shows savings when current price < base price
 * - **Responsive**:
 *   - Mobile (<768px): Price only, summary hidden
 *   - Tablet (768px-1024px): Price + compact summary
 *   - Desktop (>1024px): Full layout with all details
 * - **Accessibility**: ARIA labels, keyboard navigation, screen reader announcements
 *
 * ## Don't Make Me Think Compliance
 * - ✅ No hidden information: User always knows WHAT they're configuring
 * - ✅ Reduces cognitive load: No need to scroll up to remember configuration
 * - ✅ Visual hierarchy: Price (primary) + Config summary (secondary)
 * - ✅ Progressive disclosure: Details in popover, essentials always visible
 *
 */
export function StickyPriceHeader({
  basePrice,
  breakdown,
  className,
  configSummary,
  currency,
  currentPrice,
}: StickyPriceHeaderProps) {
  const { formatContext } = useTenantConfig();
  const discount = basePrice - currentPrice;
  const hasDiscount = discount > 0;

  // Format dimensions
  const hasDimensions = configSummary.widthMm && configSummary.heightMm;
  const dimensionsText = hasDimensions ? `${configSummary.widthMm} × ${configSummary.heightMm} mm` : 'Sin dimensiones';

  return (
    <Card
      className={cn(
        'sticky top-16 z-10 border-b bg-background px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 md:py-4',
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-center lg:justify-between">
        {/* Right: Price display with animation (now on the right) */}
        <div className="flex items-baseline gap-2 lg:min-w-[220px] lg:justify-end">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs md:text-sm">Precio configurado</p>
            <motion.p
              animate={{ opacity: 1, scale: 1 }}
              className="font-bold text-2xl md:text-3xl"
              initial={{ opacity: 0.8, scale: 0.98 }}
              key={currentPrice} // Re-animate when price changes
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {formatCurrency(currentPrice, { context: formatContext })}
            </motion.p>
          </div>

          {/* Breakdown popover */}
          <PriceBreakdownPopover breakdown={breakdown} currency={currency} totalAmount={currentPrice} />
        </div>

        {/* Left: Configuration Summary - Don't Make Me Think (now on the left) */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Model name */}
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-xs md:text-sm">{configSummary.modelName}</span>
          </div>

          {/* Dimensions */}
          {hasDimensions && (
            <>
              <Separator className="hidden h-4 md:block" orientation="vertical" />
              <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-xs md:text-sm">{dimensionsText}</span>
              </div>
            </>
          )}

          {/* Glass type */}
          {configSummary.glassTypeName && (
            <>
              <Separator className="hidden h-4 md:block" orientation="vertical" />
              <div className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1 dark:bg-purple-950/30">
                <Gem className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-700 text-xs md:text-sm dark:text-purple-300">
                  {configSummary.glassTypeName}
                </span>
              </div>
            </>
          )}

          {/* Solution badge (if available) */}
          {configSummary.solutionName && (
            <Badge className="hidden md:inline-flex" variant="secondary">
              {configSummary.solutionName}
            </Badge>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <Badge
              className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
              variant="outline"
            >
              -{formatCurrency(discount, { context: formatContext })}
            </Badge>
          )}
        </div>
      </div>

      {/* Screen reader announcement for price changes */}
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        Precio actualizado: {formatCurrency(currentPrice, { context: formatContext })} para {configSummary.modelName}
        {hasDimensions && `, dimensiones ${dimensionsText}`}
        {configSummary.glassTypeName && `, cristal ${configSummary.glassTypeName}`}
      </div>
    </Card>
  );
}
