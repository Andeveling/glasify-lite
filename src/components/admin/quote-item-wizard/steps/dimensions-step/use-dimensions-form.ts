'use client'

import { useFormContext } from 'react-hook-form'

import type { WizardFormValues } from '../../../wizard-form-schema'

function useDimensionsForm() {
  const form = useFormContext<WizardFormValues>()
  return form
}

export { useDimensionsForm }
