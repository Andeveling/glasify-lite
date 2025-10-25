'use client';

/**
 * QuoteDetailView Component (Public User Version)
 *
 * Displays full quote details including items table, project address,
 * contact information, and validity dates.
 *
 * This version is for the public-facing user quote view.
 *
 * Updated with QuoteStatusBadge component (US1) for better status clarity.
 */

import { Building2, Calendar, Clock, MapPin, Package, Phone } from 'lucide-react';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BackLink } from '@/components/ui/back-link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useTenantConfig } from '@/providers/tenant-config-provider';
import type { QuoteDetailSchema } from '@/server/api/routers/quote/quote.schemas';
import { WindowType } from '@/types/window.types';
import { QuoteStatusBadge } from '../../_components/quote-status-badge';
import { QuoteExportButtons } from './quote-export-buttons';
import { type QuoteItemData, QuoteItemsGrid } from './quote-items-grid';
import { SendQuoteButton } from './send-quote-button';

type QuoteDetailViewProps = {
  quote: QuoteDetailSchema;
  /** Whether this is the public user view (vs admin dashboard view) */
  isPublicView?: boolean;
};

export function QuoteDetailView({ isPublicView = false, quote }: QuoteDetailViewProps) {
  const { locale, timezone } = useTenantConfig();
  const backLink = isPublicView ? '/my-quotes' : '/quotes';
  const backLabel = isPublicView ? 'Volver a mis cotizaciones' : 'Volver a cotizaciones';

  // Transform quote items for grid display
  // TODO: Add modelImageUrl and windowType to QuoteItemDetailSchema
  const gridItems: QuoteItemData[] = quote.items.map((item) => ({
    glassType: item.glassTypeName,
    height: item.heightMm ? Math.round(item.heightMm / 10) : null,
    id: item.id,
    manufacturer: quote.manufacturerName,
    modelImageUrl: null, // TODO: Add to schema
    modelName: item.modelName,
    width: item.widthMm ? Math.round(item.widthMm / 10) : null, // Convert mm to cm
    windowType: WindowType.FIXED_SINGLE, // TODO: Add to schema
  }));

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso y exportación */}
      <div className="flex items-center justify-between gap-4">
        <BackLink href={backLink} icon="chevron" variant="link">
          {backLabel}
        </BackLink>

        <div className="flex items-center gap-2">
          {/* Send quote button - only for draft quotes */}
          <SendQuoteButton quote={quote} />

          {/* Export buttons - US3 */}
          {isPublicView && <QuoteExportButtons quoteId={quote.id} size="sm" variant="full" />}
        </div>
      </div>

      {/* Enhanced confirmation message for sent quotes (US3) */}
      {quote.status === 'sent' && quote.sentAt && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            Cotización enviada el {formatDate(quote.sentAt, locale, timezone)}
          </AlertTitle>
          <AlertDescription className="space-y-2 text-blue-700 dark:text-blue-300">
            <p>El fabricante ha recibido tu solicitud y se pondrá en contacto contigo pronto.</p>

            <div className="flex items-start gap-2 text-sm">
              <Clock className="mt-0.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <p>
                <span className="font-medium">Tiempo de respuesta:</span> Recibirás una respuesta en 24-48 horas hábiles
              </p>
            </div>

            {quote.vendorContactPhone && (
              <div className="flex items-start gap-2 text-sm">
                <Phone className="mt-0.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <p>
                  <span className="font-medium">Contacto del fabricante:</span> {quote.vendorContactPhone}
                </p>
              </div>
            )}

            <p className="text-blue-600 text-xs dark:text-blue-400">
              Mientras tanto, puedes revisar otras cotizaciones o crear una nueva.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Información principal de la cotización */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">{quote.projectAddress.projectName}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Creada el {formatDate(quote.createdAt, locale, timezone)}
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <QuoteStatusBadge showIcon={true} showTooltip={true} size="default" status={quote.status} />
              {quote.isExpired && (
                <Badge className="border-destructive text-destructive" variant="outline">
                  Vencida
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          {/* Fabricante */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-muted-foreground text-xs">Fabricante</p>
              <p className="font-semibold leading-tight">{quote.manufacturerName}</p>
            </div>
          </div>

          {/* Dirección del proyecto */}
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-muted-foreground text-xs">Dirección del proyecto</p>
              <p className="font-semibold leading-tight">{quote.projectAddress.projectStreet}</p>
              <p className="text-muted-foreground text-sm">
                {quote.projectAddress.projectCity}, {quote.projectAddress.projectState}{' '}
                {quote.projectAddress.projectPostalCode}
              </p>
            </div>
          </div>

          {/* Contacto (si existe) */}
          {quote.contactPhone && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/30">
                <Phone className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium text-muted-foreground text-xs">Teléfono de contacto</p>
                <p className="font-semibold leading-tight">{quote.contactPhone}</p>
              </div>
            </div>
          )}

          {/* Validez */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
              <Clock className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-muted-foreground text-xs">Válida hasta</p>
              <p className="font-semibold leading-tight">
                {quote.validUntil ? formatDate(quote.validUntil, locale, timezone) : 'Sin límite'}
              </p>
            </div>
          </div>

          {/* Total de unidades */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-1/20">
              <Package className="h-4 w-4 text-chart-1" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-muted-foreground text-xs">Total de unidades</p>
              <p className="font-semibold leading-tight">{quote.totalUnits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* US2: Visual product grid with thumbnails */}
      {gridItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista de productos</CardTitle>
            <CardDescription>Haga clic en una imagen para ver detalles completos</CardDescription>
          </CardHeader>
          <CardContent>
            <QuoteItemsGrid eager items={gridItems} />
          </CardContent>
        </Card>
      )}

      {/* Tabla de items */}
      <Card>
        <CardHeader>
          <CardTitle>Items de la cotización</CardTitle>
          <CardDescription>
            {quote.itemCount} {quote.itemCount === 1 ? 'item' : 'items'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo de vidrio</TableHead>
                <TableHead>Solución</TableHead>
                <TableHead>Dimensiones (mm)</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.modelName}</TableCell>
                  <TableCell>{item.glassTypeName}</TableCell>
                  <TableCell>{item.solutionName ?? '—'}</TableCell>
                  <TableCell>
                    {item.widthMm} × {item.heightMm}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice, {
                      currency: quote.currency,
                      decimals: quote.currency === 'USD' ? 2 : 0,
                      locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.subtotal, {
                      currency: quote.currency,
                      decimals: quote.currency === 'USD' ? 2 : 0,
                      locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total */}
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="font-bold text-2xl">
                {formatCurrency(quote.total, {
                  currency: quote.currency,
                  decimals: quote.currency === 'USD' ? 2 : 0,
                  locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota para usuarios */}
      {isPublicView && (
        <Card className="border-muted bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">
              <strong>Nota:</strong> Esta cotización tiene una validez de{' '}
              {quote.validUntil ? `hasta el ${formatDate(quote.validUntil, locale, timezone)}` : 'sin límite'}. Los
              precios están bloqueados al momento de la generación de la cotización.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
