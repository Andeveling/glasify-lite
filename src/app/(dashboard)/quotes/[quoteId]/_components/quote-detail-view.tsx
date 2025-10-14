/**
 * QuoteDetailView Component
 *
 * Displays full quote details including items table, manufacturer, project address,
 * contact information, and validity dates.
 *
 * @module app/(dashboard)/quotes/[quoteId]/_components/quote-detail-view
 */

import { ArrowLeft, Clock, Phone } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useTenantConfig } from '@/providers/tenant-config-provider';
import type { QuoteDetailSchema } from '@/server/api/routers/quote/quote.schemas';
import { QuoteStatusBadge } from '../../_components/quote-status-badge';
import { SendQuoteButton } from './send-quote-button';

type QuoteDetailViewProps = {
  quote: QuoteDetailSchema;
};

export function QuoteDetailView({ quote }: QuoteDetailViewProps) {
  const { locale, timezone } = useTenantConfig();

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso y acción de envío */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild size="sm" variant="outline">
          <Link href="/quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cotizaciones
          </Link>
        </Button>

        {/* Show send button only for draft quotes */}
        <SendQuoteButton quote={quote} />
      </div>

      {/* Enhanced confirmation message for sent quotes (US3) */}
      {quote.status === 'sent' && quote.sentAt && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <div className="space-y-3">
            {/* Title with sent date */}
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Cotización enviada el {formatDate(quote.sentAt, locale, timezone)}
              </p>
              <p className="text-blue-700 text-sm dark:text-blue-300">
                El fabricante ha recibido tu solicitud y se pondrá en contacto contigo pronto.
              </p>
            </div>

            {/* Timeline expectation */}
            <div className="flex items-start gap-2 text-sm">
              <Clock className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Tiempo de respuesta:</span> Recibirás una respuesta en 24-48 horas hábiles
              </p>
            </div>

            {/* Vendor contact (if available) */}
            {quote.vendorContactPhone && (
              <div className="flex items-start gap-2 text-sm">
                <Phone className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Contacto del fabricante:</span> {quote.vendorContactPhone}
                </p>
              </div>
            )}

            {/* Next steps */}
            <p className="text-blue-600 text-xs dark:text-blue-400">
              Mientras tanto, puedes revisar otras cotizaciones o crear una nueva.
            </p>
          </div>
        </div>
      )}

      {/* Información principal de la cotización */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{quote.projectAddress.projectName}</CardTitle>
              <CardDescription>Creada el {formatDate(quote.createdAt, locale, timezone)}</CardDescription>
            </div>
            <div className="flex gap-2">
              <QuoteStatusBadge status={quote.status} />
              {quote.isExpired && (
                <Badge className="border-destructive text-destructive" variant="outline">
                  Vencida
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fabricante */}
          <div>
            <p className="text-muted-foreground text-sm">Fabricante</p>
            <p className="font-medium">{quote.manufacturerName}</p>
          </div>

          {/* Dirección del proyecto */}
          <div>
            <p className="text-muted-foreground text-sm">Dirección del proyecto</p>
            <p className="font-medium">{quote.projectAddress.projectStreet}</p>
            <p className="text-sm">
              {quote.projectAddress.projectCity}, {quote.projectAddress.projectState}{' '}
              {quote.projectAddress.projectPostalCode}
            </p>
          </div>

          {/* Contacto (opcional) */}
          {quote.contactPhone && (
            <div>
              <p className="text-muted-foreground text-sm">Teléfono de contacto</p>
              <p className="font-medium">{quote.contactPhone}</p>
            </div>
          )}

          {/* Validez */}
          <div className="flex gap-8">
            <div>
              <p className="text-muted-foreground text-sm">Válida hasta</p>
              <p className="font-medium">
                {quote.validUntil ? formatDate(quote.validUntil, locale, timezone) : 'Sin límite'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total de unidades</p>
              <p className="font-medium">{quote.totalUnits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
