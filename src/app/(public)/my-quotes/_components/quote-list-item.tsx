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
 */

'use client';

import { Edit3, Eye, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { QuoteStatusBadge } from './quote-status-badge';
import { getStatusCTA } from '../_utils/status-config';
import { QuoteItemPreview, type QuoteItemPreviewData } from './quote-item-preview';
import { WindowType } from '@/types/window.types';

import type { QuoteListItemSchema } from '@/server/api/routers/quote/quote.schemas';

type QuoteListItemProps = {
  quote: QuoteListItemSchema;
};

export function QuoteListItem({ quote }: QuoteListItemProps) {
  const router = useRouter();
  const cta = getStatusCTA(quote.status);
  
  // TODO: QuoteListItemSchema doesn't include items array yet
  // Will show preview once schema is updated with modelImageUrl and windowType
  const hasItemsPreview = false; // Change to true when schema is updated
  
  // Handle CTA actions
  const handleCTAClick = () => {
    if (!cta) return;
    
    switch (cta.action) {
      case 'edit':
        router.push(`/my-quotes/${quote.id}`);
        break;
      case 'view':
        router.push(`/my-quotes/${quote.id}`);
        break;
      case 'duplicate':
        // TODO: Implement duplicate functionality in future US
        router.push(`/my-quotes/${quote.id}`);
        break;
      case 'resend':
        // TODO: Implement resend functionality in future US
        router.push(`/my-quotes/${quote.id}`);
        break;
    }
  };
  
  // Icon mapping for CTA actions
  const ctaIcon = {
    edit: Edit3,
    view: Eye,
    duplicate: Copy,
    resend: Eye,
  };
  
  const CTAIcon = cta ? ctaIcon[cta.action] : Eye;

  return (
    <Card className={cn('transition-opacity', quote.isExpired && 'opacity-60')} data-testid="quote-list-item">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{quote.projectName}</h3>
            
            {/* US1: New QuoteStatusBadge with icon and tooltip */}
            <QuoteStatusBadge 
              status={quote.status} 
              showIcon={true} 
              showTooltip={true}
              size="default"
            />
            
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
                decimals: quote.currency === 'USD' ? 2 : 0,
                locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
              })}
            </div>
          </div>

          {/* US1: Dynamic CTA button based on status */}
          <Button onClick={handleCTAClick} size="sm">
            <CTAIcon className="mr-2 h-4 w-4" />
            {cta?.label ?? 'Ver detalles'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
