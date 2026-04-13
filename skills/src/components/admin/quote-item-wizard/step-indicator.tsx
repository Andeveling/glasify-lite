'use client'

import { Check } from 'lucide-react'

interface StepIndicatorProps {
  totalSteps: number
  currentStep: number
  visitedSteps?: Set<number>
}

const STEP_LABELS = ['Dimensiones', 'Modelo', 'Material', 'Servicios', 'Confirmar'] as const

export function StepIndicator({
  totalSteps,
  currentStep,
  visitedSteps = new Set(),
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = visitedSteps.has(i) && i < currentStep
        const isCurrent = i === currentStep

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: step indicators maintain fixed order
          <div key={`step-${i}`} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                isCurrent
                  ? 'bg-primary text-primary-foreground scale-110'
                  : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {isCompleted ? <Check className="size-4" /> : i + 1}
            </div>
            <span
              className={`text-xs text-center ${
                isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {STEP_LABELS[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
