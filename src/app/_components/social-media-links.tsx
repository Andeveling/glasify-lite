import { Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { db } from "@/server/db";

type SocialMediaLinksProps = {
  /**
   * Visual variant
   * - "default": Normal size (24px icons)
   * - "compact": Smaller size (20px icons)
   */
  variant?: "default" | "compact";

  /**
   * Optional className for container
   */
  className?: string;
};

/**
 * SocialMediaLinks Component
 *
 * Server Component that renders social media links from TenantConfig.
 * Only renders if URLs are configured (non-empty).
 *
 * Supported platforms:
 * - Facebook (facebookUrl)
 * - Instagram (instagramUrl)
 * - LinkedIn (linkedinUrl)
 *
 * @example
 * // In header
 * <SocialMediaLinks variant="compact" />
 *
 * @example
 * // In footer
 * <SocialMediaLinks variant="default" />
 */
export async function SocialMediaLinks({
  variant = "default",
  className,
}: SocialMediaLinksProps) {
  // Fetch tenant config (cached by Prisma)
  const tenantConfig = await db.tenantConfig.findUnique({
    where: { id: "1" },
    select: {
      facebookUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
    },
  });

  // No config found or all URLs empty
  const hasAnySocialUrl =
    tenantConfig?.facebookUrl ||
    tenantConfig?.instagramUrl ||
    tenantConfig?.linkedinUrl;

  if (!hasAnySocialUrl) {
    return null;
  }

  const ICON_SIZE_DEFAULT = 24;
  const ICON_SIZE_COMPACT = 20;
  const iconSize =
    variant === "compact" ? ICON_SIZE_COMPACT : ICON_SIZE_DEFAULT;
  const iconClass = cn(
    "transition-colors",
    variant === "compact" ? "h-5 w-5" : "h-6 w-6"
  );

  return (
    <div
      className={cn("flex items-center gap-4", className)}
      data-testid="social-media-links"
    >
      {tenantConfig.facebookUrl && (
        <Link
          aria-label="Facebook"
          className="text-muted-foreground transition-colors hover:text-foreground"
          href={tenantConfig.facebookUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Facebook className={iconClass} size={iconSize} />
        </Link>
      )}

      {tenantConfig.instagramUrl && (
        <Link
          aria-label="Instagram"
          className="text-muted-foreground transition-colors hover:text-foreground"
          href={tenantConfig.instagramUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Instagram className={iconClass} size={iconSize} />
        </Link>
      )}

      {tenantConfig.linkedinUrl && (
        <Link
          aria-label="LinkedIn"
          className="text-muted-foreground transition-colors hover:text-foreground"
          href={tenantConfig.linkedinUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Linkedin className={iconClass} size={iconSize} />
        </Link>
      )}
    </div>
  );
}
