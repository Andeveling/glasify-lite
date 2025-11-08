import type { QuoteStatus } from "@/lib/types/prisma-types";
import { Clock, Send, X } from "lucide-react";

/**
 * Configuration for quote status badges
 * Maps each status to Spanish label, variant, and icon
 */
export const QUOTE_STATUS_CONFIG = {
  draft: {
    label: "Borrador",
    variant: "secondary" as const,
    icon: Clock,
  },
  sent: {
    label: "Enviada",
    variant: "default" as const,
    icon: Send,
  },
  canceled: {
    label: "Cancelada",
    variant: "outline" as const,
    icon: X,
  },
} satisfies Record<
  QuoteStatus,
  { label: string; variant: string; icon: typeof Clock }
>;

/**
 * Role badge configuration
 * Only show badges for admin and seller roles
 */
export const ROLE_BADGE_CONFIG = {
  admin: {
    label: "Admin",
    variant: "destructive" as const,
  },
  seller: {
    label: "Vendedor",
    variant: "default" as const,
  },
  user: {
    label: null, // Don't show badge for regular users
    variant: null,
  },
} as const;
