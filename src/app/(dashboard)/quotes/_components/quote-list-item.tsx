/**
 * QuoteListItem Component
 *
 * Displays a single quote row in the quotes list with status badge,
 * date, total amount, and item count.
 *
 * Task: T069 [P] [US5]
 * User Story: US5 - Access and view quote history
 */

import { Eye } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { useTenantConfig } from '@/providers/tenant-config-provider';
import type { QuoteListItemSchema } from '@/server/api/routers/quote/quote.schemas';
import { QuoteStatusBadge } from './quote-status-badge';

type QuoteListItemProps = {
  quote: QuoteListItemSchema;
};

export function QuoteListItem({ quote }: QuoteListItemProps) {
  const { locale, timezone } = useTenantConfig();

  return (
    <Card className={cn('transition-opacity', quote.isExpired && 'opacity-60')} data-testid="quote-list-item">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{quote.projectName}</h3>
            <QuoteStatusBadge status={quote.status} />
            {quote.isExpired && (
              <Badge className="text-muted-foreground" data-testid="expired-badge" variant="outline">
                Expirada
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            {quote.status === 'sent' && quote.sentAt ? (
              <div>
                <span className="font-medium">Enviada:</span> {formatDate(quote.sentAt, locale, timezone)}
              </div>
            ) : (
              <div>
                <span className="font-medium">Creada:</span> {formatDate(quote.createdAt, locale, timezone)}
              </div>
            )}
            {quote.validUntil && (
              <div>
                <span className="font-medium">Válida hasta:</span> {formatDate(quote.validUntil, locale, timezone)}
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
            <Link href={`/quotes/${quote.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
