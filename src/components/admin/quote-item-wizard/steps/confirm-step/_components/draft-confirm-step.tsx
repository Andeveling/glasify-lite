'use client'

import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import type { WizardFormValues } from '../../../../wizard-form-schema'

interface DraftConfirmStepProps {
  onSuccess: () => void
  onDraftConfirm?: (item: WizardFormValues) => void
}

function DraftConfirmStep({ onSuccess, onDraftConfirm }: DraftConfirmStepProps) {
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

export { DraftConfirmStep }
