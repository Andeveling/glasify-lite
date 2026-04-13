'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import type { WizardFormValues } from '../../../wizard-form-schema'

function useModelSelection() {
  const form = useFormContext<WizardFormValues>()

  const widthMm = useWatch({ control: form.control, name: 'widthMm' })
  const heightMm = useWatch({ control: form.control, name: 'heightMm' })
  const selectedModelId = useWatch({ control: form.control, name: 'modelId' })

  const handleSelectModel = (modelId: string) => {
    form.setValue('modelId', modelId, { shouldValidate: true })
    form.setValue('configuredWidthMm', widthMm ?? 0, { shouldValidate: true })
    form.setValue('configuredHeightMm', heightMm ?? 0, { shouldValidate: true })
  }

  return {
    widthMm,
    heightMm,
    selectedModelId,
    handleSelectModel,
    hasDimensions: Boolean(widthMm && heightMm),
  }
}

export { useModelSelection }
