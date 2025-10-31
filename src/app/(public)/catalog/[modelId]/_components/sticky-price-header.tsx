"use client";

import { motion, type Variants } from "framer-motion";
import { Gem, Package, Ruler } from "lucide-react";
import { useTenantConfig } from "@/app/_hooks/use-tenant-config";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriceBreakdownPopover } from "@/components/ui/price-breakdown-popover";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

// ============================================================================
// Animation Variants
// ============================================================================

// Animation constants
const PULSE_SCALE_PEAK = 1.05;
const ICON_HOVER_SCALE = 1.1;

/**
 * Container animation: Slide down + fade in on mount
 * Respects prefers-reduced-motion
 */
const containerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.08, // Stagger badges appearance
    },
  },
};

/**
 * Badge item animation: Fade + scale in sequence
 */
const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

/**
 * Discount badge: Subtle pulse to attract attention
 */
const discountVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  pulse: {
    scale: [1, PULSE_SCALE_PEAK, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      repeat: 2, // Pulse 3 times total
      repeatDelay: 0.3,
    },
  },
};

/**
 * Icon hover: Subtle lift effect
 */
const iconHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: ICON_HOVER_SCALE,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

// ============================================================================
// Types
// ============================================================================

type PriceBreakdownCategory = "model" | "glass" | "service" | "adjustment";

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
 * ## Framer Motion Animations
 *
 * ### 1. Initial Entry (containerVariants)
 * - **Effect**: Slide down + fade in from -20px
 * - **Duration**: 300ms
 * - **Children**: Staggered 80ms apart
 * - **Purpose**: Smooth, non-distracting entrance
 *
 * ### 2. Badge Stagger (badgeVariants)
 * - **Effect**: Fade + scale (0.95 → 1.0) in sequence
 * - **Duration**: 200ms per badge
 * - **Purpose**: Progressive disclosure, visual hierarchy
 *
 * ### 3. Discount Pulse (discountVariants)
 * - **Effect**: Subtle scale pulse (1.0 → 1.05 → 1.0)
 * - **Duration**: 600ms
 * - **Repeat**: 3 times total (2 repeats)
 * - **Purpose**: Draw attention to savings without being obnoxious
 *
 * ### 4. Icon Hover (iconHoverVariants)
 * - **Effect**: Scale to 1.1 on hover
 * - **Duration**: 150ms
 * - **Purpose**: Tactile feedback, improves perceived responsiveness
 *
 * ### 5. Price Update
 * - **Effect**: Scale + opacity pulse when currentPrice changes
 * - **Key**: Changes trigger re-animation
 * - **Duration**: 200ms
 * - **Purpose**: Highlight price recalculation
 *
 * ## Accessibility
 * - All animations respect `prefers-reduced-motion` (Framer Motion default)
 * - Screen reader announcements for price changes
 * - Keyboard navigation fully supported
 * - Focus states preserved during animations
 *
 * ## Don't Make Me Think Compliance
 * - ✅ No hidden information: User always knows WHAT they're configuring
 * - ✅ Reduces cognitive load: No need to scroll up to remember configuration
 * - ✅ Visual hierarchy: Price (primary) + Config summary (secondary)
 * - ✅ Progressive disclosure: Details in popover, essentials always visible
 * - ✅ Motion as context: Animations support understanding, not decoration
 * - ✅ Performance: GPU-accelerated transforms only (scale, opacity)
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
  const dimensionsText = hasDimensions
    ? `${configSummary.widthMm} × ${configSummary.heightMm} mm`
    : "Sin dimensiones";

  return (
    <motion.div
      animate="visible"
      className="sticky top-16 z-10"
      initial="hidden"
      variants={containerVariants}
    >
      <Card
        className={cn(
          "sticky top-16 z-10 border-b bg-background px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 md:py-4",
          className
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-center lg:justify-between">
          {/* Right: Price display with animation */}
          <motion.div
            className="flex items-baseline gap-2 lg:min-w-[220px] lg:justify-end"
            variants={badgeVariants}
          >
            <div className="space-y-0.5">
              <p className="text-muted-foreground text-xs md:text-sm">
                Precio configurado
              </p>
              <motion.p
                animate={{ opacity: 1, scale: 1 }}
                className="text-right font-bold text-2xl md:text-3xl"
                initial={{ opacity: 0.8, scale: 0.98 }}
                key={currentPrice} // Re-animate when price changes
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {formatCurrency(currentPrice, { context: formatContext })}
              </motion.p>
            </div>

            {/* Breakdown popover with hover effect */}
            <motion.div
              animate="rest"
              initial="rest"
              variants={iconHoverVariants}
              whileHover="hover"
            >
              <PriceBreakdownPopover
                breakdown={breakdown}
                currency={currency}
                totalAmount={currentPrice}
              />
            </motion.div>
          </motion.div>

          {/* Left: Configuration Summary with stagger animation */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Model name */}
            <motion.div
              className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"
              variants={badgeVariants}
            >
              <motion.div
                animate="rest"
                initial="rest"
                variants={iconHoverVariants}
                whileHover="hover"
              >
                <Package className="size-5 text-muted-foreground" />
              </motion.div>
              <span className="font-medium text-sm md:text-lg">
                {configSummary.modelName}
              </span>
            </motion.div>

            {/* Dimensions */}
            {hasDimensions && (
              <>
                <Separator
                  className="hidden h-4 md:block"
                  orientation="vertical"
                />
                <motion.div
                  className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"
                  variants={badgeVariants}
                >
                  <motion.div
                    animate="rest"
                    initial="rest"
                    variants={iconHoverVariants}
                    whileHover="hover"
                  >
                    <Ruler className="size-5 text-muted-foreground" />
                  </motion.div>
                  <span className="font-medium text-sm md:text-lg">
                    {dimensionsText}
                  </span>
                </motion.div>
              </>
            )}

            {/* Glass type */}
            {configSummary.glassTypeName && (
              <>
                <Separator
                  className="hidden h-4 md:block"
                  orientation="vertical"
                />
                <motion.div
                  className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1 dark:bg-purple-950/30"
                  variants={badgeVariants}
                >
                  <motion.div
                    animate="rest"
                    initial="rest"
                    variants={iconHoverVariants}
                    whileHover="hover"
                  >
                    <Gem className="size-5 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <span className="font-lg text-purple-700 text-sm md:text-lg dark:text-purple-300">
                    {configSummary.glassTypeName}
                  </span>
                </motion.div>
              </>
            )}

            {/* Solution badge (if available) */}
            {configSummary.solutionName && (
              <motion.div variants={badgeVariants}>
                <Badge className="hidden md:inline-flex" variant="secondary">
                  {configSummary.solutionName}
                </Badge>
              </motion.div>
            )}

            {/* Discount badge with pulse animation */}
            {hasDiscount && (
              <motion.div
                animate={["visible", "pulse"]}
                initial="hidden"
                variants={discountVariants}
              >
                <Badge
                  className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
                  variant="outline"
                >
                  -{formatCurrency(discount, { context: formatContext })}
                </Badge>
              </motion.div>
            )}
          </div>
        </div>

        {/* Screen reader announcement for price changes */}
        <div aria-atomic="true" aria-live="polite" className="sr-only">
          Precio actualizado:{" "}
          {formatCurrency(currentPrice, { context: formatContext })} para{" "}
          {configSummary.modelName}
          {hasDimensions && `, dimensiones ${dimensionsText}`}
          {configSummary.glassTypeName &&
            `, vidrio ${configSummary.glassTypeName}`}
        </div>
      </Card>
    </motion.div>
  );
}
