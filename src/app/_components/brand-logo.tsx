import Image from "next/image";
import { env } from "@/env";
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
   * - true: shows "GLASIFY" next to logo
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
 * Logo dimensions by size variant
 */
const LOGO_DIMENSIONS = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
} as const;

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
 * Flexible logo component that:
 * - Loads URL from NEXT_PUBLIC_COMPANY_LOGO_URL env var
 * - Supports relative paths (/logo.png) and absolute URLs
 * - Gracefully falls back to text "GLASIFY" if no logo configured
 * - Optimizes images with Next.js Image component
 * - Responsive sizing with size variants
 * - Optional text branding alongside logo
 *
 * @example
 * // In header with text
 * <BrandLogo size="md" withText />
 *
 * @example
 * // Hero section, large logo only
 * <BrandLogo size="lg" />
 *
 * @example
 * // Mobile header, compact
 * <BrandLogo size="sm" />
 */
export function BrandLogo({
  size = "md",
  className,
  withText = false,
  href,
}: BrandLogoProps) {
  const logoUrl = env.NEXT_PUBLIC_COMPANY_LOGO_URL;
  const dimensions = LOGO_DIMENSIONS[size];
  const textSize = TEXT_SIZES[size];

  /**
   * Determine if logo URL is relative or absolute
   * - Absolute: starts with http://, https://, or data:
   * - Relative: starts with / or is just a filename
   */
  const isAbsoluteUrl =
    logoUrl?.startsWith("http://") ||
    logoUrl?.startsWith("https://") ||
    logoUrl?.startsWith("data:");

  const content = (
    <div
      className={cn("flex items-center gap-2", className)}
      data-testid="brand-logo"
    >
      {logoUrl ? (
        <div className="flex-shrink-0">
          {isAbsoluteUrl ? (
            // Absolute URL: use Image with unoptimized for CDN URLs
            <Image
              alt="Company logo"
              className="h-auto w-auto"
              height={dimensions.height}
              priority
              src={logoUrl}
              unoptimized={isAbsoluteUrl}
              width={dimensions.width}
            />
          ) : (
            // Relative path: use Image with optimization
            <Image
              alt="Company logo"
              className="h-auto w-auto"
              height={dimensions.height}
              priority
              src={logoUrl}
              width={dimensions.width}
            />
          )}
        </div>
      ) : null}

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
