/**
 * QuoteListItem Component (Public User Version)
 *
 * Displays a single quote row in the user's quotes list with status badge,
 * date, total amount, and item count.
 *
 * This version links to the public quote detail page, not the admin dashboard.
 *
 * Updated with QuoteStatusBadge component (US1) for better status clarity
 * with icons, tooltips, and status-specific CTAs.
 *
 * Features loading state with spinner when navigating to detail page.
 */

"use client";

import { Copy, Edit3, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatCurrency } from "@/app/_utils/format-currency.util";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatDate } from "@/lib/utils";
import type { QuoteListItemSchema } from "@/server/api/routers/quote/quote.schemas";
import { getStatusCTA } from "../_utils/status-config";
import { QuoteStatusBadge } from "./quote-status-badge";

type QuoteListItemProps = {
  quote: QuoteListItemSchema;
};

export function QuoteListItem({ quote }: QuoteListItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const cta = getStatusCTA(quote.status);

  // TODO: QuoteListItemSchema doesn't include items array yet
  // Will show preview once schema is updated with modelImageUrl and windowType
  const hasItemsPreview = false; // Change to true when schema is updated

  // Handle CTA actions
  const handleCTAClick = () => {
    if (!cta) {
      return;
    }

    setLoadingAction(cta.action);

    startTransition(() => {
      switch (cta.action) {
        case "edit":
          router.push(`/my-quotes/${quote.id}`);
          break;
        case "view":
          router.push(`/my-quotes/${quote.id}`);
          break;
        case "duplicate":
          // TODO: Implement duplicate functionality in future US
          router.push(`/my-quotes/${quote.id}`);
          break;
        case "resend":
          // TODO: Implement resend functionality in future US
          router.push(`/my-quotes/${quote.id}`);
          break;
        default:
          // Unknown action - do nothing
          setLoadingAction(null);
          break;
      }
    });
  };

  // Icon mapping for CTA actions
  const ctaIcon = {
    duplicate: Copy,
    edit: Edit3,
    resend: Eye,
    view: Eye,
  };

  const CTAIcon = cta ? ctaIcon[cta.action] : Eye;

  const isLoading = isPending && loadingAction !== null;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        quote.isExpired && "opacity-60",
        isLoading && "opacity-50 ring-2 ring-primary/20"
      )}
      data-testid="quote-list-item"
    >
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{quote.projectName}</h3>

            {/* US1: New QuoteStatusBadge with icon and tooltip */}
            <QuoteStatusBadge
              showIcon={true}
              showTooltip={true}
              size="default"
              status={quote.status}
            />

            {quote.isExpired && (
              <Badge
                className="text-muted-foreground"
                data-testid="expired-badge"
                variant="outline"
              >
                Expirada
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <div>
              <span className="font-medium">Creada:</span>{" "}
              {formatDate(quote.createdAt)}
            </div>
            {quote.validUntil && (
              <div>
                <span className="font-medium">Válida hasta:</span>{" "}
                {formatDate(quote.validUntil)}
              </div>
            )}
            <div>
              <span className="font-medium">Items:</span> {quote.itemCount}
            </div>
          </div>

          {/* US2: Product image preview (TODO: Enable when schema includes items) */}
          {hasItemsPreview && (
            <div className="mt-3">
              {/* <QuoteItemPreview items={previewItems} totalCount={quote.itemCount} /> */}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-muted-foreground text-sm">Total</div>
            <div className="font-bold text-lg">
              {formatCurrency(quote.total, {
                currency: quote.currency,
                decimals: quote.currency === "USD" ? 2 : 0,
                locale: quote.currency === "USD" ? "es-PA" : "es-CO",
              })}
            </div>
          </div>

          {/* US1: Dynamic CTA button based on status */}
          <Button disabled={isLoading} onClick={handleCTAClick} size="sm">
            {isLoading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Cargando...
              </>
            ) : (
              <>
                <CTAIcon className="mr-2 h-4 w-4" />
                {cta?.label ?? "Ver detalles"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
