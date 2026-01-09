import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /**
   * Size variant for the logo
   * - "sm": 32px (mobile header, compact spaces)
   * - "md": 40px (standard header, navigation)
   * - "lg": 64px (hero, landing pages)
   * - "xl": 96px (large displays, full-width hero)
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Optional className for additional styling
   */
  className?: string;

  /**
   * Whether to display text alongside the logo
   * - true: shows "Vitro Rojas" next to logo
   * - false: logo only
   */
  withText?: boolean;

  /**
   * Whether the logo should display as a link
   * - true: wraps in div (no-op for now)
   * - false: just the image
   */
  href?: string;
};

/**
 * Text size classes aligned with logo size
 */
const TEXT_SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

/**
 * BrandLogo Component
 *
 * Displays "Vitro Rojas" brand text with optional sizing.
 * Simplified component without logo image support.
 *
 * @example
 * // In header with text
 * <BrandLogo size="md" withText />
 *
 * @example
 * // Hero section, large logo only
 * <BrandLogo size="lg" withText />
 *
 * @example
 * // Mobile header, compact
 * <BrandLogo size="sm" withText />
 */
export function BrandLogo({
  size = "md",
  className,
  withText = false,
  href,
}: BrandLogoProps) {
  const textSize = TEXT_SIZES[size];

  const content = (
    <div
      className={cn("flex items-center gap-2", className)}
      data-testid="brand-logo"
    >
      {withText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            textSize,
            // Hide text on very small screens if size is sm
            size === "sm" && "hidden sm:inline"
          )}
        >
          Vitro Rojas
        </span>
      )}
    </div>
  );

  // If href provided, wrap in link (future enhancement)
  if (href) {
    return content;
  }

  return content;
}

/**
 * BrandLogoSmall - Convenience wrapper for header logo
 * @example
 * <BrandLogoSmall />
 */
export function BrandLogoSmall(props: Omit<BrandLogoProps, "size">) {
  return <BrandLogo size="md" {...props} />;
}

/**
 * BrandLogoLarge - Convenience wrapper for hero/landing logo
 * @example
 * <BrandLogoLarge withText />
 */
export function BrandLogoLarge(props: Omit<BrandLogoProps, "size">) {
  return <BrandLogo size="lg" {...props} />;
}
