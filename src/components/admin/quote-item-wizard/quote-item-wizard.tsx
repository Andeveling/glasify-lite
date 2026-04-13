'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const stepperRef = useRef(stepper)
  const formRef = useRef(form)

  useEffect(() => {
    stepperRef.current = stepper
    formRef.current = form
  })

  useEffect(() => {
    if (!open) {
      formRef.current.reset()
      stepperRef.current.reset()
    }
  }, [open])

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
        className="max-w-[90vw] lg:max-w-6xl xl:max-w-7xl h-[90vh] p-0 flex flex-col overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold">
            {editItem ? 'Editar ítem' : 'Agregar ítem'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6">
              <StepIndicator
                currentStep={stepper.currentStep}
                totalSteps={TOTAL_STEPS}
                visitedSteps={stepper.visitedSteps}
              />
            </div>

            <div className="flex flex-1 gap-6 px-6 overflow-hidden">
              <ScrollArea className="flex-1 pb-6">{renderStep()}</ScrollArea>
              <aside className="w-80 shrink-0">
                <ScrollArea className="h-full pb-6">
                  <div className="sticky top-0">
                    <RunningSummary />
                  </div>
                </ScrollArea>
              </aside>
            </div>

            <div className="sticky bottom-0 z-10 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-4">
              <div className="flex justify-between gap-4">
                {!stepper.isFirstStep && (
                  <Button onClick={stepper.goBack} type="button" variant="outline" size="lg">
                    Volver
                  </Button>
                )}
                {!stepper.isLastStep && (
                  <Button
                    className="ml-auto"
                    onClick={() => void stepper.goNext()}
                    type="button"
                    size="lg"
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { QuoteItemWizard }
