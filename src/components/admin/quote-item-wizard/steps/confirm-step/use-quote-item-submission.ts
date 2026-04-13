'use client'

import { useFormContext } from 'react-hook-form'

import type { WizardFormValues } from '../../../wizard-form-schema'

function useQuoteItemSubmission() {
  const form = useFormContext<WizardFormValues>()

  const buildPayload = (quoteId: string) => ({
    adjustments: [],
    clientId: '',
    colorId: form.getValues('colorId') ?? undefined,
    glassTypeId: form.getValues('glassTypeId'),
    heightMm: form.getValues('heightMm'),
    modelId: form.getValues('modelId'),
    quantity: form.getValues('quantity'),
    quoteId,
    roomLocation: form.getValues('roomLocation') ?? undefined,
    services: (form.getValues('serviceIds') ?? []).map((serviceId: string) => ({
      quantity: 1,
      serviceId,
      unit: 'unit' as const,
    })),
    unit: 'unit' as const,
    widthMm: form.getValues('widthMm'),
  })

  return {
    form,
    buildPayload,
  }
}

export { useQuoteItemSubmission }
