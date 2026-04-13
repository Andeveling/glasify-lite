'use client'

import { useFormContext } from 'react-hook-form'

import type { WizardFormValues } from '../../../wizard-form-schema'

function useServiceSelection() {
  const form = useFormContext<WizardFormValues>()
  const selectedServiceIds = form.watch('serviceIds')

  const handleToggleService = (serviceId: string) => {
    const current = selectedServiceIds ?? []
    if (current.includes(serviceId)) {
      form.setValue(
        'serviceIds',
        current.filter((id) => id !== serviceId),
        { shouldValidate: true },
      )
    } else {
      form.setValue('serviceIds', [...current, serviceId], { shouldValidate: true })
    }
  }

  return {
    selectedServiceIds,
    handleToggleService,
  }
}

export { useServiceSelection }
