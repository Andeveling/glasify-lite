/**
 * QuoteListItem Component (Public User Version)
 *
 * Displays a single quote row in the user's quotes list with status badge,
 * date, total amount, and item count.
 *
 * This version links to the public quote detail page, not the admin dashboard.
 */

import { Eye } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';

import type { QuoteListItemSchema } from '@/server/api/routers/quote/quote.schemas';

type QuoteListItemProps = {
  quote: QuoteListItemSchema;
};

const statusConfig = {
  canceled: {
    label: 'Cancelada',
    variant: 'destructive' as const,
  },
  draft: {
    label: 'Borrador',
    variant: 'secondary' as const,
  },
  sent: {
    label: 'Enviada',
    variant: 'default' as const,
  },
} as const;

export function QuoteListItem({ quote }: QuoteListItemProps) {
  const statusInfo = statusConfig[quote.status];

  return (
    <Card className={cn('transition-opacity', quote.isExpired && 'opacity-60')} data-testid="quote-list-item">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{quote.projectName}</h3>
            <Badge data-testid="quote-status-badge" variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
            {quote.isExpired && (
              <Badge className="text-muted-foreground" data-testid="expired-badge" variant="outline">
                Expirada
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <div>
              <span className="font-medium">Creada:</span> {formatDate(quote.createdAt)}
            </div>
            {quote.validUntil && (
              <div>
                <span className="font-medium">Válida hasta:</span> {formatDate(quote.validUntil)}
              </div>
            )}
            <div>
              <span className="font-medium">Items:</span> {quote.itemCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-muted-foreground text-sm">Total</div>
            <div className="font-bold text-lg">
              {formatCurrency(quote.total, {
                currency: quote.currency,
                decimals: quote.currency === 'USD' ? 2 : 0,
                locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
              })}
            </div>
          </div>

          <Button asChild size="sm">
            <Link href={`/my-quotes/${quote.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
