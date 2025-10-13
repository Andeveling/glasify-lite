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

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { QuoteDetailSchema } from '@/server/api/routers/quote/quote.schemas';
import { WindowType } from '@/types/window.types';
import { QuoteStatusBadge } from '../../_components/quote-status-badge';
import { QuoteExportButtons } from './quote-export-buttons';
import { type QuoteItemData, QuoteItemsGrid } from './quote-items-grid';

type QuoteDetailViewProps = {
  quote: QuoteDetailSchema;
  /** Whether this is the public user view (vs admin dashboard view) */
  isPublicView?: boolean;
};

export function QuoteDetailView({ isPublicView = false, quote }: QuoteDetailViewProps) {
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
        <Button asChild size="sm" variant="outline">
          <Link href={backLink}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        {/* Export buttons - US3 */}
        {isPublicView && <QuoteExportButtons quoteId={quote.id} size="sm" variant="full" />}
      </div>

      {/* Información principal de la cotización */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{quote.projectAddress.projectName}</CardTitle>
              <CardDescription>Creada el {formatDate(quote.createdAt)}</CardDescription>
            </div>

            {/* US1: New QuoteStatusBadge with icon and tooltip */}
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
              <p className="font-medium">{quote.validUntil ? formatDate(quote.validUntil) : 'Sin límite'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total de unidades</p>
              <p className="font-medium">{quote.totalUnits}</p>
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
              {quote.validUntil ? `hasta el ${formatDate(quote.validUntil)}` : 'sin límite'}. Los precios están
              bloqueados al momento de la generación de la cotización.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
