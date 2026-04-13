'use client'

import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { WizardFormValues } from '../../../wizard-form-schema'

function useMaterialSelection() {
  const form = useFormContext<WizardFormValues>()
  const modelId = useWatch({ control: form.control, name: 'modelId' })
  const selectedColorId = useWatch({ control: form.control, name: 'colorId' })
  const selectedGlassTypeId = useWatch({ control: form.control, name: 'glassTypeId' })

  const handleColorSelect = useCallback(
    (colorId: string) => {
      form.setValue('colorId', selectedColorId === colorId ? undefined : colorId)
    },
    [form, selectedColorId],
  )

  const handleGlassTypeSelect = useCallback(
    (glassTypeId: string) => {
      form.setValue('glassTypeId', glassTypeId, { shouldValidate: true })
    },
    [form],
  )

  return {
    modelId,
    selectedColorId,
    selectedGlassTypeId,
    handleColorSelect,
    handleGlassTypeSelect,
    hasModel: Boolean(modelId),
  }
}

export { useMaterialSelection }
