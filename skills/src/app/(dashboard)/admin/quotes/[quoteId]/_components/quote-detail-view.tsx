'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QuoteItemWizard } from '@/components/admin/quote-item-wizard'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import type { QuoteDetailSchema } from '@/server/api/routers/quote/quote.schemas'
import { api } from '@/trpc/react'
import { QuoteStatusBadge } from '../../_components/quote-status-badge'

type QuoteDetailViewProps = {
  isPublicView?: boolean
  quote: QuoteDetailSchema
}

export function QuoteDetailView({ isPublicView = false, quote }: QuoteDetailViewProps) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)
  const utils = api.useUtils()

  const handleWizardSuccess = () => {
    setWizardOpen(false)
    void utils.quote['get-by-id'].invalidate({ id: quote.id })
    router.refresh()
  }

  const formatContext = {
    currency: quote.currency,
    locale: 'es-PA',
    timezone: 'America/Panama',
  }

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl">{quote.projectName}</h2>
          <p className="text-muted-foreground text-sm">
            Cotización #{quote.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <QuoteStatusBadge status={quote.status} />
          {!isPublicView && (
            <Button onClick={() => setWizardOpen(true)} size="sm">
              <Plus className="mr-2 size-4" />
              Agregar ítem
            </Button>
          )}
        </div>
      </div>

      {/* Project Address */}
      <div className="rounded-lg border p-4">
        <h3 className="font-medium text-sm">Dirección del Proyecto</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {quote.projectAddress.projectStreet}, {quote.projectAddress.projectCity},{' '}
          {quote.projectAddress.projectState}
        </p>
      </div>

      {/* Quote Items */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Vidrio</TableHead>
              <TableHead className="text-right">Ancho</TableHead>
              <TableHead className="text-right">Alto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.glassTypeName}</TableCell>
                <TableCell className="text-right">{item.widthMm} mm</TableCell>
                <TableCell className="text-right">{item.heightMm} mm</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitPrice, { context: formatContext })}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.subtotal, { context: formatContext })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="rounded-lg border p-4 text-right">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="font-bold text-2xl">
            {formatCurrency(quote.total, { context: formatContext })}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {quote.totalUnits} unidades en {quote.itemCount} ítems
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex justify-between text-muted-foreground text-xs">
        <p>
          Creada: {new Date(quote.createdAt).toLocaleDateString('es-CO')}
          {quote.validUntil && (
            <span> • Válida hasta: {new Date(quote.validUntil).toLocaleDateString('es-CO')}</span>
          )}
        </p>
        {quote.isExpired && <span className="text-destructive">Esta cotización ha expirado</span>}
      </div>

      {/* Add Item Wizard */}
      {quote.client && (
        <QuoteItemWizard
          clientId={quote.client.id}
          open={wizardOpen}
          quoteId={quote.id}
          onOpenChange={setWizardOpen}
          onSuccess={handleWizardSuccess}
        />
      )}
    </div>
  )
}
