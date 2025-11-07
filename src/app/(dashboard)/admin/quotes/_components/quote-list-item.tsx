/**
 * Quote List Item Component (US1 - T013, US2 - T018, US4 - T024)
 *
 * Displays individual quote card in the list
 * UI-only component (< 100 lines)
 *
 * Features:
 * - Project name, total, creation date
 * - User name display with role badge (US4)
 * - Status and expiration badges (US2)
 * - Link to detail page
 * - Uses centralized formatters from @lib/format
 * - Respects TenantConfig for currency and locale
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateMedium } from "@/lib/format";
import { useTenantConfig } from "@/providers/tenant-config-provider";
import type { QuoteListItem as QuoteItem } from "../_types/quote-list.types";
import { QuoteExpirationBadge } from "./quote-expiration-badge";
import { QuoteRoleBadge } from "./quote-role-badge";
import { QuoteStatusBadge } from "./quote-status-badge";

type QuoteListItemProps = {
  quote: QuoteItem;
};

export function QuoteListItem({ quote }: QuoteListItemProps) {
  const tenantConfig = useTenantConfig();

  const userName =
    quote.user?.name || quote.user?.email || "Usuario desconocido";
  const formattedDate = formatDateMedium(quote.createdAt, tenantConfig);
  const formattedTotal = formatCurrency(quote.total, {
    context: tenantConfig,
  });

  return (
    <Link href={`/admin/quotes/${quote.id}`}>
      <Card className="transition-colors hover:bg-accent">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {quote.projectName || "Sin nombre"}
            </CardTitle>
            <div className="flex shrink-0 gap-1">
              <QuoteStatusBadge status={quote.status} />
              <QuoteExpirationBadge validUntil={quote.validUntil} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total</span>
            <span className="font-semibold">{formattedTotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Cliente</span>
            <div className="flex items-center truncate text-sm">
              <span className="truncate">{userName}</span>
              {quote.user && <QuoteRoleBadge role={quote.user.role} />}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Fecha</span>
            <span className="text-sm">{formattedDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
