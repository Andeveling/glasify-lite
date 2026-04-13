'use client'

import { useWatch } from 'react-hook-form'

import { Card, CardContent } from '@/components/ui/card'
import type { WizardFormValues } from '../../wizard-form-schema'

import { ConfirmSummaryRow } from './_components/confirm-summary-row'
import { DraftConfirmStep } from './_components/draft-confirm-step'
import { PersistedConfirmStep } from './_components/persisted-confirm-step'

interface ConfirmStepProps {
  mode: 'draft' | 'persisted'
  quoteId?: string
  onSuccess: () => void
  onDraftConfirm?: (item: WizardFormValues) => void
}

function ConfirmStep({ mode, quoteId, onSuccess, onDraftConfirm }: ConfirmStepProps) {
  const values = useWatch() as WizardFormValues

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Confirmar ítem</h2>
        <p className="text-sm text-muted-foreground">
          Revisá los datos antes de agregar el ítem a la cotización
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Dimensiones y cantidad
            </h4>
            <div className="space-y-2">
              <ConfirmSummaryRow
                label="Dimensiones"
                value={`${values.widthMm} × ${values.heightMm} mm`}
              />
              <ConfirmSummaryRow
                label="Configurado"
                value={`${values.configuredWidthMm} × ${values.configuredHeightMm} mm`}
              />
              <ConfirmSummaryRow label="Cantidad" value={String(values.quantity)} />
              {values.roomLocation && (
                <ConfirmSummaryRow label="Ambiente" value={values.roomLocation} />
              )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Configuración
            </h4>
            <div className="space-y-2">
              <ConfirmSummaryRow label="Modelo" value={values.modelId || '—'} />
              <ConfirmSummaryRow label="Color" value={values.colorId ?? 'Sin color'} />
              <ConfirmSummaryRow label="Vidrio" value={values.glassTypeId || '—'} />
              <ConfirmSummaryRow
                label="Servicios"
                value={
                  (values.serviceIds?.length ?? 0) > 0
                    ? `${values.serviceIds?.length} servicios`
                    : 'Sin servicios'
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === 'persisted' && quoteId ? (
        <PersistedConfirmStep onSuccess={onSuccess} quoteId={quoteId} />
      ) : (
        <DraftConfirmStep onDraftConfirm={onDraftConfirm} onSuccess={onSuccess} />
      )}
    </div>
  )
}

export { ConfirmStep }
export type { ConfirmStepProps }
