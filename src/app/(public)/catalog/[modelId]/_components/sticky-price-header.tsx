"use client";

import { motion, type Variants } from "framer-motion";
import { Gem, Package, Ruler } from "lucide-react";
import Image from "next/image";
import { useTenantConfig } from "@/app/_hooks/use-tenant-config";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriceBreakdownPopover } from "@/components/ui/price-breakdown-popover";
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
  modelImageUrl?: string;
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
  withBreakdown?: boolean;
};

export function StickyPriceHeader({
  basePrice,
  breakdown,
  className,
  configSummary,
  currency,
  currentPrice,
  withBreakdown = false,
}: StickyPriceHeaderProps) {
  const { formatContext } = useTenantConfig();
  const discount = basePrice - currentPrice;
  const hasDiscount = discount > 0;
  const showGlass = Boolean(configSummary.glassTypeName);

  // Format dimensions
  const hasDimensions = configSummary.widthMm && configSummary.heightMm;
  const dimensionsText = hasDimensions
    ? `${configSummary.widthMm} × ${configSummary.heightMm} mm`
    : "Sin dimensiones";

  return (
    <motion.div
      animate="visible"
      className="sticky top-18 z-10"
      initial="hidden"
      variants={containerVariants}
    >
      <Card
        className={cn(
          "sticky top-16 z-10 mt-0 border-b bg-background px-4 pt-0 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6",
          className
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Top section: Model Image - 4:3 aspect ratio */}
          {configSummary.modelImageUrl && (
            <motion.div
              className="relative aspect-[4/3] w-full overflow-hidden"
              variants={badgeVariants}
            >
              <Image
                alt={configSummary.modelName}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                src={configSummary.modelImageUrl || "/placeholder.svg"}
              />
            </motion.div>
          )}

          {/* Middle section: Name full-width, then dimensions + price distributed */}
          <div className="flex flex-col gap-3">
            {/* Name: takes full width */}
            <motion.div
              className="flex items-center gap-2"
              variants={badgeVariants}
            >
              <motion.div
                animate="rest"
                initial="rest"
                variants={iconHoverVariants}
                whileHover="hover"
              >
                <Package className="size-5 shrink-0 text-muted-foreground" />
              </motion.div>
              <h3 className="truncate font-semibold text-lg leading-none md:text-xl">
                {configSummary.modelName}
              </h3>
            </motion.div>

            {/* Details row: dimensions (left) + price (right) */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              {/* Dimensions */}
              {hasDimensions && (
                <motion.div
                  className="flex items-center gap-1.5 text-muted-foreground"
                  variants={badgeVariants}
                >
                  <Ruler className="size-5 shrink-0" />
                  <span className="text-lg">{dimensionsText}</span>
                </motion.div>
              )}

              {/* Price display */}
              <motion.div
                className="flex flex-col items-start gap-1 sm:items-end"
                variants={badgeVariants}
              >
                <p className="text-muted-foreground text-xs">
                  Precio configurado
                </p>
                <div className="flex items-center gap-2">
                  <motion.p
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-bold text-2xl leading-none md:text-3xl"
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    key={currentPrice}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {formatCurrency(currentPrice, { context: formatContext })}
                  </motion.p>

                  {/* Breakdown popover */}
                  {withBreakdown && (
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
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom row: Glass type + Solution + Discount badges */}
          <div className="flex w-full flex-wrap items-center gap-2 sm:flex-nowrap">
            {/* Glass type */}
            {configSummary.glassTypeName && (
              <motion.div
                className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1.5 dark:bg-purple-950/30"
                variants={badgeVariants}
              >
                <motion.div
                  animate="rest"
                  initial="rest"
                  variants={iconHoverVariants}
                  whileHover="hover"
                >
                  <Gem className="size-4 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <span className="font-medium text-purple-700 text-sm dark:text-purple-300">
                  {configSummary.glassTypeName}
                </span>
                {configSummary.solutionName && (
                  <Badge className="ml-1 h-5 px-1.5 text-xs" variant="outline">
                    {configSummary.solutionName}
                  </Badge>
                )}
              </motion.div>
            )}

            {/* Discount badge with pulse animation */}
            {hasDiscount && (
              <motion.div
                animate={["visible", "pulse"]}
                className={cn(showGlass && "sm:ml-auto")}
                initial="hidden"
                variants={discountVariants}
              >
                <Badge
                  className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
                  variant="outline"
                >
                  Ahorro: {formatCurrency(discount, { context: formatContext })}
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
            `, Cristal ${configSummary.glassTypeName}`}
        </div>
      </Card>
    </motion.div>
  );
}
