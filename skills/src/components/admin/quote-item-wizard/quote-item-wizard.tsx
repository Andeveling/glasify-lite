'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useWizardStepper } from '@/hooks/use-wizard-stepper'
import type { QuoteItemDetailSchema } from '@/server/api/routers/quote/quote.schemas'
import { RunningSummary } from './running-summary'
import { StepIndicator } from './step-indicator'
import { ConfirmStep } from './steps/confirm-step'
import { DimensionsStep } from './steps/dimensions-step'
import { MaterialGlassStep } from './steps/material-glass-step'
import { ModelSelectStep } from './steps/model-select-step'
import { ServicesStep } from './steps/services-step'
import { STEP_FIELDS, type WizardFormValues, wizardFormSchema } from './wizard-form-schema'

interface QuoteItemWizardProps {
  quoteId?: string
  clientId: string
  editItem?: QuoteItemDetailSchema | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  mode?: 'draft' | 'persisted'
  onDraftConfirm?: (item: WizardFormValues) => void
}

const TOTAL_STEPS = 5

function mapEditItemToDefaults(
  item: QuoteItemDetailSchema,
): Omit<WizardFormValues, 'roomLocation'> & { roomLocation?: string } {
  return {
    widthMm: item.widthMm,
    heightMm: item.heightMm,
    quantity: item.quantity,
    modelId: '',
    configuredWidthMm: item.widthMm,
    configuredHeightMm: item.heightMm,
    colorId: undefined,
    glassTypeId: '',
    serviceIds: [],
    roomLocation: '',
  }
}

function QuoteItemWizard({
  quoteId,
  editItem,
  open,
  onOpenChange,
  onSuccess,
  mode = 'persisted',
  onDraftConfirm,
}: QuoteItemWizardProps) {
  const form = useForm<z.input<typeof wizardFormSchema>, unknown, WizardFormValues>({
    defaultValues: editItem
      ? mapEditItemToDefaults(editItem)
      : {
          quantity: 1,
          serviceIds: [] as string[],
          widthMm: 0,
          heightMm: 0,
          modelId: '',
          configuredWidthMm: 0,
          configuredHeightMm: 0,
          glassTypeId: '',
          roomLocation: '',
        },
    resolver: zodResolver(wizardFormSchema),
  })

  const stepper = useWizardStepper(TOTAL_STEPS, STEP_FIELDS, form)

  useEffect(() => {
    if (!open) {
      form.reset()
      stepper.reset()
    }
  }, [open, form, stepper])

  const handleSuccess = () => {
    onOpenChange(false)
    onSuccess?.()
    form.reset()
    stepper.reset()
  }

  const renderStep = () => {
    switch (stepper.currentStep) {
      case 0:
        return <DimensionsStep />
      case 1:
        return <ModelSelectStep />
      case 2:
        return <MaterialGlassStep />
      case 3:
        return <ServicesStep />
      case 4:
        return (
          <ConfirmStep
            mode={mode}
            onDraftConfirm={onDraftConfirm}
            onSuccess={handleSuccess}
            quoteId={quoteId}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-w-[60vw] lg:max-w-6xl xl:max-w-7xl max-h-[95vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{editItem ? 'Editar ítem' : 'Agregar ítem'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6">
            <StepIndicator
              currentStep={stepper.currentStep}
              totalSteps={TOTAL_STEPS}
              visitedSteps={stepper.visitedSteps}
            />

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">{renderStep()}</div>
              <aside className="w-full lg:w-64 shrink-0">
                <div className="lg:sticky lg:top-0">
                  <RunningSummary />
                </div>
              </aside>
            </div>

            <div className="flex justify-between gap-4">
              {!stepper.isFirstStep && (
                <Button onClick={stepper.goBack} type="button" variant="outline">
                  Volver
                </Button>
              )}
              {!stepper.isLastStep && (
                <Button className="ml-auto" onClick={() => void stepper.goNext()} type="button">
                  Siguiente
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { QuoteItemWizard }
