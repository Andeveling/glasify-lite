'use client'

import { Loader2 } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/trpc/react'
import type { WizardFormValues } from '../wizard-form-schema'

interface ConfirmStepProps {
  mode: 'draft' | 'persisted'
  quoteId?: string
  onSuccess: () => void
  onDraftConfirm?: (item: WizardFormValues) => void
}

function PersistedConfirmStep({ quoteId, onSuccess }: { quoteId: string; onSuccess: () => void }) {
  const form = useFormContext<WizardFormValues>()

  const mutation = api.quote['add-item'].useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleConfirm = async () => {
    const values = form.getValues()
    const payload = {
      adjustments: [],
      clientId: '',
      colorId: values.colorId ?? undefined,
      glassTypeId: values.glassTypeId,
      heightMm: values.heightMm,
      modelId: values.modelId,
      quantity: values.quantity,
      quoteId,
      roomLocation: values.roomLocation ?? undefined,
      services: (values.serviceIds ?? []).map((serviceId: string) => ({
        quantity: 1,
        serviceId,
        unit: 'unit' as const,
      })),
      unit: 'unit' as const,
      widthMm: values.widthMm,
    }

    await mutation.mutateAsync(payload)
  }

  return (
    <>
      {mutation.error && <p className="text-destructive text-sm">{mutation.error.message}</p>}
      <Button
        className="w-full"
        disabled={mutation.isPending}
        onClick={() => void handleConfirm()}
        type="button"
      >
        {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Confirmar
      </Button>
    </>
  )
}

function DraftConfirmStep({
  onSuccess,
  onDraftConfirm,
}: {
  onSuccess: () => void
  onDraftConfirm?: (item: WizardFormValues) => void
}) {
  const form = useFormContext<WizardFormValues>()

  const handleConfirm = () => {
    const values = form.getValues()
    onDraftConfirm?.(values)
    onSuccess()
  }

  return (
    <Button className="w-full" onClick={() => void handleConfirm()} type="button">
      Confirmar
    </Button>
  )
}

function ConfirmStep({ mode, quoteId, onSuccess, onDraftConfirm }: ConfirmStepProps) {
  const form = useFormContext<WizardFormValues>()
  const values = useWatch({ control: form.control })

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
              <SummaryRow label="Dimensiones" value={`${values.widthMm} × ${values.heightMm} mm`} />
              <SummaryRow
                label="Configurado"
                value={`${values.configuredWidthMm} × ${values.configuredHeightMm} mm`}
              />
              <SummaryRow label="Cantidad" value={String(values.quantity)} />
              {values.roomLocation && <SummaryRow label="Ambiente" value={values.roomLocation} />}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Configuración
            </h4>
            <div className="space-y-2">
              <SummaryRow label="Modelo" value={values.modelId || '—'} />
              <SummaryRow label="Color" value={values.colorId ?? 'Sin color'} />
              <SummaryRow label="Vidrio" value={values.glassTypeId || '—'} />
              <SummaryRow
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

export { ConfirmStep }
