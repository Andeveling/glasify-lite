'use client'

import { useCallback, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export function useWizardStepper<T extends Record<string, unknown>>(
  totalSteps: number,
  stepFields: Record<number, (keyof T)[]>,
  form: UseFormReturn<T>,
) {
  const [currentStep, setCurrentStep] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]))

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
    setVisitedSteps((prev) => new Set([...prev, step]))
  }, [])

  const goNext = useCallback(async () => {
    const fieldsToValidate = stepFields[currentStep] as (keyof T)[]
    await form.trigger(fieldsToValidate as Parameters<typeof form.trigger>[0])
    if (Object.keys(form.formState.errors).length === 0) {
      setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
      setVisitedSteps((prev) => new Set([...prev, currentStep + 1]))
    }
  }, [currentStep, stepFields, form, totalSteps])

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setVisitedSteps(new Set([0]))
  }, [])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1
  const hasVisited = (step: number) => visitedSteps.has(step)

  return {
    currentStep,
    goToStep,
    goNext,
    goBack,
    reset,
    isFirstStep,
    isLastStep,
    hasVisited,
    visitedSteps,
    progress: {
      current: currentStep + 1,
      total: totalSteps,
      percentage: ((currentStep + 1) / totalSteps) * 100,
    },
  }
}
